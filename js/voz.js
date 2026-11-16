// js/voz.js - Motor de voz de Earth Jukebox
//
// 1) Intenta reproducir el MP3 de la carpeta voces/<idioma>/.
// 2) Si el archivo no existe (o no se puede reproducir), lee el mismo texto
//    con la voz del navegador (speechSynthesis). Nunca lanza errores.
// 3) Los textos dinámicos (temperatura, hora...) se leen con speechSynthesis.

import { VOICES, VOICES_DIR } from "./voces.js";

const SPEECH_LANG = { es: "es-ES", en: "en-US" };
const FILE_TIMEOUT_MS = 8000;

class VoiceEngine {
  constructor() {
    this.lang = "es";
    this.enabled = true;
    this.onText = null; // (texto) => void, para lectores de pantalla / braille

    this.token = 0; // cada say() nuevo invalida al anterior
    this.cancelCurrent = null;
    this.missing = new Set(); // archivos que no existen (no se reintentan)
    this.voiceCache = {};
    this.blocked = false; // true si el navegador bloqueó el audio (falta un clic/tecla)
    this.synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  }

  setLang(lang) {
    if (lang === "es" || lang === "en") this.lang = lang;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) this.stop();
  }

  isEnabled() {
    return this.enabled;
  }

  textFor(key) {
    const entry = VOICES[key];
    return entry ? entry[this.lang] || entry.es || "" : "";
  }

  // Corta lo que esté sonando
  stop() {
    this.token++;
    this._abort();
  }

  _abort() {
    if (this.cancelCurrent) {
      const cancel = this.cancelCurrent;
      this.cancelCurrent = null;
      cancel();
    }
  }

  // items: "clave" | { text: "..." } | [ ...ambos ]
  // Devuelve una promesa: true si terminó completa, false si la interrumpieron.
  async say(items) {
    const list = (Array.isArray(items) ? items : [items])
      .map((item) => (typeof item === "string" ? { key: item } : item))
      .filter(Boolean);

    this.stop();
    const my = this.token;
    this.blocked = false;

    const texts = list
      .map((item) => (item.key ? this.textFor(item.key) : item.text))
      .filter(Boolean);
    if (this.onText && texts.length) this.onText(texts.join(" "));

    if (!this.enabled) return true;

    for (const item of list) {
      if (my !== this.token) return false;
      try {
        await this._playItem(item, my);
      } catch (error) {
        console.warn("Voz: error al reproducir", error);
      }
    }
    return my === this.token;
  }

  async _playItem(item, my) {
    if (!item.key) {
      await this._speak(item.text, my);
      return;
    }

    const entry = VOICES[item.key];
    if (!entry) {
      console.warn(`Voz: la clave "${item.key}" no existe en voces.js`);
      return;
    }

    const path = `${VOICES_DIR}/${this.lang}/${entry.file}`;

    if (!this.missing.has(path)) {
      const result = await this._playFile(path);
      if (result === "ok" || result === "aborted") return;
      if (result === "blocked") {
        // Autoplay bloqueado: no se puede hablar hasta que el usuario interactúe
        this.blocked = true;
        return;
      }
      if (result === "missing") this.missing.add(path);
    }

    if (my !== this.token) return;
    await this._speak(entry[this.lang] || entry.es, my);
  }

  // Resultado: "ok" | "missing" | "blocked" | "timeout" | "aborted"
  _playFile(path) {
    return new Promise((resolve) => {
      const audio = new Audio(path);
      audio.preload = "auto";

      let settled = false;
      let timer = null;

      const cancel = () => finish("aborted");

      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (this.cancelCurrent === cancel) this.cancelCurrent = null;
        try {
          audio.pause();
        } catch (error) {
          // sin importancia
        }
        resolve(result);
      };

      audio.addEventListener("ended", () => finish("ok"));
      audio.addEventListener("error", () => finish("missing"));
      audio.addEventListener("playing", () => clearTimeout(timer));

      timer = setTimeout(() => finish("timeout"), FILE_TIMEOUT_MS);
      this.cancelCurrent = cancel;

      const playing = audio.play();
      if (playing && typeof playing.catch === "function") {
        playing.catch((error) => {
          if (error && error.name === "AbortError") return finish("aborted");
          finish(
            error && error.name === "NotAllowedError" ? "blocked" : "missing",
          );
        });
      }
    });
  }

  _voiceFor(lang) {
    if (!this.synth) return null;
    if (this.voiceCache[lang]) return this.voiceCache[lang];

    const prefix = lang.toLowerCase().slice(0, 2);
    const matches = this.synth
      .getVoices()
      .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix));
    const best = matches.find((v) => v.localService) || matches[0] || null;
    if (best) this.voiceCache[lang] = best;
    return best;
  }

  _speak(text, my) {
    if (!text || !this.synth) return Promise.resolve();

    // Frases cortas: Chrome corta los textos muy largos
    const chunks = String(text)
      .replace(/([.!?])\s+/g, "$1\u0001")
      .split("\u0001")
      .map((c) => c.trim())
      .filter(Boolean);

    const speakChunk = (chunk) =>
      new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = SPEECH_LANG[this.lang];
        const voice = this._voiceFor(SPEECH_LANG[this.lang]);
        if (voice) utterance.voice = voice;

        let done = false;
        const cancel = () => finish();
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (this.cancelCurrent === cancel) this.cancelCurrent = null;
          resolve();
        };
        const timer = setTimeout(
          () => {
            this.synth.cancel();
            finish();
          },
          chunk.length * 140 + 4000,
        );

        utterance.onend = finish;
        utterance.onerror = finish;

        this.cancelCurrent = () => {
          this.synth.cancel();
          cancel();
        };

        try {
          this.synth.resume();
          this.synth.speak(utterance);
        } catch (error) {
          finish();
        }
      });

    return (async () => {
      for (const chunk of chunks) {
        if (my !== this.token) return;
        await speakChunk(chunk);
      }
    })();
  }
}

export const Voz = new VoiceEngine();

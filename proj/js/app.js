import * as THREE from "three";
import { EarthScene } from "./main.js";
import { getHourlyTemperatures, DATA_END } from "./api-horaria.js";
import { sonificarTemperaturas, detenerSecuencia } from "./audio.js";
import { translations } from "./idioma.js";
import { Voz } from "./voz.js";

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const hhmm = (d, utc = false) =>
  utc
    ? `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const MODE_KEY = "earthjukebox-mode"; // "blind" | "deaf"

const DATA_DATE = `${DATA_END.slice(0, 4)}-${DATA_END.slice(4, 6)}-${DATA_END.slice(6, 8)}`;

// Atajos de teclado -> acciones
const KEY_ACTIONS = {
  h: "help",
  "?": "help",
  l: "list",
  t: "temp",
  m: "minmax",
  d: "describe",
  s: "sonify",
  e: "live",
  v: "global",
  i: "lang",
  r: "voice",
  x: "silence",
  a: "mode",
  c: "captions",
  escape: "global",
  arrowright: "hourNext",
  arrowleft: "hourPrev",
};

export class AppController {
  constructor() {
    this.earth = new EarthScene("canvas-container");
    this.lang = "es";
    this.started = false;
    this.welcomed = false;
    this.assetsErrorSpoken = false;

    this.currentZone = null;
    this.currentData = []; // [{day, hour, value}] de la zona actual
    this.zoneStatus = null; // "loading" | "ready" | "error" | null
    this.climate = new Map(); // zone.id -> Promise (caché + sin duplicados)

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.typeTimer = null;
    this.toastTimer = null;
    this.activeBtn = null;

    // Modos: "blind" = voz guiada | "deaf" = subtítulos, gráfico y vibración
    this.mode = "blind";
    this.captionsOn = true;
    this.captionTimer = null;
    this._chartHour = null;

    this.actions = {
      mode: () => this.toggleMode(),
      captions: () => this.toggleCaptions(),
      help: () => this.speak(["ayuda"]),
      list: () => this.speak(["lista_zonas"]),
      temp: () => this.sayTemperature(),
      minmax: () => this.sayMinMax(),
      describe: () => this.sayImpact(),
      sonify: () => this.sonify(),
      hourPrev: () => this.shiftHour(-1),
      hourNext: () => this.shiftHour(1),
      live: () => this.goLive(),
      global: () => this.goGlobal(),
      lang: () => this.toggleLanguage(),
      voice: () => this.toggleVoice(),
      silence: () => this.silence(),
    };

    // Texto de voz -> región para lector de pantalla (solo si la voz propia está apagada)
    Voz.onText = (text) => this.announce(text);

    $("captions-close").addEventListener("click", () => this.hideCaption());

    this.buildAccessiblePanel();
  }

  // =====================================================
  // IDIOMA
  // =====================================================

  t(key, vars = {}) {
    const str = translations[this.lang]?.[key] ?? translations.es[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  }

  zoneName(zone) {
    const key = `zone_${zone.id}`;
    return this.t(key) === key ? zone.name : this.t(key);
  }

  changeLanguage(lang) {
    if (!translations[lang]) return;
    this.lang = lang;
    document.documentElement.lang = lang;
    Voz.setLang(lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });

    this.refreshZoneButtons();
    this.updateSimLabel();
    this.updateModeUI();

    if (this.currentZone) {
      $("panel-title").textContent = this.zoneName(this.currentZone);
      this.renderZoneTime();
      this.updateTemperature();
      if (this.currentData.length) {
        this.showImpact(this.currentZone);
        this.renderChart();
      }
    }
  }

  toggleLanguage() {
    const next = this.lang === "es" ? "en" : "es";
    $("lang-select").value = next;
    this.changeLanguage(next);
    this.speak(["idioma_cambiado"]);
  }

  // =====================================================
  // VOZ Y ACCESIBILIDAD
  // =====================================================

  // En modo sordos no suena nada: todo va a subtítulos (y a braille / lector).
  // En modo voz, los subtítulos muestran exactamente lo que se escucha.
  speak(items) {
    const list = (Array.isArray(items) ? items : [items])
      .map((item) => (typeof item === "string" ? { key: item } : item))
      .filter(Boolean);

    if (this.mode === "deaf") {
      const text = this.captionText(list, true);
      this.showCaption(text);
      this.announce(text); // personas sordociegas con línea braille
      return Promise.resolve(true);
    }

    if (this.captionsOn) this.showCaption(this.captionText(list, false));
    return Voz.say(items);
  }

  captionText(list, visual) {
    return list
      .map((item) => {
        if (!item.key) return item.text;
        if (visual) {
          const k = `sub_${item.key}`;
          if (this.t(k) !== k) return this.t(k);
        }
        return Voz.textFor(item.key);
      })
      .filter(Boolean)
      .join(" ");
  }

  showCaption(text) {
    if (!text) return;
    $("captions-text").textContent = text;
    $("captions").classList.remove("hidden");
    clearTimeout(this.captionTimer);
    // Tiempo de lectura: ~70 ms por letra, entre 4 y 45 segundos
    const ms = Math.min(45000, Math.max(4000, text.length * 70));
    this.captionTimer = setTimeout(() => this.hideCaption(), ms);
  }

  hideCaption() {
    clearTimeout(this.captionTimer);
    $("captions").classList.add("hidden");
  }

  // Vibración (solo modo sordos, en móviles que la soportan)
  buzz(pattern) {
    if (this.mode !== "deaf" || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // sin importancia
    }
  }

  applyMode(mode) {
    this.mode = mode;
    document.body.dataset.mode = mode;
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch (error) {
      // almacenamiento no disponible
    }

    document.querySelectorAll('input[name="mode"]').forEach((r) => {
      r.checked = r.value === mode;
    });

    if (mode === "deaf") {
      Voz.stop();
      Voz.setEnabled(false);
      this.captionsOn = true;
    } else {
      Voz.setEnabled(true);
    }
    this.updateModeUI();
  }

  updateModeUI() {
    const badge = $("btn-mode");
    if (badge) badge.textContent = this.t(`badge_${this.mode}`);
    const cc = $("btn-captions");
    if (cc) cc.setAttribute("aria-pressed", String(this.captionsOn));
    if (cc) cc.classList.toggle("is-active", this.captionsOn);
  }

  toggleMode() {
    return this.switchMode(this.mode === "blind" ? "deaf" : "blind");
  }

  async switchMode(mode) {
    if (mode === this.mode) return;
    if (mode === "deaf") {
      // Se avisa con voz ANTES de apagarla: si fue sin querer, quien no ve
      // sabe cómo volver (tecla A).
      await this.speak(["modo_sordos"]);
      this.applyMode("deaf");
    } else {
      this.applyMode("blind");
      this.speak(["modo_ciegos"]);
    }
  }

  toggleCaptions() {
    if (this.mode === "deaf") {
      this.speak([{ text: this.t("voz_subs_siempre") }]);
      return;
    }
    this.captionsOn = !this.captionsOn;
    this.updateModeUI();
    if (!this.captionsOn) this.hideCaption();
    this.speak([{ text: this.t(this.captionsOn ? "voz_subs_on" : "voz_subs_off") }]);
  }

  // Para lectores de pantalla y líneas braille cuando la voz propia está apagada
  announce(text) {
    if (Voz.isEnabled()) return;
    const el = $("sr-status");
    if (!el) return;
    el.textContent = "";
    setTimeout(() => {
      el.textContent = text;
    }, 60);
  }

  async toggleVoice() {
    if (this.mode === "deaf") {
      this.speak([{ text: this.t("voz_no_voz") }]);
      return;
    }
    if (Voz.isEnabled()) {
      await this.speak(["voz_desactivada"]);
      Voz.setEnabled(false);
      this.announce(Voz.textFor("voz_desactivada"));
    } else {
      Voz.setEnabled(true);
      this.speak(["voz_activada"]);
    }
  }

  silence() {
    this.stopAudio();
    Voz.stop();
  }

  buildAccessiblePanel() {
    const box = $("a11y-zones");
    if (!box) return;

    this.earth.zones.forEach((zone) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "a11y-btn";
      btn.addEventListener("click", () => {
        if (this.started) this.selectZone(zone);
      });
      box.appendChild(btn);
    });

    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => this.runAction(btn.dataset.action));
    });

    this.refreshZoneButtons();
  }

  refreshZoneButtons() {
    document.querySelectorAll("#a11y-zones button").forEach((btn, i) => {
      const zone = this.earth.zones[i];
      if (zone) btn.textContent = `${i + 1}. ${this.zoneName(zone)}`;
    });
  }

  runAction(name) {
    if (!this.started || !this.actions[name]) return;
    if (name !== "sonify" && name !== "silence") this.stopAudio();
    this.actions[name]();
  }

  bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;

      const tag = e.target && e.target.tagName;

      if (!this.started) {
        this.handleIntroKey(e, tag);
        return;
      }

      // Los campos nativos manejan sus propias teclas
      if (tag === "SELECT") return;
      if (tag === "INPUT" && /^(Arrow|Home|End|Page)/.test(e.key)) return;

      const key = e.key.toLowerCase();

      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const zone = this.earth.zones[Number(e.key) - 1];
        if (zone) this.selectZone(zone);
        return;
      }

      const action = KEY_ACTIONS[key];
      if (action) {
        e.preventDefault();
        this.runAction(action);
      }
    });
  }

  // Un clic o toque en la portada también da la bienvenida (desbloquea el audio)
  bindIntroClick() {
    document.addEventListener("click", (e) => {
      if (this.started || this.welcomed) return;
      if (e.target.closest && e.target.closest("#btn-enter, #lang-select, #mode-picker")) {
        return;
      }
      this.welcomed = true;
      this.speak(["bienvenida"]);
    });
  }

  handleIntroKey(e, tag) {
    const key = e.key.toLowerCase();

    if (key === "enter") {
      if (tag === "BUTTON" || tag === "SELECT") return; // el botón ya hace clic
      e.preventDefault();
      this.startMission();
      return;
    }

    if (
      ["shift", "control", "alt", "meta", "capslock", "escape"].includes(key)
    ) {
      return;
    }
    if (tag === "SELECT" || tag === "INPUT") return;

    if (key === "i") {
      e.preventDefault();
      this.welcomed = true;
      this.toggleLanguage();
      return;
    }

    if (key === "a") {
      e.preventDefault();
      this.welcomed = true;
      this.toggleMode();
      return;
    }

    if (key === "c") {
      e.preventDefault();
      this.welcomed = true;
      this.toggleCaptions();
      return;
    }

    if (key === "h" || !this.welcomed) {
      if (key === "h") e.preventDefault();
      this.welcomed = true;
      this.speak(["bienvenida"]);
    }
  }

  // Devuelve true si ya hay datos listos; si no, explica por qué con voz
  dataGate() {
    if (!this.currentZone) {
      this.speak(["elige_zona_primero"]);
      return false;
    }
    if (this.zoneStatus === "loading") {
      this.speak(["conectando"]);
      return false;
    }
    if (this.zoneStatus !== "ready") {
      this.speak(["error_datos"]);
      return false;
    }
    return true;
  }

  // "-5.2" -> "menos 5,2" (es) / "minus 5.2" (en) para que la voz lo lea bien
  fmtTemp(value) {
    const r = Math.round(value * 10) / 10 || 0;
    let s = Math.abs(r).toFixed(1);
    if (this.lang === "es") s = s.replace(".", ",");
    return r < 0 ? `${this.t("voz_menos")} ${s}` : s;
  }

  fmtDate() {
    const y = Number(DATA_END.slice(0, 4));
    const m = Number(DATA_END.slice(4, 6));
    const d = Number(DATA_END.slice(6, 8));
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(
      this.lang === "es" ? "es-ES" : "en-US",
      { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
    );
  }

  currentEntry() {
    if (!this.currentZone || !this.currentData.length) return null;
    const hour = this.earth.getNow().getUTCHours();
    return (
      this.currentData.find((d) => d.day === DATA_END && d.hour === hour) ||
      null
    );
  }

  tempSentence(zone) {
    const entry = this.currentEntry();
    if (!entry) return null;

    const day = this.earth.isDaylight(zone);
    return this.t("voz_temp_hora", {
      temp: this.fmtTemp(entry.value),
      date: this.fmtDate(),
      hour: entry.hour,
      time: this.getLocalTime(zone.lon),
      daynight: this.t(day ? "voz_dia" : "voz_noche"),
    });
  }

  sayTemperature() {
    if (!this.dataGate()) return;
    const sentence = this.tempSentence(this.currentZone);
    this.speak(sentence ? [{ text: sentence }] : ["sin_datos"]);
  }

  sayMinMax() {
    if (!this.dataGate()) return;

    const day = this.currentData.filter((d) => d.day === DATA_END);
    if (!day.length) {
      this.speak(["sin_datos"]);
      return;
    }

    let max = day[0];
    let min = day[0];
    day.forEach((d) => {
      if (d.value > max.value) max = d;
      if (d.value < min.value) min = d;
    });

    this.speak([
      {
        text: this.t("voz_minmax", {
          max: this.fmtTemp(max.value),
          maxh: max.hour,
          min: this.fmtTemp(min.value),
          minh: min.hour,
        }),
      },
    ]);
  }

  sayImpact() {
    if (!this.currentZone) {
      this.speak(["elige_zona_primero"]);
      return;
    }
    this.speak([`impacto_${this.currentZone.id}`]);
  }

  // Cuenta la zona recién cargada: temperatura, impacto y qué hacer después
  narrateZone(zone) {
    const items = [];
    const sentence = this.tempSentence(zone);
    if (sentence) items.push({ text: sentence });
    items.push(`impacto_${zone.id}`, "datos_listos");
    this.speak(items);
  }

  // =====================================================
  // HORA SIMULADA
  // =====================================================

  applyTime() {
    this.updateSimLabel();
    this.renderZoneTime();
    this.updateTemperature();
    this.stopAudio();
  }

  describeTime(extra = []) {
    const items = [...extra];
    items.push({
      text: this.t("voz_hora_sim", { time: hhmm(this.earth.getNow(), true) }),
    });

    if (this.currentZone && this.zoneStatus === "ready") {
      const sentence = this.tempSentence(this.currentZone);
      if (sentence) items.push({ text: sentence });
    }
    this.speak(items);
  }

  shiftHour(delta) {
    const slider = $("time-slider");
    const next = Math.min(
      720,
      Math.max(-720, Number(slider.value) + delta * 60),
    );

    slider.value = next;
    this.earth.setTimeOffset(next * 60000);
    this.applyTime();
    this.describeTime(next === 0 ? ["hora_en_vivo"] : []);
  }

  goLive() {
    $("time-slider").value = 0;
    this.earth.setTimeOffset(0);
    this.applyTime();
    this.describeTime(["hora_en_vivo"]);
  }

  goGlobal() {
    if (this.currentZone) {
      this.closePanel();
    } else {
      this.speak(["vista_global"]);
    }
  }

  // =====================================================
  // INICIO
  // =====================================================

  async startMission() {
    if (this.started) return;
    this.started = true;

    this.earth.onProgress = (p) => this.setLoader(p);
    this.earth.onLoaded = () => this.setLoader(1);
    this.earth.onError = () => {
      this.toast(this.t("assets_error"), 6000);
      if (!this.assetsErrorSpoken) {
        this.assetsErrorSpoken = true;
        this.speak(["error_texturas"]);
      }
    };

    try {
      this.setLoader(0);
      this.earth.init();
    } catch (error) {
      console.error(error);
      this.started = false;
      this.setLoader(1);
      this.toast(this.t("webgl_error"), 8000);
      this.speak(["error_webgl"]);
      return;
    }

    this.earth.zoomIn();

    const intro = $("intro-screen");
    intro.classList.add("fade-out");
    setTimeout(() => {
      intro.classList.add("hidden");
      intro.inert = true;
    }, 1000);
    $("hud-overlay").classList.remove("hidden");

    this.bindUI();
    this.startClock();
    this.speak(["mision_iniciada"]);
  }

  bindUI() {
    this.setupInteractions();

    $("btn-close-panel").addEventListener("click", () => this.goGlobal());
    $("btn-reset-view").addEventListener("click", () => this.goGlobal());

    // Simulación de hora: cambia el Sol, la hora solar y la temperatura
    $("time-slider").addEventListener("input", (e) => {
      this.earth.setTimeOffset(Number(e.target.value) * 60000);
      this.applyTime();
    });
    $("btn-live").addEventListener("click", () => this.goLive());

    // Sonificación: las 24 temperaturas del día, una nota por hora
    $("btn-play-data").addEventListener("click", () => this.sonify());

    this.updateSimLabel();
    this.updateModeUI();
  }

  // =====================================================
  // RELOJES
  // =====================================================

  startClock() {
    const update = () => {
      const now = new Date();
      $("hud-time-local").textContent = `Local: ${hhmm(now)}`;
      $("hud-time-utc").textContent = `UTC: ${hhmm(now, true)}`;
      this.renderZoneTime();
      this.updateTemperature();
    };

    update();
    setInterval(update, 1000);
  }

  updateSimLabel() {
    const slider = $("time-slider");
    if (!slider) return;

    const minutes = Number(slider.value);
    const sim = this.earth.getNow();
    const sign = minutes > 0 ? "+" : minutes < 0 ? "−" : "";
    const abs = Math.abs(minutes);
    const offset = minutes
      ? ` (${sign}${Math.floor(abs / 60)}h${abs % 60 ? ` ${abs % 60}m` : ""})`
      : "";

    $("sim-label").textContent =
      `${this.t("sim_utc")} ${hhmm(sim, true)}${offset}`;
    $("btn-live").classList.toggle("is-active", minutes === 0);
  }

  // Hora solar estimada según la longitud (4 min por grado)
  getLocalTime(lon, date = this.earth.getNow()) {
    const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + lon * 4;
    const local = ((utcMinutes % 1440) + 1440) % 1440;
    return `${pad(Math.floor(local / 60))}:${pad(Math.floor(local % 60))}`;
  }

  renderZoneTime() {
    const zone = this.currentZone;
    if (!zone) return;

    const day = this.earth.isDaylight(zone);
    $("panel-time").textContent =
      `${this.getLocalTime(zone.lon)} ${day ? "☀" : "☾"} ${this.t(day ? "day" : "night")}`;
  }

  // =====================================================
  // INTERACCIÓN CON EL GLOBO
  // =====================================================

  pickZone(event) {
    const dom = this.earth.renderer.domElement;
    const rect = dom.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.earth.camera);

    // Incluimos la Tierra para que oculte los marcadores del lado opuesto
    const hits = this.raycaster.intersectObjects([
      this.earth.earth,
      ...this.earth.markerGroup.children,
    ]);

    const first = hits[0];
    return first && first.object.userData && first.object.userData.id
      ? first.object.userData
      : null;
  }

  setupInteractions() {
    const dom = this.earth.renderer.domElement;
    let downX = 0;
    let downY = 0;
    let hoverQueued = false;

    dom.addEventListener("pointerdown", (e) => {
      downX = e.clientX;
      downY = e.clientY;
    });

    // Distinguir clic de arrastre (OrbitControls)
    dom.addEventListener("pointerup", (e) => {
      if (e.button !== 0) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;

      const zone = this.pickZone(e);
      if (zone) this.selectZone(zone);
    });

    dom.addEventListener("pointermove", (e) => {
      if (e.buttons || e.pointerType === "touch" || hoverQueued) return;
      hoverQueued = true;
      requestAnimationFrame(() => {
        hoverQueued = false;
        dom.style.cursor = this.pickZone(e) ? "pointer" : "grab";
      });
    });
  }

  // =====================================================
  // PANEL DE ZONA
  // =====================================================

  setPanelOpen(open) {
    const panel = $("info-panel");
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    panel.inert = !open;
  }

  closePanel() {
    this.setPanelOpen(false);
    this.currentZone = null;
    this.currentData = [];
    this.zoneStatus = null;
    this.stopAudio();
    this.clearChart();
    this.earth.resetView();
    this.speak(["vista_global"]);
  }

  selectZone(zone) {
    this.stopAudio();
    this.currentZone = zone;
    this.currentData = [];
    this.zoneStatus = "loading";

    this.earth.focusOnZone(zone);
    this.setPanelOpen(true);

    $("panel-title").textContent = this.zoneName(zone);
    $("panel-coords").textContent =
      `${zone.lat.toFixed(2)}°, ${zone.lon.toFixed(2)}°`;
    $("panel-temp").textContent = "…";
    $("panel-source").textContent = "";
    $("btn-play-data").disabled = true;
    this.clearChart();
    this.buzz(40);

    this.renderZoneTime();
    this.typeText(this.t("connecting"));

    // Primero se anuncia la zona; los datos se cuentan cuando llegan
    const intro = this.speak([`zona_${zone.id}`, "conectando"]);

    this.loadClimate(zone).then(async (data) => {
      // Evita pisar el panel si el usuario ya eligió otra zona
      if (this.currentZone !== zone) return;
      this.currentData = data;

      if (data.length) {
        this.zoneStatus = "ready";
        $("btn-play-data").disabled = false;
        this.renderChart();
        this.updateTemperature();
        this.showImpact(zone);
        this.buzz([60, 40, 60]);

        const finished = await intro;
        if (!finished || this.currentZone !== zone) return;
        this.narrateZone(zone);
      } else {
        this.zoneStatus = "error";
        $("panel-temp").textContent = this.t("unavailable");
        this.typeText(this.t("fetch_error"));
        this.buzz(300);

        const finished = await intro;
        if (!finished || this.currentZone !== zone) return;
        this.speak(["error_datos"]);
      }
    });
  }

  // Carga con caché y sin peticiones duplicadas
  loadClimate(zone) {
    if (!this.climate.has(zone.id)) {
      const promise = withTimeout(
        getHourlyTemperatures(zone.lat, zone.lon),
        15000,
      )
        .then((data) =>
          (data || []).filter(
            (d) => Number.isFinite(d.value) && d.value > -900,
          ),
        ) // La NASA usa -999 para datos faltantes
        .catch(() => [])
        .then((data) => {
          if (!data.length) this.climate.delete(zone.id); // permite reintentar
          return data;
        });
      this.climate.set(zone.id, promise);
    }
    return this.climate.get(zone.id);
  }

  // Temperaturas (en orden) del día cargado, una por hora
  dayValues() {
    return this.currentData
      .filter((d) => d.day === DATA_END)
      .sort((a, b) => a.hour - b.hour)
      .map((d) => d.value);
  }

  // Muestra la temperatura que corresponde a la hora UTC simulada
  updateTemperature() {
    if (!this.currentZone || !this.currentData.length) return;

    const hour = this.earth.getNow().getUTCHours();
    const entry = this.currentEntry();

    $("panel-temp").textContent = entry
      ? `${entry.value.toFixed(1)} °C`
      : this.t("unavailable");
    $("panel-source").textContent =
      `${this.t("data_point")} ${DATA_DATE} ${pad(hour)}:00 UTC`;
    this.markChartHour();
  }

  // =====================================================
  // GRÁFICO DE 24 HORAS (visual de la sonificación)
  // =====================================================

  dayEntries() {
    return this.currentData
      .filter((d) => d.day === DATA_END)
      .sort((a, b) => a.hour - b.hour);
  }

  clearChart() {
    this.clearNote();
    $("chart-wrap").hidden = true;
    $("temp-chart").textContent = "";
    $("panel-minmax").textContent = "--";
    this._chartHour = null;
  }

  renderChart() {
    const day = this.dayEntries();
    if (!day.length) {
      this.clearChart();
      return;
    }

    const vals = day.map((d) => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;

    const chart = $("temp-chart");
    chart.textContent = "";
    day.forEach((d) => {
      const k = (d.value - min) / span;
      const bar = document.createElement("span");
      bar.className = "bar";
      bar.title = `${pad(d.hour)}:00 UTC · ${d.value.toFixed(1)} °C`;
      bar.style.height = `${12 + k * 88}%`;
      // frío = cian, calor = rojo (la altura también lleva el dato)
      bar.style.background = `hsl(${Math.round(195 + k * 160)} 90% 55%)`;
      chart.appendChild(bar);
    });

    const hi = day.find((d) => d.value === max);
    const lo = day.find((d) => d.value === min);
    $("panel-minmax").textContent =
      `${max.toFixed(1)} °C (${pad(hi.hour)}h) / ${min.toFixed(1)} °C (${pad(lo.hour)}h)`;

    $("chart-wrap").hidden = false;
    this._chartHour = null;
    this.markChartHour();
  }

  markChartHour() {
    const bars = $("temp-chart").children;
    if (!bars.length) return;
    const hour = this.earth.getNow().getUTCHours();
    if (hour === this._chartHour) return;
    this._chartHour = hour;

    const day = this.dayEntries();
    Array.from(bars).forEach((bar, i) =>
      bar.classList.toggle("is-now", day[i] && day[i].hour === hour),
    );
  }

  // Una nota de la sonificación = una barra encendida + lectura + vibración
  showNote(i, value, min, max) {
    const bars = $("temp-chart").children;
    Array.from(bars).forEach((b, j) => b.classList.toggle("is-playing", j === i));

    const day = this.dayEntries();
    const entry = day[i];
    $("chart-readout").textContent = entry
      ? `${pad(entry.hour)}:00 UTC · ${value.toFixed(1)} °C`
      : "";

    const k = (value - min) / (max - min || 1);
    this.buzz(Math.round(30 + k * 110)); // más calor = vibración más larga
  }

  clearNote() {
    Array.from($("temp-chart").children).forEach((b) =>
      b.classList.remove("is-playing"),
    );
    $("chart-readout").textContent = "";
  }

  showImpact(zone) {
    this.typeText(
      zone.impactKey && translations[this.lang][zone.impactKey]
        ? this.t(zone.impactKey)
        : this.t("analysis_done", { lat: zone.lat, lon: zone.lon }),
    );
  }

  // Efecto máquina de escribir (instantáneo si el usuario reduce animaciones)
  typeText(text) {
    const el = $("typed-text");
    clearInterval(this.typeTimer);

    if (prefersReducedMotion) {
      el.textContent = text;
      return;
    }

    el.textContent = "";
    let i = 0;
    this.typeTimer = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) clearInterval(this.typeTimer);
    }, 14);
  }

  // =====================================================
  // AUDIO
  // =====================================================

  setBtnKey(btn, key) {
    btn.dataset.i18n = key;
    btn.textContent = this.t(key);
    btn.classList.toggle("is-playing", key === "stop");
  }

  // Explica con voz cómo escuchar los datos y luego toca las 24 notas
  async sonify() {
    if (!this.dataGate()) return;

    const btn = $("btn-play-data");

    if (this.activeBtn === btn) {
      this.stopAudio();
      this.speak(["sonificacion_detenida"]);
      return;
    }

    const values = this.dayValues();
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    if (!values.length) {
      this.speak(["sin_datos"]);
      return;
    }

    this.stopAudio();
    this.activeBtn = btn;
    this.setBtnKey(btn, "stop");

    const finished = await this.speak(["sonificacion_intro"]);
    if (!finished || this.activeBtn !== btn) return;

    sonificarTemperaturas(
      values,
      () => {
        this.stopAudio();
        this.speak(["sonificacion_fin"]);
      },
      { onNote: (i, v) => this.showNote(i, v, lo, hi) },
    );
  }

  stopAudio() {
    detenerSecuencia();
    this.clearNote();
    if (this.activeBtn) {
      const btn = this.activeBtn;
      this.activeBtn = null;
      this.setBtnKey(btn, btn.dataset.idle);
    }
  }

  // =====================================================
  // UI AUXILIAR
  // =====================================================

  setLoader(progress) {
    const loader = $("loader");
    if (!loader) return;

    $("loader-bar").style.width = `${Math.round(progress * 100)}%`;
    if (progress >= 1) {
      setTimeout(() => loader.classList.add("hidden"), 400);
    } else {
      loader.classList.remove("hidden");
    }
  }

  toast(message, ms = 3500) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove("is-visible"), ms);
  }
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

const app = new AppController();

const langSelect = $("lang-select");
langSelect.addEventListener("change", (e) =>
  app.changeLanguage(e.target.value),
);
app.changeLanguage(langSelect.value);

$("btn-enter").addEventListener("click", () => app.startMission());
$("btn-abort").addEventListener("click", () => location.reload());

// Recuerda el modo elegido (una persona sorda no tiene que repetirlo cada vez)
try {
  if (localStorage.getItem(MODE_KEY) === "deaf") app.applyMode("deaf");
} catch (error) {
  // almacenamiento no disponible
}
app.updateModeUI();

document.querySelectorAll('input[name="mode"]').forEach((radio) =>
  radio.addEventListener("change", (e) => app.switchMode(e.target.value)),
);

app.bindKeyboard();
app.bindIntroClick();
$("btn-enter").focus();

// Intenta dar la bienvenida apenas carga la página. Si el navegador bloquea el
// audio (lo normal), avisa en pantalla y la bienvenida suena con el primer
// clic o tecla.
(async () => {
  await app.speak(["bienvenida"]);
  if (app.started) return;
  if (Voz.blocked) {
    app.toast(
      app.lang === "es"
        ? "Haz clic o presiona cualquier tecla para escuchar la bienvenida."
        : "Click or press any key to hear the welcome message.",
      9000,
    );
  } else {
    app.welcomed = true;
  }
})();

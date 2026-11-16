// js/audio.js - Sonificación de temperaturas (Web Audio API)

let ctx = null;
let master = null;
let endTimer = null;
let noteTimers = []; // avisos por nota (para sincronizar lo visual)

const active = new Set();

// Escala pentatónica mayor: cualquier secuencia de notas suena armónica.
const PENTATONIC = [0, 2, 4, 7, 9];
const ROOT_MIDI = 60;

function getAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    console.warn("Web Audio API no disponible");
    return null;
  }

  if (!ctx) {
    ctx = new AudioContextClass();

    master = ctx.createGain();
    master.gain.value = 0.35;

    const compressor = ctx.createDynamicsCompressor();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.32;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;

    master.connect(compressor);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(compressor);
    compressor.connect(ctx.destination);
  }

  if (ctx.state === "suspended") {
    ctx
      .resume()
      .catch((e) => console.error("No se pudo reanudar el audio:", e));
  }
  return ctx;
}

const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

function stepToFreq(step) {
  const octave = Math.floor(step / PENTATONIC.length);
  const degree =
    ((step % PENTATONIC.length) + PENTATONIC.length) % PENTATONIC.length;
  return midiToFreq(ROOT_MIDI + octave * 12 + PENTATONIC[degree]);
}

// Temperatura -> nota (más cálido = más agudo, 3 octavas)
function valueToFreq(value, min, max) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const maxStep = PENTATONIC.length * 3 - 1;
  return stepToFreq(Math.round(t * maxStep) - PENTATONIC.length);
}

function tocar(freq, start, dur = 0.4, pan = 0, peak = 0.25) {
  const fundamental = ctx.createOscillator();
  const octave = ctx.createOscillator();
  const octaveGain = ctx.createGain();
  const env = ctx.createGain();

  fundamental.type = "sine";
  octave.type = "triangle";
  fundamental.frequency.value = freq;
  octave.frequency.value = freq * 2;
  octaveGain.gain.value = 0.22;

  env.gain.setValueAtTime(0.0001, start);
  env.gain.linearRampToValueAtTime(peak, start + 0.03);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  fundamental.connect(env);
  octave.connect(octaveGain);
  octaveGain.connect(env);

  let out = env;
  if (ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    env.connect(panner);
    out = panner;
  }
  out.connect(master);

  [fundamental, octave].forEach((osc) => {
    active.add(osc);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  });

  fundamental.onended = () => {
    active.delete(fundamental);
    out.disconnect();
    env.disconnect();
  };
  octave.onended = () => {
    active.delete(octave);
    octave.disconnect();
    octaveGain.disconnect();
  };
}

// Cada valor es una nota; el paneo va de izquierda a derecha en el tiempo.
export function sonificarTemperaturas(
  serie,
  onEnd,
  { min = -40, max = 50, onNote = null } = {},
) {
  const audio = getAudio();
  if (!audio || !Array.isArray(serie)) return;

  const valores = serie.filter((v) => Number.isFinite(v));
  if (valores.length === 0) return;

  detenerSecuencia();

  const step = 0.3;
  let t = audio.currentTime + 0.1;

  valores.forEach((valor, i) => {
    const pan = valores.length > 1 ? -0.5 + i / (valores.length - 1) : 0;
    tocar(valueToFreq(valor, min, max), t, 0.35, pan);
    if (onNote) {
      const delay = Math.max(0, (t - audio.currentTime) * 1000);
      noteTimers.push(setTimeout(() => onNote(i, valor), delay));
    }
    t += step;
  });

  clearTimeout(endTimer);
  endTimer = setTimeout(
    () => {
      endTimer = null;
      if (onEnd) onEnd();
    },
    (t - audio.currentTime) * 1000 + 250,
  );
}

export function detenerSecuencia() {
  clearTimeout(endTimer);
  endTimer = null;
  noteTimers.forEach(clearTimeout);
  noteTimers = [];

  active.forEach((osc) => {
    try {
      osc.stop();
    } catch (error) {
      // El oscilador ya había terminado.
    }
  });
  active.clear();
}

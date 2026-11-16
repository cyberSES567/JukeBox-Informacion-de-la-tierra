// js/voces.js - Catálogo de voces de Earth Jukebox
//
// Cada entrada = un archivo MP3 que tú agregas en:
//     voces/es/<archivo>   (voz en español)
//     voces/en/<archivo>   (voz en inglés)
//
// El MISMO nombre de archivo se usa en las dos carpetas.
// Si un MP3 todavía no existe, la app lee el texto con la voz del
// navegador (speechSynthesis), así nunca queda en silencio ni da error.
//
// Los textos de zonas e impacto salen de idioma.js: si cambias un texto allá,
// vuelve a correr "node tools/generar-guion.mjs" para actualizar el guion.

import { translations } from "./idioma.js";

export const VOICES_DIR = "voces";

// El orden DEBE coincidir con el de `zones` en main.js
// (el número de tecla 1-9 es la posición en esta lista).
export const ZONES = [
  { id: "amazonas", impactKey: "impact_amazon" },
  { id: "tokyo", impactKey: "impact_tokyo" },
  { id: "sahara", impactKey: "impact_sahara" },
  { id: "lima", impactKey: "impact_lima" },
  { id: "greenland", impactKey: "impact_greenland" },
  { id: "antarctica", impactKey: "impact_antarctica" },
  { id: "death_valley", impactKey: "impact_death" },
  { id: "coral_reef", impactKey: "impact_coral" },
  { id: "siberia", impactKey: "impact_siberia" },
];

const NUMBERS = {
  es: ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"],
  en: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
};

// -----------------------------------------------------
// Voces fijas
// -----------------------------------------------------

const FIXED = {
  bienvenida: {
    grupo: "Inicio y ayuda",
    es: "Bienvenido a Earth Jukebox, un proyecto de la NASA Space Apps para explorar la Tierra con sonidos y voces. Presiona Enter para viajar a la Tierra. Presiona la letra I para cambiar entre español e inglés. Presiona la letra A para cambiar al modo para personas sordas. Presiona la letra H para repetir este mensaje.",
    en: "Welcome to Earth Jukebox, a NASA Space Apps project to explore the Earth through sounds and voices. Press Enter to travel to Earth. Press the letter I to switch between English and Spanish. Press the letter A to switch to deaf mode. Press the letter H to hear this message again.",
    cambio: "actualizado",
  },
  mision_iniciada: {
    grupo: "Inicio y ayuda",
    es: "Viajando a la Tierra. Estás en la vista global. Hay nueve zonas para explorar. Presiona un número del uno al nueve para elegir una zona, la letra L para escuchar la lista de zonas, o la letra H para escuchar la ayuda. Si usas lector de pantalla en un celular, desliza hasta los controles accesibles para elegir una zona.",
    en: "Traveling to Earth. You are in the global view. There are nine zones to explore. Press a number from one to nine to choose a zone, the letter L to hear the list of zones, or the letter H to hear the help. If you use a screen reader on a phone, swipe to the accessible controls to choose a zone.",
  },
  ayuda: {
    grupo: "Inicio y ayuda",
    es: "Ayuda de Earth Jukebox. Números del uno al nueve: elegir una zona del planeta. L: escuchar la lista de zonas. T: temperatura y hora de la zona. M: temperatura máxima y mínima del día. D: descripción del impacto climático. S: escuchar la temperatura del día como música, o detenerla. Flecha derecha o izquierda: avanzar o retroceder una hora simulada. E: volver a la hora real. V o Escape: volver a la vista global. I: cambiar de idioma. A: cambiar entre el modo con voz y el modo para personas sordas. C: activar o desactivar los subtítulos. R: cambiar entre la voz propia y tu lector de pantalla. X: silenciar. H: repetir esta ayuda.",
    en: "Earth Jukebox help. Numbers one to nine: choose a zone on the planet. L: hear the list of zones. T: temperature and time of the zone. M: maximum and minimum temperature of the day. D: description of the climate impact. S: hear the temperature of the day as music, or stop it. Right or left arrow: move one simulated hour forward or back. E: return to real time. V or Escape: return to the global view. I: change language. A: switch between voice mode and deaf mode. C: turn captions on or off. R: switch between the built-in voice and your screen reader. X: silence. H: repeat this help.",
    cambio: "actualizado",
  },
  idioma_cambiado: {
    grupo: "Sistema",
    es: "Idioma cambiado a español.",
    en: "Language changed to English.",
  },
  voz_activada: {
    grupo: "Sistema",
    es: "Voz propia activada.",
    en: "Built-in voice turned on.",
  },
  voz_desactivada: {
    grupo: "Sistema",
    es: "Voz propia desactivada. Ahora se usará tu lector de pantalla.",
    en: "Built-in voice turned off. Your screen reader will be used now.",
  },
  error_webgl: {
    grupo: "Sistema",
    es: "Tu navegador no admite gráficos tridimensionales, necesarios para usar Earth Jukebox. Prueba con otro navegador.",
    en: "Your browser does not support three-dimensional graphics, which Earth Jukebox needs. Please try another browser.",
  },
  error_texturas: {
    grupo: "Sistema",
    es: "No se pudieron cargar algunas imágenes del planeta. Revisa tu conexión. Puedes seguir usando las voces y los datos.",
    en: "Some images of the planet could not be loaded. Check your connection. You can keep using the voices and the data.",
  },
  modo_sordos: {
    grupo: "Sistema",
    es: "Modo para personas sordas activado. La voz se apaga y todo se mostrará con subtítulos, gráficos y vibración. Presiona A para volver al modo con voz.",
    en: "Deaf mode turned on. The voice is switched off and everything will be shown with captions, charts and vibration. Press A to return to voice mode.",
    cambio: "nuevo",
  },
  modo_ciegos: {
    grupo: "Sistema",
    es: "Modo con voz activado. Presiona A para cambiar al modo para personas sordas.",
    en: "Voice mode turned on. Press A to switch to deaf mode.",
    cambio: "nuevo",
  },
  vista_global: {
    grupo: "Navegación",
    es: "Vista global. Elige una zona con un número del uno al nueve, o presiona la letra H para escuchar la ayuda.",
    en: "Global view. Choose a zone with a number from one to nine, or press the letter H to hear the help.",
  },
  elige_zona_primero: {
    grupo: "Navegación",
    es: "Primero elige una zona con un número del uno al nueve.",
    en: "First choose a zone with a number from one to nine.",
  },
  hora_en_vivo: {
    grupo: "Navegación",
    es: "Hora en tiempo real.",
    en: "Real time.",
  },
  conectando: {
    grupo: "Datos",
    es: "Conectando con la NASA. Un momento, por favor.",
    en: "Connecting to NASA. One moment, please.",
  },
  datos_listos: {
    grupo: "Datos",
    es: "Presiona S para escuchar la temperatura del día como música, D para repetir la descripción, T para la temperatura actual, o V para volver a la vista global.",
    en: "Press S to hear the temperature of the day as music, D to repeat the description, T for the current temperature, or V to return to the global view.",
  },
  error_datos: {
    grupo: "Datos",
    es: "No se pudieron obtener los datos climáticos de esta zona. Intenta con otra zona o inténtalo de nuevo más tarde.",
    en: "The climate data for this zone could not be retrieved. Try another zone or try again later.",
  },
  sin_datos: {
    grupo: "Datos",
    es: "Todavía no hay datos de temperatura para esta zona.",
    en: "There is no temperature data for this zone yet.",
  },
  sonificacion_intro: {
    grupo: "Sonificación",
    es: "Escucharás las veinticuatro temperaturas del día, una nota por hora, desde la medianoche hasta las once de la noche, en hora universal. Una nota más aguda significa más calor. Una nota más grave significa más frío. Presiona S para detener.",
    en: "You will hear the twenty-four temperatures of the day, one note per hour, from midnight to eleven at night, in universal time. A higher note means warmer. A lower note means colder. Press S to stop.",
  },
  sonificacion_fin: {
    grupo: "Sonificación",
    es: "Fin de la sonificación. Presiona S para escucharla de nuevo.",
    en: "End of the sonification. Press S to hear it again.",
  },
  sonificacion_detenida: {
    grupo: "Sonificación",
    es: "Sonificación detenida.",
    en: "Sonification stopped.",
  },
};

// -----------------------------------------------------
// Construcción del catálogo completo
// -----------------------------------------------------

function build() {
  const voices = {};

  for (const [key, entry] of Object.entries(FIXED)) {
    voices[key] = { ...entry, file: `${key}.mp3` };
  }

  // Lista de zonas (se arma sola con los nombres de idioma.js)
  const lista = { grupo: "Navegación" };
  for (const lang of ["es", "en"]) {
    const names = ZONES.map(
      (z, i) => `${NUMBERS[lang][i]}, ${translations[lang][`zone_${z.id}`]}.`,
    ).join(" ");
    lista[lang] =
      lang === "es"
        ? `Zonas disponibles. ${names} Presiona el número de la zona para elegirla.`
        : `Available zones. ${names} Press the number of the zone to choose it.`;
  }
  voices.lista_zonas = { ...lista, file: "lista_zonas.mp3" };

  // Una voz por zona (nombre) y una por impacto (texto de idioma.js)
  ZONES.forEach((z, i) => {
    const zona = { grupo: "Zonas" };
    const impacto = { grupo: "Impacto climático" };

    for (const lang of ["es", "en"]) {
      const name = translations[lang][`zone_${z.id}`];
      zona[lang] =
        lang === "es"
          ? `Zona ${NUMBERS.es[i]}: ${name}.`
          : `Zone ${NUMBERS.en[i]}: ${name}.`;
      impacto[lang] = translations[lang][z.impactKey];
    }

    voices[`zona_${z.id}`] = { ...zona, file: `zona_${z.id}.mp3` };
    voices[`impacto_${z.id}`] = { ...impacto, file: `impacto_${z.id}.mp3` };
  });

  return voices;
}

export const VOICES = build();

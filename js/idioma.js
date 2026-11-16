// js/idioma.js

export const translations = {
  es: {
    travel: "VIAJAR A LA TIERRA",
    config_lang: "CONFIGURACIÓN DE SISTEMA (IDIOMA):",
    status: "ESTADO:",
    online: "ONLINE",
    abort: "ABORTAR MISIÓN",
    zone: "ZONA SELECCIONADA",
    coords: "COORDENADAS:",
    localtime: "HORA SOLAR ESTIMADA:",
    data: "TEMPERATURA:",
    data_point: "Dato NASA POWER:",
    play_data: "SONIFICAR TEMPERATURAS",
    stop: "DETENER",
    footer: "> SELECCIONA UN PUNTO EN EL PLANETA",
    back: "VISTA GLOBAL",
    loading: "CARGANDO TEXTURAS",
    unavailable: "Datos no disponibles",
    connecting: "Conectando con la NASA POWER API...",
    fetch_error: "Error: no se pudieron recuperar los registros climáticos.",
    analysis_done: "Análisis completado para ({lat}, {lon}).",
    sim_time: "SIMULAR HORA",
    sim_utc: "UTC simulada",
    live: "EN VIVO",
    day: "DÍA",
    night: "NOCHE",
    webgl_error: "Tu navegador o dispositivo no soporta WebGL.",
    assets_error: "No se pudieron cargar algunas texturas. Revisa tu conexión.",
    credits: "Datos: NASA POWER · Texturas: NASA Blue Marble",
    toast_audio: "Haz clic o presiona cualquier tecla para escuchar la bienvenida.",

    // Frases dinámicas (se leen con la voz del navegador)
    voz_temp_hora:
      "Temperatura: {temp} grados Celsius, dato de la NASA del {date}, a las {hour} horas UTC. Hora solar estimada: {time}. {daynight}",
    voz_dia: "Es de día.",
    voz_noche: "Es de noche.",
    voz_hora_sim: "Hora simulada: {time} UTC.",
    voz_minmax:
      "Máxima del día: {max} grados, a las {maxh} horas UTC. Mínima: {min} grados, a las {minh} horas UTC.",
    voz_menos: "menos",

    // Controles accesibles
    a11y_title: "CONTROLES ACCESIBLES",
    a11y_zones: "ZONAS",
    a11y_actions: "ACCIONES",
    a11y_help: "Ayuda (H)",
    a11y_list: "Lista de zonas (L)",
    a11y_temp: "Temperatura (T)",
    a11y_minmax: "Máxima y mínima (M)",
    a11y_describe: "Describir impacto (D)",
    a11y_hour_prev: "Hora anterior (←)",
    a11y_hour_next: "Hora siguiente (→)",
    a11y_lang: "Cambiar idioma (I)",
    a11y_voice: "Voz propia / lector (R)",
    a11y_silence: "Silenciar (X)",

    // Modo para personas sordas / subtítulos
    mode_label: "MODO DE ACCESIBILIDAD:",
    mode_blind: "CIEGOS · VOZ",
    mode_blind_desc: "Voz guiada y teclado",
    mode_deaf: "SORDOS · VISUAL",
    mode_deaf_desc: "Subtítulos, gráficos y vibración",
    badge_blind: "MODO: VOZ",
    badge_deaf: "MODO: SORDOS",
    captions_tag: "SUBTÍTULOS",
    captions_close: "Cerrar subtítulos",
    chart_title: "TEMPERATURA POR HORA (UTC)",
    minmax_label: "MÁX / MÍN:",
    a11y_mode: "Modo ciegos / sordos (A)",
    a11y_captions: "Subtítulos (C)",
    voz_subs_on: "Subtítulos activados.",
    voz_subs_off: "Subtítulos desactivados.",
    voz_subs_siempre:
      "En el modo para personas sordas los subtítulos están siempre activos.",
    voz_no_voz:
      "En el modo para personas sordas la voz está apagada. Presiona A para volver al modo con voz.",

    // Subtítulos visuales (reemplazan a las voces que hablan de "escuchar")
    sub_bienvenida:
      "Bienvenido a Earth Jukebox, un proyecto de la NASA Space Apps para explorar la Tierra con sonidos y datos visuales. Enter: viajar a la Tierra. I: cambiar idioma. A: cambiar entre modo con voz y modo para personas sordas. H: repetir este mensaje.",
    sub_mision_iniciada:
      "Vista global. Hay nueve zonas para explorar. Toca el globo o presiona un número del 1 al 9 para elegir una zona. L: lista de zonas. H: ayuda.",
    sub_vista_global:
      "Vista global. Elige una zona tocando el globo o con un número del 1 al 9. H: ayuda.",
    sub_ayuda:
      "Ayuda. 1 a 9: elegir una zona. L: lista de zonas. T: temperatura y hora. M: máxima y mínima del día. D: impacto climático. S: ver y sentir la temperatura del día como música, con gráfico, notas y vibración. Flechas izquierda y derecha: hora simulada. E: hora real. V o Esc: vista global. I: idioma. A: modo ciegos o sordos. C: subtítulos. X: silenciar. H: esta ayuda.",
    sub_datos_listos:
      "S: ver la temperatura del día como gráfico animado. D: repetir la descripción. T: temperatura actual. V: vista global.",
    sub_sonificacion_intro:
      "Veinticuatro temperaturas del día, una por hora, de 00:00 a 23:00 UTC. Barra más alta y nota más aguda: más calor. S para detener.",
    sub_sonificacion_fin: "Fin de la sonificación. S para repetirla.",
    sub_error_texturas:
      "No se pudieron cargar algunas imágenes del planeta. Revisa tu conexión. Puedes seguir usando los datos.",

    zone_amazonas: "Selva del Amazonas",
    zone_tokyo: "Tokio, Japón",
    zone_sahara: "Desierto del Sahara",
    zone_lima: "Lima, Perú",
    zone_greenland: "Groenlandia",
    zone_antarctica: "Antártida (Base McMurdo)",
    zone_death_valley: "Valle de la Muerte",
    zone_coral_reef: "Gran Barrera de Coral",
    zone_siberia: "Siberia",

    impact_greenland:
      "Alerta: El incremento térmico acelera el deshielo de Groenlandia y contribuye al aumento del nivel del mar.",
    impact_amazon:
      "Alerta: El aumento de temperatura y las sequías afectan la captura de CO2 y amenazan la biodiversidad amazónica.",
    impact_antarctica:
      "Alerta: Los cambios en la masa de hielo antártica contribuyen a la variación del nivel del mar.",
    impact_coral:
      "Alerta: El calentamiento oceánico puede provocar blanqueamiento de corales y deterioro de los ecosistemas marinos.",
    impact_siberia:
      "Alerta: El deshielo del permafrost puede liberar gases de efecto invernadero.",
    impact_tokyo:
      "Análisis: Región urbana expuesta a variaciones térmicas y al efecto de isla de calor.",
    impact_sahara:
      "Análisis: Región desértica caracterizada por condiciones de elevada temperatura y aridez.",
    impact_lima:
      "Análisis: Región costera peruana influenciada por el océano Pacífico y sus variaciones climáticas.",
    impact_death:
      "Análisis: Valle desértico conocido por sus condiciones de temperatura extrema.",
  },

  en: {
    travel: "TRAVEL TO EARTH",
    config_lang: "SYSTEM CONFIG (LANGUAGE):",
    status: "STATUS:",
    online: "ONLINE",
    abort: "ABORT MISSION",
    zone: "SELECTED ZONE",
    coords: "COORDINATES:",
    localtime: "ESTIMATED SOLAR TIME:",
    data: "TEMPERATURE:",
    data_point: "NASA POWER data:",
    play_data: "SONIFY TEMPERATURES",
    stop: "STOP",
    footer: "> SELECT A POINT ON THE PLANET",
    back: "GLOBAL VIEW",
    loading: "LOADING TEXTURES",
    unavailable: "Data unavailable",
    connecting: "Connecting to NASA POWER API...",
    fetch_error: "Error: climate records could not be retrieved.",
    analysis_done: "Analysis complete for ({lat}, {lon}).",
    sim_time: "SIMULATE TIME",
    sim_utc: "Simulated UTC",
    live: "LIVE",
    day: "DAY",
    night: "NIGHT",
    webgl_error: "Your browser or device does not support WebGL.",
    assets_error: "Some textures failed to load. Check your connection.",
    credits: "Data: NASA POWER · Textures: NASA Blue Marble",
    toast_audio: "Click or press any key to hear the welcome message.",

    // Dynamic phrases (read with the browser voice)
    voz_temp_hora:
      "Temperature: {temp} degrees Celsius, NASA data from {date}, at {hour} hours UTC. Estimated solar time: {time}. {daynight}",
    voz_dia: "It is daytime.",
    voz_noche: "It is night.",
    voz_hora_sim: "Simulated time: {time} UTC.",
    voz_minmax:
      "Maximum of the day: {max} degrees, at {maxh} hours UTC. Minimum: {min} degrees, at {minh} hours UTC.",
    voz_menos: "minus",

    // Accessible controls
    a11y_title: "ACCESSIBLE CONTROLS",
    a11y_zones: "ZONES",
    a11y_actions: "ACTIONS",
    a11y_help: "Help (H)",
    a11y_list: "List of zones (L)",
    a11y_temp: "Temperature (T)",
    a11y_minmax: "Maximum and minimum (M)",
    a11y_describe: "Describe impact (D)",
    a11y_hour_prev: "Previous hour (←)",
    a11y_hour_next: "Next hour (→)",
    a11y_lang: "Change language (I)",
    a11y_voice: "Built-in voice / reader (R)",
    a11y_silence: "Silence (X)",

    // Deaf mode / captions
    mode_label: "ACCESSIBILITY MODE:",
    mode_blind: "BLIND · VOICE",
    mode_blind_desc: "Guided voice and keyboard",
    mode_deaf: "DEAF · VISUAL",
    mode_deaf_desc: "Captions, charts and vibration",
    badge_blind: "MODE: VOICE",
    badge_deaf: "MODE: DEAF",
    captions_tag: "CAPTIONS",
    captions_close: "Close captions",
    chart_title: "HOURLY TEMPERATURE (UTC)",
    minmax_label: "MAX / MIN:",
    a11y_mode: "Blind / deaf mode (A)",
    a11y_captions: "Captions (C)",
    voz_subs_on: "Captions turned on.",
    voz_subs_off: "Captions turned off.",
    voz_subs_siempre: "In deaf mode the captions are always on.",
    voz_no_voz:
      "In deaf mode the voice is off. Press A to return to voice mode.",

    // Visual captions (replace voice lines that talk about "hearing")
    sub_bienvenida:
      "Welcome to Earth Jukebox, a NASA Space Apps project to explore the Earth through sounds and visual data. Enter: travel to Earth. I: change language. A: switch between voice mode and deaf mode. H: repeat this message.",
    sub_mision_iniciada:
      "Global view. There are nine zones to explore. Tap the globe or press a number from 1 to 9 to choose a zone. L: list of zones. H: help.",
    sub_vista_global:
      "Global view. Choose a zone by tapping the globe or with a number from 1 to 9. H: help.",
    sub_ayuda:
      "Help. 1 to 9: choose a zone. L: list of zones. T: temperature and time. M: maximum and minimum of the day. D: climate impact. S: see and feel the temperature of the day as music, with a chart, notes and vibration. Left and right arrows: simulated hour. E: real time. V or Esc: global view. I: language. A: blind or deaf mode. C: captions. X: silence. H: this help.",
    sub_datos_listos:
      "S: see the temperature of the day as an animated chart. D: repeat the description. T: current temperature. V: global view.",
    sub_sonificacion_intro:
      "Twenty-four temperatures of the day, one per hour, from 00:00 to 23:00 UTC. Taller bar and higher note: warmer. S to stop.",
    sub_sonificacion_fin: "End of the sonification. S to play it again.",
    sub_error_texturas:
      "Some images of the planet could not be loaded. Check your connection. You can keep using the data.",

    zone_amazonas: "Amazon Rainforest",
    zone_tokyo: "Tokyo, Japan",
    zone_sahara: "Sahara Desert",
    zone_lima: "Lima, Peru",
    zone_greenland: "Greenland",
    zone_antarctica: "Antarctica (McMurdo Station)",
    zone_death_valley: "Death Valley",
    zone_coral_reef: "Great Barrier Reef",
    zone_siberia: "Siberia",

    impact_greenland:
      "Alert: Rising temperatures accelerate Greenland ice loss and contribute to sea-level rise.",
    impact_amazon:
      "Alert: Rising temperatures and drought affect CO2 absorption and threaten Amazon biodiversity.",
    impact_antarctica:
      "Alert: Changes in Antarctic ice mass contribute to sea-level variations.",
    impact_coral:
      "Alert: Ocean warming can cause coral bleaching and damage marine ecosystems.",
    impact_siberia: "Alert: Permafrost thaw can release greenhouse gases.",
    impact_tokyo:
      "Analysis: An urban region exposed to temperature variations and the urban heat island effect.",
    impact_sahara:
      "Analysis: A desert region characterized by high temperatures and arid conditions.",
    impact_lima:
      "Analysis: A Peruvian coastal region influenced by the Pacific Ocean and climate variability.",
    impact_death:
      "Analysis: A desert valley known for extreme temperature conditions.",
  },
};

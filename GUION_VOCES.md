# Guion de voces de Earth Jukebox

Total: **39 archivos por idioma** (78 en total).

## ⚠️ Pendientes de grabar (4 por idioma)

- `bienvenida.mp3` — ACTUALIZADO (regrabar)
- `ayuda.mp3` — ACTUALIZADO (regrabar)
- `modo_sordos.mp3` — NUEVO
- `modo_ciegos.mp3` — NUEVO

Cuando termines, borra la línea `cambio: ...` de esas voces en `js/voces.js` y vuelve a ejecutar este script.

## Reglas para que no haya errores

1. El nombre debe ser **exactamente** el que dice el guion: todo en **minúsculas**, sin espacios ni tildes, con extensión `.mp3` (por ejemplo `bienvenida.mp3`, no `Bienvenida.mp3`). En servidores como GitHub Pages las mayúsculas importan.
2. Español va en `voces/es/` e inglés en `voces/en/`. Los dos idiomas usan **el mismo nombre de archivo**.
3. Formato MP3. Usa la misma voz y el mismo ritmo en todos los archivos de un idioma.
4. Lee el texto tal cual aparece en el guion (puedes pegar el texto en tu generador de voz con IA).
5. No hace falta tener todos los archivos para empezar: si falta uno, la app lee ese texto con la voz del navegador. Para ver qué falta ejecuta `node tools/revisar-voces.mjs`.
6. Si cambias un texto en `js/idioma.js` o `js/voces.js`, vuelve a ejecutar `node tools/generar-guion.mjs` y regraba ese archivo.

**Nota:** la temperatura, la hora y las fechas (datos que cambian) no llevan MP3: la app las lee con la voz del navegador.

## VOCES EN ESPAÑOL

Guarda cada archivo dentro de la carpeta `voces/es/`.

### Inicio y ayuda

**1. Agrega en `voces/es/`: nómbralo `bienvenida.mp3`**  ✏️ ACTUALIZADO: vuelve a grabarlo

> Bienvenido a Earth Jukebox, un proyecto de la NASA Space Apps para explorar la Tierra con sonidos y voces. Presiona Enter para viajar a la Tierra. Presiona la letra I para cambiar entre español e inglés. Presiona la letra A para cambiar al modo para personas sordas. Presiona la letra H para repetir este mensaje.

**2. Agrega en `voces/es/`: nómbralo `mision_iniciada.mp3`**

> Viajando a la Tierra. Estás en la vista global. Hay nueve zonas para explorar. Presiona un número del uno al nueve para elegir una zona, la letra L para escuchar la lista de zonas, o la letra H para escuchar la ayuda. Si usas lector de pantalla en un celular, desliza hasta los controles accesibles para elegir una zona.

**3. Agrega en `voces/es/`: nómbralo `ayuda.mp3`**  ✏️ ACTUALIZADO: vuelve a grabarlo

> Ayuda de Earth Jukebox. Números del uno al nueve: elegir una zona del planeta. L: escuchar la lista de zonas. T: temperatura y hora de la zona. M: temperatura máxima y mínima del día. D: descripción del impacto climático. S: escuchar la temperatura del día como música, o detenerla. Flecha derecha o izquierda: avanzar o retroceder una hora simulada. E: volver a la hora real. V o Escape: volver a la vista global. I: cambiar de idioma. A: cambiar entre el modo con voz y el modo para personas sordas. C: activar o desactivar los subtítulos. R: cambiar entre la voz propia y tu lector de pantalla. X: silenciar. H: repetir esta ayuda.

### Navegación

**4. Agrega en `voces/es/`: nómbralo `vista_global.mp3`**

> Vista global. Elige una zona con un número del uno al nueve, o presiona la letra H para escuchar la ayuda.

**5. Agrega en `voces/es/`: nómbralo `elige_zona_primero.mp3`**

> Primero elige una zona con un número del uno al nueve.

**6. Agrega en `voces/es/`: nómbralo `hora_en_vivo.mp3`**

> Hora en tiempo real.

**7. Agrega en `voces/es/`: nómbralo `lista_zonas.mp3`**

> Zonas disponibles. uno, Selva del Amazonas. dos, Tokio, Japón. tres, Desierto del Sahara. cuatro, Lima, Perú. cinco, Groenlandia. seis, Antártida (Base McMurdo). siete, Valle de la Muerte. ocho, Gran Barrera de Coral. nueve, Siberia. Presiona el número de la zona para elegirla.

### Zonas

**8. Agrega en `voces/es/`: nómbralo `zona_amazonas.mp3`**

> Zona uno: Selva del Amazonas.

**9. Agrega en `voces/es/`: nómbralo `zona_tokyo.mp3`**

> Zona dos: Tokio, Japón.

**10. Agrega en `voces/es/`: nómbralo `zona_sahara.mp3`**

> Zona tres: Desierto del Sahara.

**11. Agrega en `voces/es/`: nómbralo `zona_lima.mp3`**

> Zona cuatro: Lima, Perú.

**12. Agrega en `voces/es/`: nómbralo `zona_greenland.mp3`**

> Zona cinco: Groenlandia.

**13. Agrega en `voces/es/`: nómbralo `zona_antarctica.mp3`**

> Zona seis: Antártida (Base McMurdo).

**14. Agrega en `voces/es/`: nómbralo `zona_death_valley.mp3`**

> Zona siete: Valle de la Muerte.

**15. Agrega en `voces/es/`: nómbralo `zona_coral_reef.mp3`**

> Zona ocho: Gran Barrera de Coral.

**16. Agrega en `voces/es/`: nómbralo `zona_siberia.mp3`**

> Zona nueve: Siberia.

### Impacto climático

**17. Agrega en `voces/es/`: nómbralo `impacto_amazonas.mp3`**

> Alerta: El aumento de temperatura y las sequías afectan la captura de CO2 y amenazan la biodiversidad amazónica.

**18. Agrega en `voces/es/`: nómbralo `impacto_tokyo.mp3`**

> Análisis: Región urbana expuesta a variaciones térmicas y al efecto de isla de calor.

**19. Agrega en `voces/es/`: nómbralo `impacto_sahara.mp3`**

> Análisis: Región desértica caracterizada por condiciones de elevada temperatura y aridez.

**20. Agrega en `voces/es/`: nómbralo `impacto_lima.mp3`**

> Análisis: Región costera peruana influenciada por el océano Pacífico y sus variaciones climáticas.

**21. Agrega en `voces/es/`: nómbralo `impacto_greenland.mp3`**

> Alerta: El incremento térmico acelera el deshielo de Groenlandia y contribuye al aumento del nivel del mar.

**22. Agrega en `voces/es/`: nómbralo `impacto_antarctica.mp3`**

> Alerta: Los cambios en la masa de hielo antártica contribuyen a la variación del nivel del mar.

**23. Agrega en `voces/es/`: nómbralo `impacto_death_valley.mp3`**

> Análisis: Valle desértico conocido por sus condiciones de temperatura extrema.

**24. Agrega en `voces/es/`: nómbralo `impacto_coral_reef.mp3`**

> Alerta: El calentamiento oceánico puede provocar blanqueamiento de corales y deterioro de los ecosistemas marinos.

**25. Agrega en `voces/es/`: nómbralo `impacto_siberia.mp3`**

> Alerta: El deshielo del permafrost puede liberar gases de efecto invernadero.

### Datos

**26. Agrega en `voces/es/`: nómbralo `conectando.mp3`**

> Conectando con la NASA. Un momento, por favor.

**27. Agrega en `voces/es/`: nómbralo `datos_listos.mp3`**

> Presiona S para escuchar la temperatura del día como música, D para repetir la descripción, T para la temperatura actual, o V para volver a la vista global.

**28. Agrega en `voces/es/`: nómbralo `error_datos.mp3`**

> No se pudieron obtener los datos climáticos de esta zona. Intenta con otra zona o inténtalo de nuevo más tarde.

**29. Agrega en `voces/es/`: nómbralo `sin_datos.mp3`**

> Todavía no hay datos de temperatura para esta zona.

### Sonificación

**30. Agrega en `voces/es/`: nómbralo `sonificacion_intro.mp3`**

> Escucharás las veinticuatro temperaturas del día, una nota por hora, desde la medianoche hasta las once de la noche, en hora universal. Una nota más aguda significa más calor. Una nota más grave significa más frío. Presiona S para detener.

**31. Agrega en `voces/es/`: nómbralo `sonificacion_fin.mp3`**

> Fin de la sonificación. Presiona S para escucharla de nuevo.

**32. Agrega en `voces/es/`: nómbralo `sonificacion_detenida.mp3`**

> Sonificación detenida.

### Sistema

**33. Agrega en `voces/es/`: nómbralo `idioma_cambiado.mp3`**

> Idioma cambiado a español.

**34. Agrega en `voces/es/`: nómbralo `voz_activada.mp3`**

> Voz propia activada.

**35. Agrega en `voces/es/`: nómbralo `voz_desactivada.mp3`**

> Voz propia desactivada. Ahora se usará tu lector de pantalla.

**36. Agrega en `voces/es/`: nómbralo `error_webgl.mp3`**

> Tu navegador no admite gráficos tridimensionales, necesarios para usar Earth Jukebox. Prueba con otro navegador.

**37. Agrega en `voces/es/`: nómbralo `error_texturas.mp3`**

> No se pudieron cargar algunas imágenes del planeta. Revisa tu conexión. Puedes seguir usando las voces y los datos.

**38. Agrega en `voces/es/`: nómbralo `modo_sordos.mp3`**  🆕 NUEVO: grábalo

> Modo para personas sordas activado. La voz se apaga y todo se mostrará con subtítulos, gráficos y vibración. Presiona A para volver al modo con voz.

**39. Agrega en `voces/es/`: nómbralo `modo_ciegos.mp3`**  🆕 NUEVO: grábalo

> Modo con voz activado. Presiona A para cambiar al modo para personas sordas.

## VOCES EN INGLÉS (mismos nombres de archivo)

Guarda cada archivo dentro de la carpeta `voces/en/`.

### Inicio y ayuda

**1. Agrega en `voces/en/`: nómbralo `bienvenida.mp3`**  ✏️ ACTUALIZADO: vuelve a grabarlo

> Welcome to Earth Jukebox, a NASA Space Apps project to explore the Earth through sounds and voices. Press Enter to travel to Earth. Press the letter I to switch between English and Spanish. Press the letter A to switch to deaf mode. Press the letter H to hear this message again.

**2. Agrega en `voces/en/`: nómbralo `mision_iniciada.mp3`**

> Traveling to Earth. You are in the global view. There are nine zones to explore. Press a number from one to nine to choose a zone, the letter L to hear the list of zones, or the letter H to hear the help. If you use a screen reader on a phone, swipe to the accessible controls to choose a zone.

**3. Agrega en `voces/en/`: nómbralo `ayuda.mp3`**  ✏️ ACTUALIZADO: vuelve a grabarlo

> Earth Jukebox help. Numbers one to nine: choose a zone on the planet. L: hear the list of zones. T: temperature and time of the zone. M: maximum and minimum temperature of the day. D: description of the climate impact. S: hear the temperature of the day as music, or stop it. Right or left arrow: move one simulated hour forward or back. E: return to real time. V or Escape: return to the global view. I: change language. A: switch between voice mode and deaf mode. C: turn captions on or off. R: switch between the built-in voice and your screen reader. X: silence. H: repeat this help.

### Navegación

**4. Agrega en `voces/en/`: nómbralo `vista_global.mp3`**

> Global view. Choose a zone with a number from one to nine, or press the letter H to hear the help.

**5. Agrega en `voces/en/`: nómbralo `elige_zona_primero.mp3`**

> First choose a zone with a number from one to nine.

**6. Agrega en `voces/en/`: nómbralo `hora_en_vivo.mp3`**

> Real time.

**7. Agrega en `voces/en/`: nómbralo `lista_zonas.mp3`**

> Available zones. one, Amazon Rainforest. two, Tokyo, Japan. three, Sahara Desert. four, Lima, Peru. five, Greenland. six, Antarctica (McMurdo Station). seven, Death Valley. eight, Great Barrier Reef. nine, Siberia. Press the number of the zone to choose it.

### Zonas

**8. Agrega en `voces/en/`: nómbralo `zona_amazonas.mp3`**

> Zone one: Amazon Rainforest.

**9. Agrega en `voces/en/`: nómbralo `zona_tokyo.mp3`**

> Zone two: Tokyo, Japan.

**10. Agrega en `voces/en/`: nómbralo `zona_sahara.mp3`**

> Zone three: Sahara Desert.

**11. Agrega en `voces/en/`: nómbralo `zona_lima.mp3`**

> Zone four: Lima, Peru.

**12. Agrega en `voces/en/`: nómbralo `zona_greenland.mp3`**

> Zone five: Greenland.

**13. Agrega en `voces/en/`: nómbralo `zona_antarctica.mp3`**

> Zone six: Antarctica (McMurdo Station).

**14. Agrega en `voces/en/`: nómbralo `zona_death_valley.mp3`**

> Zone seven: Death Valley.

**15. Agrega en `voces/en/`: nómbralo `zona_coral_reef.mp3`**

> Zone eight: Great Barrier Reef.

**16. Agrega en `voces/en/`: nómbralo `zona_siberia.mp3`**

> Zone nine: Siberia.

### Impacto climático

**17. Agrega en `voces/en/`: nómbralo `impacto_amazonas.mp3`**

> Alert: Rising temperatures and drought affect CO2 absorption and threaten Amazon biodiversity.

**18. Agrega en `voces/en/`: nómbralo `impacto_tokyo.mp3`**

> Analysis: An urban region exposed to temperature variations and the urban heat island effect.

**19. Agrega en `voces/en/`: nómbralo `impacto_sahara.mp3`**

> Analysis: A desert region characterized by high temperatures and arid conditions.

**20. Agrega en `voces/en/`: nómbralo `impacto_lima.mp3`**

> Analysis: A Peruvian coastal region influenced by the Pacific Ocean and climate variability.

**21. Agrega en `voces/en/`: nómbralo `impacto_greenland.mp3`**

> Alert: Rising temperatures accelerate Greenland ice loss and contribute to sea-level rise.

**22. Agrega en `voces/en/`: nómbralo `impacto_antarctica.mp3`**

> Alert: Changes in Antarctic ice mass contribute to sea-level variations.

**23. Agrega en `voces/en/`: nómbralo `impacto_death_valley.mp3`**

> Analysis: A desert valley known for extreme temperature conditions.

**24. Agrega en `voces/en/`: nómbralo `impacto_coral_reef.mp3`**

> Alert: Ocean warming can cause coral bleaching and damage marine ecosystems.

**25. Agrega en `voces/en/`: nómbralo `impacto_siberia.mp3`**

> Alert: Permafrost thaw can release greenhouse gases.

### Datos

**26. Agrega en `voces/en/`: nómbralo `conectando.mp3`**

> Connecting to NASA. One moment, please.

**27. Agrega en `voces/en/`: nómbralo `datos_listos.mp3`**

> Press S to hear the temperature of the day as music, D to repeat the description, T for the current temperature, or V to return to the global view.

**28. Agrega en `voces/en/`: nómbralo `error_datos.mp3`**

> The climate data for this zone could not be retrieved. Try another zone or try again later.

**29. Agrega en `voces/en/`: nómbralo `sin_datos.mp3`**

> There is no temperature data for this zone yet.

### Sonificación

**30. Agrega en `voces/en/`: nómbralo `sonificacion_intro.mp3`**

> You will hear the twenty-four temperatures of the day, one note per hour, from midnight to eleven at night, in universal time. A higher note means warmer. A lower note means colder. Press S to stop.

**31. Agrega en `voces/en/`: nómbralo `sonificacion_fin.mp3`**

> End of the sonification. Press S to hear it again.

**32. Agrega en `voces/en/`: nómbralo `sonificacion_detenida.mp3`**

> Sonification stopped.

### Sistema

**33. Agrega en `voces/en/`: nómbralo `idioma_cambiado.mp3`**

> Language changed to English.

**34. Agrega en `voces/en/`: nómbralo `voz_activada.mp3`**

> Built-in voice turned on.

**35. Agrega en `voces/en/`: nómbralo `voz_desactivada.mp3`**

> Built-in voice turned off. Your screen reader will be used now.

**36. Agrega en `voces/en/`: nómbralo `error_webgl.mp3`**

> Your browser does not support three-dimensional graphics, which Earth Jukebox needs. Please try another browser.

**37. Agrega en `voces/en/`: nómbralo `error_texturas.mp3`**

> Some images of the planet could not be loaded. Check your connection. You can keep using the voices and the data.

**38. Agrega en `voces/en/`: nómbralo `modo_sordos.mp3`**  🆕 NUEVO: grábalo

> Deaf mode turned on. The voice is switched off and everything will be shown with captions, charts and vibration. Press A to return to voice mode.

**39. Agrega en `voces/en/`: nómbralo `modo_ciegos.mp3`**  🆕 NUEVO: grábalo

> Voice mode turned on. Press A to switch to deaf mode.


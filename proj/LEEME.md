# Earth Jukebox — NASA Space Apps 2026 (versión accesible)

## Cómo abrirlo (importante)

No abras `index.html` con doble clic: los módulos de JavaScript y los MP3 necesitan un servidor local.
Dentro de esta carpeta ejecuta una de estas opciones y abre `http://localhost:8000`:

```
python3 -m http.server 8000        (o "python" en Windows)
npx serve
```

También sirve la extensión *Live Server* de VS Code.

## Estructura

```
ASTROSPE/
├── index.html
├── style.css
├── GUION_VOCES.md        <- lista de MP3 que debes grabar (nombre exacto + texto)
├── assets/Fredbox3d.gif
├── js/
│   ├── app.js            <- une todo; teclado, accesibilidad
│   ├── main.js           <- globo 3D
│   ├── api.js            <- NO TOCAR
│   ├── api-horaria.js    <- temperaturas por hora (NASA POWER)
│   ├── audio.js          <- sonificación (notas; avisa cada nota para el gráfico)
│   ├── idioma.js         <- textos ES / EN
│   ├── voces.js          <- catálogo de voces (nombres de MP3 + textos)
│   └── voz.js            <- reproduce MP3 o, si falta, voz del navegador
├── voces/
│   ├── es/               <- tus MP3 en español
│   └── en/               <- tus MP3 en inglés (mismos nombres)
├── tools/
│   ├── generar-guion.mjs <- regenera GUION_VOCES.md
│   └── revisar-voces.mjs <- dice qué MP3 faltan o tienen mal el nombre
└── docs/
```

## Cómo agregar las voces

1. Abre `GUION_VOCES.md`.
2. Genera cada audio con tu voz de IA y guárdalo con el nombre exacto (minúsculas, `.mp3`) en `voces/es/` y `voces/en/`.
3. Ejecuta `node tools/revisar-voces.mjs` para ver qué falta.

## Modos de accesibilidad

| Modo | Para quién | Qué hace |
|---|---|---|
| **Ciegos · Voz** (por defecto) | Personas ciegas o con baja visión | Voz guiada (MP3), teclado, lector de pantalla y braille |
| **Sordos · Visual** | Personas sordas o con baja audición | Sin voz. Subtítulos grandes, gráfico de 24 horas que se anima nota por nota, máxima/mínima en pantalla y vibración en el móvil (según la temperatura) |

- Se elige en la portada o con la tecla **A** (en cualquier momento). El modo se recuerda en el navegador.
- Al pasar a modo sordos, la app lo **anuncia con voz antes de apagarla**, por si alguien ciego lo activó sin querer.
- Los **subtítulos** (tecla **C**) también sirven en modo voz, para quien oye poco.
- Sordociegos: en modo sordos el texto también va al lector de pantalla / línea braille.
- La sonificación sigue sonando en ambos modos (útil para quien oye algo); en modo sordos además se ve y se siente.

## Teclas

| Tecla | Acción |
|---|---|
| Enter | Viajar a la Tierra (en la pantalla de inicio) |
| 1 – 9 | Elegir zona |
| L | Lista de zonas |
| T | Temperatura y hora de la zona |
| M | Máxima y mínima del día |
| D | Descripción del impacto climático |
| S | Sonificar / detener |
| ← → | Hora simulada −1 h / +1 h |
| E | Hora real |
| V o Esc | Vista global |
| I | Cambiar idioma |
| A | Cambiar entre modo ciegos (voz) y modo sordos (visual) |
| C | Subtítulos activados / desactivados |
| R | Voz propia ↔ lector de pantalla |
| X | Silenciar |
| H | Ayuda |
| Tab | Panel de controles accesibles (zonas y acciones como botones) |

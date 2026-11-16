// Genera GUION_VOCES.md a partir de js/voces.js
// Uso:  node tools/generar-guion.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { VOICES } from "../js/voces.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const ORDEN = [
  "Inicio y ayuda",
  "Navegación",
  "Zonas",
  "Impacto climático",
  "Datos",
  "Sonificación",
  "Sistema",
];

const entries = Object.entries(VOICES);
const porGrupo = (g) => entries.filter(([, v]) => v.grupo === g);

const seccion = (lang, carpeta, titulo) => {
  let out = `## ${titulo}\n\nGuarda cada archivo dentro de la carpeta \`${carpeta}\`.\n\n`;
  let n = 1;
  for (const grupo of ORDEN) {
    const items = porGrupo(grupo);
    if (!items.length) continue;
    out += `### ${grupo}\n\n`;
    for (const [, v] of items) {
      out += `**${n}. Agrega en \`${carpeta}\`: nómbralo \`${v.file}\`**`;
      if (v.cambio === "nuevo") out += "  🆕 NUEVO: grábalo";
      if (v.cambio === "actualizado") out += "  ✏️ ACTUALIZADO: vuelve a grabarlo";
      out += "\n\n";
      out += `> ${v[lang]}\n\n`;
      n++;
    }
  }
  return out;
};

const total = entries.length;
const pendientes = entries.filter(([, v]) => v.cambio);
const listaPendientes = pendientes.length
  ? `## ⚠️ Pendientes de grabar (${pendientes.length} por idioma)\n\n` +
    pendientes
      .map(
        ([, v]) =>
          `- \`${v.file}\` — ${v.cambio === "nuevo" ? "NUEVO" : "ACTUALIZADO (regrabar)"}`,
      )
      .join("\n") +
    "\n\nCuando termines, borra la línea `cambio: ...` de esas voces en `js/voces.js` y vuelve a ejecutar este script.\n\n"
  : "";

let md = `# Guion de voces de Earth Jukebox

Total: **${total} archivos por idioma** (${total * 2} en total).

${listaPendientes}## Reglas para que no haya errores

1. El nombre debe ser **exactamente** el que dice el guion: todo en **minúsculas**, sin espacios ni tildes, con extensión \`.mp3\` (por ejemplo \`bienvenida.mp3\`, no \`Bienvenida.mp3\`). En servidores como GitHub Pages las mayúsculas importan.
2. Español va en \`voces/es/\` e inglés en \`voces/en/\`. Los dos idiomas usan **el mismo nombre de archivo**.
3. Formato MP3. Usa la misma voz y el mismo ritmo en todos los archivos de un idioma.
4. Lee el texto tal cual aparece en el guion (puedes pegar el texto en tu generador de voz con IA).
5. No hace falta tener todos los archivos para empezar: si falta uno, la app lee ese texto con la voz del navegador. Para ver qué falta ejecuta \`node tools/revisar-voces.mjs\`.
6. Si cambias un texto en \`js/idioma.js\` o \`js/voces.js\`, vuelve a ejecutar \`node tools/generar-guion.mjs\` y regraba ese archivo.

**Nota:** la temperatura, la hora y las fechas (datos que cambian) no llevan MP3: la app las lee con la voz del navegador.

`;

md += seccion("es", "voces/es/", "VOCES EN ESPAÑOL");
md += seccion("en", "voces/en/", "VOCES EN INGLÉS (mismos nombres de archivo)");

writeFileSync(join(root, "GUION_VOCES.md"), md);
console.log(`GUION_VOCES.md generado (${total} voces por idioma).`);

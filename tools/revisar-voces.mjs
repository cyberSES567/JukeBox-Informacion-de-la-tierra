// Revisa qué archivos MP3 ya están en voces/ y cuáles faltan
// Uso:  node tools/revisar-voces.mjs

import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { VOICES } from "../js/voces.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const esperados = new Set(Object.values(VOICES).map((v) => v.file));

let faltan = 0;
let sobran = 0;

for (const lang of ["es", "en"]) {
  const dir = join(root, "voces", lang);
  const presentes = existsSync(dir)
    ? readdirSync(dir).filter((f) => !f.startsWith("."))
    : [];

  const ok = [...esperados].filter((f) => presentes.includes(f));
  const falta = [...esperados].filter((f) => !presentes.includes(f));
  const extra = presentes.filter((f) => !esperados.has(f));

  console.log(`\n=== voces/${lang}/ : ${ok.length} de ${esperados.size} ===`);

  if (falta.length) {
    console.log("Faltan:");
    falta.forEach((f) => console.log(`  - ${f}`));
  }
  if (extra.length) {
    console.log("Archivos que la app NO usa (revisa el nombre, minúsculas y .mp3):");
    extra.forEach((f) => console.log(`  ? ${f}`));
  }
  faltan += falta.length;
  sobran += extra.length;
}

console.log(
  faltan === 0 && sobran === 0
    ? "\nTodo listo."
    : `\nFaltan ${faltan}. Archivos con nombre incorrecto: ${sobran}.`,
);

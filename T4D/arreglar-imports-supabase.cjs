// Unifica TODOS los imports del cliente de Supabase usando el nombre REAL
// que tiene el archivo en tu disco.
//
// Uso (desde la carpeta del proyecto, la que contiene "src"):
//   node arreglar-imports-supabase.js            -> solo muestra qué cambiaría
//   node arreglar-imports-supabase.js --aplicar  -> aplica los cambios
//
// No toca nada más que la ruta dentro de los import. Respeta los saltos de línea.

const fs = require("fs");
const path = require("path");

const SRC = path.join(process.cwd(), "src");
const APLICAR = process.argv.includes("--aplicar");

if (!fs.existsSync(SRC)) {
  console.error('No encuentro la carpeta "src". Ejecuta este script desde la raíz del proyecto.');
  process.exit(1);
}

// 1. Recorrer src
const archivos = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) archivos.push(p);
  }
})(SRC);

// 2. Encontrar el cliente real (nombre exacto en disco)
const clientes = archivos.filter(
  (f) => /^supabaseclient\.(js|ts)$/i.test(path.basename(f)) && /^supabase$/i.test(path.basename(path.dirname(f)))
);
if (clientes.length !== 1) {
  console.error("Esperaba encontrar exactamente 1 archivo supabaseClient.js dentro de una carpeta supabase. Encontré:", clientes);
  process.exit(1);
}
const cliente = clientes[0];
const clienteSinExt = cliente.replace(/\.(js|ts)$/, "");
console.log("Archivo real en tu disco:", path.relative(process.cwd(), cliente));
console.log(APLICAR ? "Modo: APLICAR\n" : "Modo: solo mostrar (agrega --aplicar para guardar)\n");

// 3. Reescribir imports
const re = /((?:from|import)\s*\(?\s*)(["'])([^"']*supabase\/supabaseclient)(\.js)?\2/gi;
let cambiados = 0;

for (const f of archivos) {
  if (f === cliente) continue;
  const original = fs.readFileSync(f, "utf8");
  let rel = path.relative(path.dirname(f), clienteSinExt).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;

  const nuevo = original.replace(re, (m, pre, q, ruta, ext) => {
    const resultado = `${pre}${q}${rel}${ext || ""}${q}`;
    return resultado;
  });

  if (nuevo !== original) {
    cambiados++;
    const antes = [...original.matchAll(re)].map((m) => m[3]).join(", ");
    console.log(`${path.relative(process.cwd(), f)}\n   ${antes}  ->  ${rel}`);
    if (APLICAR) fs.writeFileSync(f, nuevo, "utf8");
  }
}

console.log(`\n${cambiados} archivo(s) ${APLICAR ? "corregidos" : "por corregir"}.`);

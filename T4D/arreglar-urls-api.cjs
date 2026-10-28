// Reemplaza "http://localhost:5000..." por una URL configurable (VITE_API_URL)
// Uso: node arreglar-urls-api.cjs   (ejecutar en la carpeta T4D, junto a package.json)
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const CONFIG = path.join(SRC, "apiConfig.js");

// 1. Archivo central de configuración
fs.writeFileSync(
  CONFIG,
  [
    '// URL y clave del backend. En Vercel vienen de las variables VITE_API_URL y VITE_API_KEY.',
    'export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";',
    'export const BACKEND_KEY = import.meta.env.VITE_API_KEY || "";',
    "",
  ].join("\n")
);
console.log("Creado: src/apiConfig.js");

// 2. Recorrer src y reemplazar
function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return archivos(p);
    return /\.(js|jsx)$/.test(e.name) ? [p] : [];
  });
}

let cambiados = 0;
for (const file of archivos(SRC)) {
  if (file === CONFIG) continue;
  let txt = fs.readFileSync(file, "utf8");

  // Los que ya usan VITE_API_URL se dejan como están
  if (txt.includes("import.meta.env.VITE_API_URL")) continue;
  if (!txt.includes("http://localhost:5000") && !/const API_KEY\s*=\s*"pollo"/.test(txt)) continue;

  const eol = txt.includes("\r\n") ? "\r\n" : "\n";

  // "http://localhost:5000/ruta"  ->  `${BACKEND_URL}/ruta`
  txt = txt.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`${BACKEND_URL}$1`");
  // const API_KEY = "pollo";  ->  const API_KEY = BACKEND_KEY;
  txt = txt.replace(/const API_KEY\s*=\s*"pollo";[^\r\n]*/g, "const API_KEY = BACKEND_KEY;");

  const usa = [];
  if (txt.includes("BACKEND_URL")) usa.push("BACKEND_URL");
  if (txt.includes("BACKEND_KEY")) usa.push("BACKEND_KEY");
  if (usa.length === 0) continue;

  let rel = path.relative(path.dirname(file), CONFIG).replace(/\\/g, "/").replace(/\.js$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;

  txt = `import { ${usa.join(", ")} } from "${rel}";${eol}` + txt;
  fs.writeFileSync(file, txt);
  cambiados++;
  console.log("Modificado:", path.relative(__dirname, file));
}
console.log(`\nListo. ${cambiados} archivos modificados.`);

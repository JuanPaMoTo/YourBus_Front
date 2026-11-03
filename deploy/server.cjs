// Servidor estático del frontend YourBus para Azure App Service (Linux).
// Reemplaza a "pm2 serve --spa" para poder enviar cabeceras de seguridad
// (CSP, anti-clickjacking, HSTS, etc.) y una política de caché correcta.
// No tiene dependencias: solo usa módulos nativos de Node.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const SELF = path.basename(__filename);
const BLOQUEADO = Symbol("bloqueado");

const BACKENDS = [
  "https://yourbus-back-dev-bqhfb6hghpg3h7a2.chilecentral-01.azurewebsites.net",
  "https://yourbus-back-qa2-hqhuezhzaeceajd8.chilecentral-01.azurewebsites.net",
  "https://yourbus-back-prod-h7a6hwhhhfd0ere0.chilecentral-01.azurewebsites.net",
];

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Leaflet y React aplican estilos en línea; Google Fonts entrega la hoja de estilos.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
  `connect-src 'self' ${BACKENDS.join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

// Los archivos de /assets llevan hash en el nombre: se pueden guardar en caché un año.
function cacheControl(relPath) {
  if (relPath.startsWith("assets/")) return "public, max-age=31536000, immutable";
  return "no-cache";
}

function resolverArchivo(urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  } catch {
    return BLOQUEADO;
  }
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  const abs = path.normalize(path.join(ROOT, rel));
  // Evita salir de la carpeta (path traversal) y no expone este mismo archivo.
  if (!abs.startsWith(ROOT + path.sep) || path.basename(abs) === SELF) return BLOQUEADO;
  try {
    if (fs.statSync(abs).isFile()) return { abs, rel: path.relative(ROOT, abs).split(path.sep).join("/") };
  } catch {
    // no existe: se resuelve abajo con el fallback de la SPA
  }
  return null;
}

function crearServidor() {
  return http.createServer((req, res) => {
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end();
    }

    let archivo = resolverArchivo(req.url || "/");
    const status = 200;
    if (!archivo || archivo === BLOQUEADO) {
      const pareceArchivo = path.extname((req.url || "").split("?")[0]) !== "";
      if (archivo === BLOQUEADO || pareceArchivo) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("No encontrado");
      }
      // Fallback de SPA: las rutas de React Router devuelven index.html.
      archivo = { abs: path.join(ROOT, "index.html"), rel: "index.html" };
    }

    res.writeHead(status, {
      "Content-Type": MIME[path.extname(archivo.abs).toLowerCase()] || "application/octet-stream",
      "Cache-Control": cacheControl(archivo.rel),
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(archivo.abs).pipe(res);
  });
}

if (require.main === module) {
  const port = process.env.PORT || 8080;
  crearServidor().listen(port, () => console.log(`YourBus front escuchando en el puerto ${port}`));
}

module.exports = { crearServidor, CSP, SECURITY_HEADERS };

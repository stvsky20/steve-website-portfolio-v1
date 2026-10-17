import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("../", import.meta.url));
const root = path.resolve(project, process.argv.includes("--production") ? "dist" : ".");
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".woff2":"font/woff2", ".mp3":"audio/mpeg", ".wav":"audio/wav", ".ogg":"audio/ogg" };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    let file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const data = await readFile(file);
    response.writeHead(200, {"Content-Type":types[path.extname(file)] || "application/octet-stream", "Cache-Control":"no-cache"});
    response.end(data);
  } catch {
    response.writeHead(404, {"Content-Type":"text/plain"}); response.end("Not found");
  }
}).listen(Number(process.env.PORT || 4175), "127.0.0.1", () => console.log(`Signal Station: http://127.0.0.1:${process.env.PORT || 4175}`));

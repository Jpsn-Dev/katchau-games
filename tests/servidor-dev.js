/*
 * Servidor de TESTE: serve public/ e encaminha /api/* para server/api.js usando um PostgreSQL local.
 * Reproduz o que a Cloudflare Pages faz em produção. Uso: node tests/servidor-dev.js [porta]
 */
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { tratar } from "../server/api.js";
import { criarDb } from "./psql-db.js";

const raiz = join(fileURLToPath(new URL("..", import.meta.url)), "public");
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".txt": "text/plain" };
const db = process.env.SEM_BANCO ? null : criarDb();
const porta = Number(process.argv[2]) || 8788;

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:" + porta);
  if (url.pathname.startsWith("/api/")) {
    const corpo = ["GET", "HEAD"].includes(req.method) ? undefined : await new Promise((ok) => { let t = ""; req.on("data", (c) => (t += c)); req.on("end", () => ok(t)); });
    const resp = await tratar(new Request(url, { method: req.method, headers: req.headers, body: corpo }), {}, db);
    const cab = {};
    resp.headers.forEach((v, k) => (cab[k] = v));
    res.writeHead(resp.status, cab);
    return res.end(await resp.text());
  }
  try {
    const arquivo = join(raiz, normalize(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!arquivo.startsWith(raiz)) throw new Error("fora");
    res.writeHead(200, { "Content-Type": tipos[extname(arquivo)] || "application/octet-stream" });
    res.end(await readFile(arquivo));
  } catch (e) {
    res.writeHead(404).end("não encontrado");
  }
}).listen(porta, () => console.log("http://localhost:" + porta));

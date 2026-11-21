/*
 * Worker da KaTchau (Cloudflare Workers com arquivos estáticos).
 *
 * Os arquivos de public/ são entregues direto pela Cloudflare. Só as rotas /api/*
 * chegam aqui (veja "run_worker_first" em wrangler.jsonc) e são tratadas por server/api.js.
 */
import { tratar } from "../server/api.js";
import { conectar } from "../server/db.js";

export default {
  async fetch(request, env) {
    const caminho = new URL(request.url).pathname;
    if (caminho === "/api" || caminho.startsWith("/api/")) {
      return tratar(request, env, conectar(env));
    }
    return new Response("Não encontrado", { status: 404 });
  }
};

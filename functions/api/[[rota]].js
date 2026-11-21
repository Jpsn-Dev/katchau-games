/* Ponto de entrada da API na Cloudflare Pages: todas as rotas /api/* passam por aqui. */
import { tratar } from "../../server/api.js";
import { conectar } from "../../server/db.js";

export async function onRequest(contexto) {
  return tratar(contexto.request, contexto.env, conectar(contexto.env));
}

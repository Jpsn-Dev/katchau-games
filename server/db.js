/*
 * Conexão com o Neon (PostgreSQL). A string de conexão fica na variável secreta DATABASE_URL
 * (painel da Cloudflare ou arquivo .dev.vars em desenvolvimento) — nunca no código.
 *
 * Todas as rotas usam apenas db.consultar(texto, parametros) → Promise<linhas[]>,
 * sempre com parâmetros ($1, $2…), nunca montando SQL com texto do usuário.
 */
import { neon } from "@neondatabase/serverless";

export function conectar(env) {
  if (!env || !env.DATABASE_URL) return null;
  const sql = neon(env.DATABASE_URL);
  return {
    consultar: function (texto, parametros) {
      return sql.query(texto, parametros || []);
    }
  };
}

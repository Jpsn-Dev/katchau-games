/*
 * Adaptador de TESTE: executa as consultas num PostgreSQL local usando o cliente psql.
 * Só serve para testar a API sem acessar o Neon; não é usado em produção.
 * Variáveis: PGHOST, PGPORT, PGUSER, PGDATABASE (padrões do psql).
 */
import { spawnSync } from "node:child_process";

function literal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return "'{" + v.map(function (x) { return typeof x === "number" ? x : '"' + String(x).replace(/(["\\])/g, "\\$1") + '"'; }).join(",") + "}'";
  return "E'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

function lerCsv(texto) {
  const linhas = [];
  let campo = "", linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n") { linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
    else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

export function executar(sql) {
  const r = spawnSync("psql", ["-X", "-q", "--csv", "-v", "ON_ERROR_STOP=1"], { input: sql, encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr.trim());
  return r.stdout;
}

export function criarDb() {
  return {
    consultar: async function (texto, parametros) {
      const lista = (parametros || []).map(literal).join(", ");
      const saida = executar("PREPARE q AS " + texto + ";\nEXECUTE q" + (lista ? "(" + lista + ")" : "") + ";\n");
      const csv = lerCsv(saida);
      if (!csv.length) return [];
      const colunas = csv[0];
      return csv.slice(1).map(function (l) {
        const o = {};
        colunas.forEach(function (c, i) { o[c] = l[i]; });
        return o;
      });
    }
  };
}

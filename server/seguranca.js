/*
 * Senhas e tokens de sessão.
 * Usa só a Web Crypto API (disponível no Cloudflare Workers e no Node 20+).
 * O Workers limita o PBKDF2 a 100.000 iterações; o valor fica gravado em cada hash,
 * então pode ser aumentado no futuro sem invalidar contas antigas.
 */

const ITERACOES = 100000;
const PREFIXO = "pbkdf2-sha256";

function paraBase64(bytes) {
  let t = "";
  new Uint8Array(bytes).forEach(function (b) { t += String.fromCharCode(b); });
  return btoa(t);
}

function deBase64(t) {
  return Uint8Array.from(atob(t), function (c) { return c.charCodeAt(0); });
}

async function derivar(senha, sal, iteracoes) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]);
  return paraBase64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iteracoes }, material, 256));
}

function iguais(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function gerarHashSenha(senha) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  return [PREFIXO, ITERACOES, paraBase64(sal), await derivar(senha, sal, ITERACOES)].join("$");
}

export async function verificarSenha(senha, armazenado) {
  const partes = String(armazenado || "").split("$");
  if (partes.length !== 4 || partes[0] !== PREFIXO) return false;
  const iteracoes = Number(partes[1]);
  if (!Number.isInteger(iteracoes) || iteracoes < 1000 || iteracoes > ITERACOES) return false;
  try {
    return iguais(await derivar(senha, deBase64(partes[2]), iteracoes), partes[3]);
  } catch (e) {
    return false;
  }
}

/** Mesmo custo de uma verificação real, para o tempo não revelar se o e-mail existe. */
export async function gastarTempoDeVerificacao(senha) {
  await derivar(senha, crypto.getRandomValues(new Uint8Array(16)), ITERACOES);
}

export function novoToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

export async function sha256Hex(texto) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(h), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

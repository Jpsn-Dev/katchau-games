/* Utilitários HTTP da API: respostas JSON, cookies e leitura segura do corpo. */

export const NOME_COOKIE = "katchau_sessao";
export const DURACAO_SESSAO_S = 60 * 60 * 24 * 7; // 7 dias
const LIMITE_CORPO = 20 * 1024;

export function json(dados, status, cabecalhos) {
  const h = new Headers(cabecalhos);
  h.set("Content-Type", "application/json; charset=utf-8");
  h.set("Cache-Control", "no-store");
  h.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(dados), { status: status || 200, headers: h });
}

export function erro(status, mensagem, extra) {
  return json(Object.assign({ erro: mensagem }, extra || {}), status);
}

export function lerCookie(request, nome) {
  const bruto = request.headers.get("Cookie") || "";
  for (const parte of bruto.split(";")) {
    const i = parte.indexOf("=");
    if (i > -1 && parte.slice(0, i).trim() === nome) {
      try {
        return decodeURIComponent(parte.slice(i + 1).trim());
      } catch (e) {
        return null; // cookie malformado
      }
    }
  }
  return null;
}

export function cookieSessao(request, token, maxAge) {
  const seguro = new URL(request.url).protocol === "https:";
  return (
    NOME_COOKIE + "=" + encodeURIComponent(token) +
    "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + maxAge + (seguro ? "; Secure" : "")
  );
}

/** Em requisições que alteram dados, o Origin (se enviado) precisa ser o próprio site. */
export function origemPermitida(request) {
  const origem = request.headers.get("Origin");
  if (!origem) return true;
  try {
    return new URL(origem).host === new URL(request.url).host;
  } catch (e) {
    return false;
  }
}

/** Lê o corpo JSON; devolve { dados } ou { resposta } (erro pronto para enviar). */
export async function lerJson(request) {
  const tipo = request.headers.get("Content-Type") || "";
  if (tipo.indexOf("application/json") === -1) return { resposta: erro(415, "Envie os dados em JSON.") };
  const texto = await request.text();
  if (texto.length > LIMITE_CORPO) return { resposta: erro(413, "Requisição grande demais.") };
  try {
    const dados = JSON.parse(texto);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new Error("formato");
    return { dados: dados };
  } catch (e) {
    return { resposta: erro(400, "JSON inválido.") };
  }
}

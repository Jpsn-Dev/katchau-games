/*
 * KaTchau — comunicação com a API (/api/...), que guarda contas e pedidos no banco de dados.
 *
 * O site funciona de duas formas:
 *  - "servidor": publicado (ex.: Cloudflare Pages) com a API e o banco configurados;
 *  - "local": aberto direto do arquivo ou pelo Live Server, sem API — o cadastro/login e o
 *    carrinho ficam só no navegador, como antes.
 * A escolha é automática: a página pergunta a /api/saude se o banco está respondendo.
 */

const api = (function () {
  const TEMPO_LIMITE_MS = 8000;
  let sondagem = null;

  /** Faz a chamada e devolve { ok, status, dados, rede }. Nunca lança erro. */
  async function chamar(metodo, caminho, corpo, tempoLimite) {
    const controle = new AbortController();
    const timer = setTimeout(function () { controle.abort(); }, tempoLimite || TEMPO_LIMITE_MS);
    try {
      const opcoes = { method: metodo, credentials: "same-origin", signal: controle.signal, headers: {} };
      if (corpo !== undefined) {
        opcoes.headers["Content-Type"] = "application/json";
        opcoes.body = JSON.stringify(corpo);
      }
      const resposta = await fetch(caminho, opcoes);
      let dados = null;
      try { dados = await resposta.json(); } catch (e) { /* resposta sem JSON */ }
      return { ok: resposta.ok, status: resposta.status, dados: dados, rede: false };
    } catch (e) {
      return { ok: false, status: 0, dados: null, rede: true };
    } finally {
      clearTimeout(timer);
    }
  }

  /** true quando existe uma API com banco de dados respondendo neste endereço. */
  function disponivel() {
    if (!sondagem) {
      sondagem = (async function () {
        if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return false;
        const r = await chamar("GET", "/api/saude", undefined, 4000);
        return !!(r.ok && r.dados && r.dados.banco === true);
      })();
    }
    return sondagem;
  }

  return { chamar: chamar, disponivel: disponivel };
})();

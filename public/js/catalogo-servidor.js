/*
 * KaTchau — catálogo do banco de dados.
 *
 * Com a API ativa, busca os produtos do banco e guarda uma cópia neste navegador.
 * js/dados.js usa essa cópia na página seguinte (assim nenhuma página precisa esperar a rede).
 * Sem API, não faz nada e vale o catálogo estático de dados.js.
 */

(function () {
  const CHAVE = "katchau-catalogo-v1";

  function resumo(lista) {
    return JSON.stringify(lista.map(function (p) {
      return [p.id, p.slug, p.name, p.category, p.platforms, p.price, p.oldPrice, p.tag, p.image, p.kind];
    }));
  }

  auth.pronto.then(async function () {
    if (auth.modo() !== "servidor") return;
    const r = await api.chamar("GET", "/api/produtos");
    if (!r.ok || !r.dados || !Array.isArray(r.dados.produtos) || !r.dados.produtos.length) return;
    const novos = r.dados.produtos.filter(function (p) { return Object.prototype.hasOwnProperty.call(IMAGENS, p.image); });
    if (novos.length !== r.dados.produtos.length) return; // imagem desconhecida: não arrisca
    // A ordem de PRODUTOS é a ordem padrão da vitrine: mantém a dos produtos conhecidos
    // e deixa os produtos novos (que só existem no banco) no fim.
    const posicao = new Map(PRODUTOS.map(function (p, i) { return [p.id, i]; }));
    novos.sort(function (a, b) {
      return (posicao.has(a.id) ? posicao.get(a.id) : 1e6 + a.id) - (posicao.has(b.id) ? posicao.get(b.id) : 1e6 + b.id);
    });
    if (resumo(novos) === resumo(PRODUTOS)) {
      try { // mesmo catálogo: só renova o prazo da cópia, se ela existir
        const atual = JSON.parse(window.localStorage.getItem(CHAVE) || "null");
        if (atual) window.localStorage.setItem(CHAVE, JSON.stringify({ em: Date.now(), produtos: atual.produtos }));
      } catch (e) { /* ignora */ }
      return;
    }
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify({ em: Date.now(), produtos: novos }));
    } catch (e) { /* sem armazenamento: continua com o catálogo estático */ }
  });
})();

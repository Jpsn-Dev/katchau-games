/*
 * KaTchau — carrinho da conta.
 *
 * Com o banco ativo e o usuário conectado, o carrinho é guardado também no servidor:
 *  - ao entrar, junta o carrinho do navegador com o da conta (maior quantidade de cada produto);
 *  - a cada mudança, envia o carrinho ao servidor (com uma pequena espera para agrupar cliques);
 *  - ao sair da conta, esvazia o carrinho deste navegador (ele continua salvo na conta).
 * Sem API ou sem login, nada disso acontece e o carrinho segue só no navegador.
 */

(function () {
  let conciliadoPara = null; // e-mail cujo carrinho já foi conciliado com o servidor
  let aplicando = false;
  let espera = null;

  function itensLocais() {
    return carrinho.itens().map(function (i) { return { id: i.id, qty: i.qty }; });
  }

  function enviar() {
    clearTimeout(espera);
    espera = setTimeout(async function () {
      espera = null;
      const usuario = auth.usuario();
      if (!usuario || conciliadoPara !== usuario.email) return;
      const r = await api.chamar("PUT", "/api/carrinho", { itens: itensLocais() });
      if (r.status === 401) auth.sessaoExpirou();
    }, 500);
  }

  async function conciliar(usuario) {
    conciliadoPara = usuario.email;
    const r = await api.chamar("GET", "/api/carrinho");
    if (r.status === 401) { conciliadoPara = null; auth.sessaoExpirou(); return; }
    if (!r.ok || !r.dados) { conciliadoPara = null; return; }

    const maior = new Map();
    r.dados.itens.concat(itensLocais()).forEach(function (i) {
      maior.set(i.id, Math.max(maior.get(i.id) || 0, i.qty));
    });
    const juntos = Array.from(maior, function (par) { return { id: par[0], qty: par[1] }; })
      .sort(function (a, b) { return a.id - b.id; });

    aplicando = true;
    carrinho.definir(juntos);
    aplicando = false;

    const noServidor = JSON.stringify(r.dados.itens.slice().sort(function (a, b) { return a.id - b.id; }));
    if (JSON.stringify(itensLocais().sort(function (a, b) { return a.id - b.id; })) !== noServidor) enviar();
  }

  // Se a página for fechada ou trocada durante a espera, envia na hora (keepalive termina mesmo após sair).
  function enviarAoSair() {
    if (!espera) return;
    clearTimeout(espera);
    espera = null;
    const usuario = auth.usuario();
    if (!usuario || conciliadoPara !== usuario.email) return;
    try {
      fetch("/api/carrinho", {
        method: "PUT", credentials: "same-origin", keepalive: true,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itens: itensLocais() })
      });
    } catch (e) { /* sem rede: o carrinho local continua e é conciliado na próxima visita */ }
  }
  window.addEventListener("pagehide", enviarAoSair);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") enviarAoSair(); });

  carrinho.assinar(function () {
    if (aplicando) return;
    const usuario = auth.usuario();
    if (auth.modo() === "servidor" && usuario && conciliadoPara === usuario.email) enviar();
  });

  auth.assinar(function (usuario) {
    if (auth.modo() !== "servidor") return;
    if (usuario && conciliadoPara !== usuario.email) conciliar(usuario);
    else if (!usuario) conciliadoPara = null;
  });

  window.addEventListener("katchau:saiu", function () {
    if (auth.modo() === "servidor") {
      clearTimeout(espera);
      conciliadoPara = null;
      carrinho.limpar();
    }
  });
})();

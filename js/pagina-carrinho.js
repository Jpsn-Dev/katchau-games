/*
 * KaTchau — página do carrinho (carrinho.html).
 */

(function () {
  const raiz = document.getElementById("carrinho-raiz");
  if (!raiz) return;

  /* Diálogo de confirmação "Esvaziar o carrinho?" */
  const camadaConfirmar = document.getElementById("confirmar-camada");
  const confirmar = criarCamada(camadaConfirmar, { focoInicial: "[data-fechar]" });
  const elDescricaoConfirmar = document.getElementById("confirmar-descricao");

  document.getElementById("confirmar-limpar").addEventListener("click", function () {
    carrinho.limpar();
    confirmar.fechar();
    toast("Carrinho esvaziado");
  });

  function renderizar() {
    const itens = carrinho.itens();
    const linhas = itens
      .map(function (i) { return { id: i.id, qty: i.qty, produto: obterProduto(i.id) }; })
      .filter(function (l) { return l.produto; });
    const totais = totaisCarrinho(itens, PRODUTOS);
    const quantidade = contarItens(itens);

    const botaoLimpar = linhas.length
      ? '<button type="button" class="clear-cart" id="abrir-limpar">' + icone("trash") + " Limpar carrinho</button>"
      : "";

    let corpo;
    if (linhas.length === 0) {
      corpo =
        '<div class="cart-empty">' + icone("shopping-bag") +
        '<p class="display">Seu carrinho está vazio</p>' +
        '<p class="m">Adicione produtos pelo catálogo — consoles, jogos e periféricos esperam por você.</p>' +
        '<a href="catalogo.html" class="btn btn-brand btn-xl">Voltar ao catálogo</a></div>';
    } else {
      const itensHtml = linhas.map(function (l) {
        const p = l.produto;
        return (
          '<li class="cart-line">' +
          '<a href="' + urlProduto(p) + '" class="cart-thumb group">' + htmlImagemProduto(p) + "</a>" +
          '<div class="cart-info"><div class="cart-info-top"><div>' +
          '<p class="cart-plat">' + esc(p.platforms.join(" · ")) + "</p>" +
          '<a href="' + urlProduto(p) + '" class="cart-name">' + esc(p.name) + "</a>" +
          '<p class="cart-each">' + dinheiro(p.price) + " cada</p></div>" +
          '<p class="cart-line-total">' + dinheiro(p.price * l.qty) + "</p></div>" +
          '<div class="cart-info-bottom"><div class="qty">' +
          '<button type="button" data-menos="' + p.id + '" aria-label="Diminuir quantidade">' + icone("minus") + "</button>" +
          '<span class="n">' + l.qty + "</span>" +
          '<button type="button" data-mais="' + p.id + '" aria-label="Aumentar quantidade"' + (l.qty >= QTD_MAXIMA ? " disabled" : "") + ">" + icone("plus") + "</button></div>" +
          '<button type="button" class="remove-btn" data-remover="' + p.id + '">' + icone("trash") + " Remover</button></div></div></li>"
        );
      }).join("");

      corpo =
        '<div class="cart-layout"><ul class="cart-list">' + itensHtml + "</ul>" +
        '<aside class="summary"><h2 class="h-label">Resumo do pedido</h2><dl>' +
        "<div><dt>Produtos (" + quantidade + ")</dt><dd>" + dinheiro(totais.subtotal + totais.savings) + "</dd></div>" +
        '<div><dt>Descontos</dt><dd class="ok">− ' + dinheiro(totais.savings) + "</dd></div></dl>" +
        '<div class="summary-total"><span>Total</span><div class="r">' +
        '<p class="tot">' + dinheiro(totais.subtotal) + "</p>" +
        '<p class="inst">ou ' + MAX_PARCELAS + "x de " + dinheiro(valorParcela(totais.subtotal)) + " sem juros</p></div></div>" +
        '<button type="button" class="btn btn-brand btn-xl w-full" id="finalizar">Finalizar compra ' + icone("arrow-right") + "</button>" +
        '<a href="catalogo.html" class="btn btn-ghost w-full">Continuar comprando</a>' +
        '<p class="note">Ambiente demonstrativo. Nenhuma cobrança será feita.</p></aside></div>';
    }

    raiz.innerHTML =
      '<span class="eyebrow">Sua seleção</span>' +
      '<div class="cart-head"><h1 class="display">Carrinho</h1>' + botaoLimpar + "</div>" + corpo;

    elDescricaoConfirmar.textContent =
      "Todos os " + quantidade + " " + (quantidade === 1 ? "item será removido" : "itens serão removidos") + ". Essa ação não pode ser desfeita.";
  }

  raiz.addEventListener("click", function (e) {
    const alvo = e.target.closest("button");
    if (!alvo) return;
    const item = function (attr) { return Number(alvo.getAttribute(attr)); };
    const atual = function (id) {
      return carrinho.itens().find(function (i) { return i.id === id; });
    };
    if (alvo.hasAttribute("data-menos")) {
      const id = item("data-menos");
      carrinho.definirQtd(id, atual(id).qty - 1);
    } else if (alvo.hasAttribute("data-mais")) {
      const id = item("data-mais");
      carrinho.definirQtd(id, atual(id).qty + 1);
    } else if (alvo.hasAttribute("data-remover")) {
      carrinho.remover(item("data-remover"));
    } else if (alvo.id === "abrir-limpar") {
      confirmar.abrir(alvo);
    } else if (alvo.id === "finalizar") {
      toast("Compra simulada", { descricao: "Este é um ambiente demonstrativo: nenhum pedido ou pagamento foi realizado." });
    }
  });

  carrinho.assinar(renderizar);
  renderizar();
})();

/*
 * KaTchau — página de detalhes do produto (produto.html?slug=...).
 */

(function () {
  const raiz = document.getElementById("produto-raiz");
  if (!raiz) return;

  const slug = lerParametros().slug;
  const p = PRODUTOS.find(function (x) { return x.slug === slug; });

  /* ---------- produto inexistente ---------- */
  if (!p) {
    document.title = "Produto | KaTchau";
    raiz.innerHTML =
      '<div class="wrap not-found"><p class="display">Produto não encontrado</p>' +
      '<p class="m">Esse item não está mais no catálogo.</p>' +
      '<a href="catalogo.html" class="btn btn-brand">Ver catálogo</a></div>';
    return;
  }

  /* ---------- metadados da página ---------- */
  const titulo = p.name + " | KaTchau";
  const descricao = p.name + " para " + p.platforms.join(", ") + " por " + dinheiro(p.price) + " na KaTchau.";
  document.title = titulo;
  const definirMeta = function (seletor, valor) {
    const el = document.querySelector(seletor);
    if (el) el.setAttribute("content", valor);
  };
  definirMeta('meta[name="description"]', descricao);
  definirMeta('meta[property="og:title"]', titulo);
  definirMeta('meta[property="og:description"]', descricao);

  /* ---------- textos ---------- */
  function descreverProduto(prod) {
    if (prod.category === "Consoles") {
      return "O " + prod.name + " entrega desempenho de sobra para os maiores lançamentos, com acesso a toda a biblioteca da plataforma " + prod.platforms[0] + ". Ideal para quem quer começar uma coleção ou dar o próximo passo.";
    }
    if (prod.category === "Jogos") {
      return prod.name + " é uma das experiências mais marcantes do catálogo. Disponível para " + prod.platforms.join(" e ") + ", é escolha certa para quem busca horas de diversão e uma grande história.";
    }
    return prod.name + " foi pensado para jogar por horas com conforto e precisão. Compatível com " + prod.platforms.join(" e ") + ", completa o seu setup com qualidade.";
  }

  const desconto = percentualDesconto(p.price, p.oldPrice);
  const resumo = obterAvaliacoes(p);
  const notaTexto = resumo.average.toFixed(1).replace(".", ",");
  const relacionados = PRODUTOS
    .filter(function (x) {
      return x.id !== p.id && (x.category === p.category || x.platforms.some(function (pl) { return p.platforms.indexOf(pl) !== -1; }));
    })
    .sort(function (a, b) { return Number(b.category === p.category) - Number(a.category === p.category); })
    .slice(0, 4);

  /* ---------- avaliações ---------- */
  const distribuicao = [5, 4, 3, 2, 1].map(function (n) {
    const exibidas = resumo.reviews.filter(function (r) { return r.rating === n; }).length;
    const base = n === 5 ? 0.62 : n === 4 ? 0.27 : n === 3 ? 0.08 : n === 2 ? 0.02 : 0.01;
    return { n: n, share: (base * 3 + exibidas / resumo.reviews.length) / 4 };
  });

  const htmlDistribuicao = distribuicao.map(function (d) {
    const pct = Math.round(d.share * 100);
    return (
      '<li><span class="k">' + d.n + '</span><span class="bar"><span style="width:' + pct + '%"></span></span>' +
      '<span class="pct">' + pct + "%</span></li>"
    );
  }).join("");

  const htmlAvaliacoes = resumo.reviews.map(function (r) {
    const iniciais = r.author.split(" ").map(function (w) { return w[0]; }).join("");
    return (
      '<li class="rev"><div class="rev-top">' + htmlEstrelas(r.rating, "") + '<span class="date">' + esc(r.date) + "</span></div>" +
      '<p class="ttl">' + esc(r.title) + "</p><p class=\"txt\">" + esc(r.text) + "</p>" +
      '<div class="rev-author"><span class="av">' + esc(iniciais) + "</span>" +
      '<span class="who"><b>' + esc(r.author) + "</b> <span>· " + esc(r.city) + "</span></span></div></li>"
    );
  }).join("");

  /* ---------- montagem da página ---------- */
  raiz.innerHTML =
    '<div class="wrap product-page">' +
    '<nav aria-label="Navegação estrutural" class="crumbs">' +
    '<a href="index.html">Início</a>' + icone("chevron-right") +
    '<a href="' + PAGINA_CATEGORIA[p.category] + '">' + esc(p.category) + "</a>" + icone("chevron-right") +
    '<span class="current">' + esc(p.name) + "</span></nav>" +

    '<div class="product-grid-main">' +
    '<div class="product-media group">' + htmlImagemProduto(p, { grande: true }) + '<span class="tag">' + esc(p.tag) + "</span></div>" +

    '<div class="product-info">' +
    '<span class="eyebrow">' + esc(p.platforms.join(" · ")) + "</span>" +
    '<h1 class="display">' + esc(p.name) + "</h1>" +
    '<a href="#avaliacoes" class="rating-link">' + htmlEstrelas(resumo.average, "") +
    '<span class="avg">' + notaTexto + "</span><span>· " + resumo.count + " avaliações demonstrativas</span></a>" +
    '<p class="product-code">Código KT-' + String(p.id).padStart(4, "0") + " · " + esc(p.category) + "</p>" +

    '<div class="buy-box">' +
    '<div class="buy-old"><span class="o">' + dinheiro(p.oldPrice) + "</span>" +
    (desconto > 0 ? '<span class="badge-off">-' + desconto + "%</span>" : "") + "</div>" +
    '<p class="buy-price">' + dinheiro(p.price) + "</p>" +
    '<p class="buy-installment">ou ' + MAX_PARCELAS + "x de " + dinheiro(valorParcela(p.price)) + " sem juros</p>" +
    '<div class="buy-actions">' +
    '<div class="qty"><button type="button" id="qtd-menos" aria-label="Diminuir quantidade">' + icone("minus") + "</button>" +
    '<span class="n" id="qtd-valor">1</span>' +
    '<button type="button" id="qtd-mais" aria-label="Aumentar quantidade">' + icone("plus") + "</button></div>" +
    '<button type="button" class="btn btn-brand btn-xl" id="btn-adicionar">' + icone("shopping-bag") + " Adicionar ao carrinho</button></div>" +
    '<button type="button" class="btn btn-line btn-xl buy-now" id="btn-comprar-agora">Comprar agora</button>' +
    '<p class="buy-note">Preço ilustrativo — nenhuma compra real é realizada.</p></div>' +

    '<ul class="perks">' +
    "<li>" + icone("shield-check") + "<span>Compra simulada e segura</span></li>" +
    "<li>" + icone("tag") + "<span>Economia de " + dinheiro(p.oldPrice - p.price) + "</span></li>" +
    "<li>" + icone("sparkles") + "<span>Para " + esc(p.platforms.join(" e ")) + "</span></li></ul>" +

    '<div class="about-product"><h2 class="h-label">Sobre o produto</h2><p>' + esc(descreverProduto(p)) + "</p></div>" +
    "</div></div></div>" +

    '<section id="avaliacoes" class="wrap reviews"><span class="eyebrow">Opiniões</span>' +
    '<h2 class="display">Avaliações</h2>' +
    '<p class="sub">Avaliações demonstrativas criadas para este projeto acadêmico — não são opiniões de compradores reais.</p>' +
    '<div class="reviews-grid"><div class="rev-summary">' +
    '<p class="big">' + notaTexto + "</p>" + htmlEstrelas(resumo.average, "") +
    '<p class="cnt">' + resumo.count + " avaliações</p>" +
    '<ul class="dist">' + htmlDistribuicao + "</ul></div>" +
    '<ul class="rev-list">' + htmlAvaliacoes + "</ul></div></section>" +

    (relacionados.length
      ? '<section class="wrap related"><span class="eyebrow">Você também pode gostar</span>' +
        '<h2 class="display">Combina com isso</h2>' +
        '<div class="product-grid related">' + htmlGradeProdutos(relacionados) + "</div></section>"
      : "");

  /* ---------- interação ---------- */
  let qtd = 1;
  const elQtd = document.getElementById("qtd-valor");
  const botaoMenos = document.getElementById("qtd-menos");
  const botaoMais = document.getElementById("qtd-mais");

  function atualizarQtd() {
    elQtd.textContent = qtd;
    botaoMenos.disabled = qtd <= 1;
    botaoMais.disabled = qtd >= QTD_MAXIMA;
  }
  botaoMenos.addEventListener("click", function () { qtd = Math.max(1, qtd - 1); atualizarQtd(); });
  botaoMais.addEventListener("click", function () { qtd = Math.min(QTD_MAXIMA, qtd + 1); atualizarQtd(); });
  atualizarQtd();

  document.getElementById("btn-adicionar").addEventListener("click", function () {
    adicionarAoCarrinho(p, qtd);
  });
  document.getElementById("btn-comprar-agora").addEventListener("click", function () {
    carrinho.adicionar(p.id, qtd);
    window.location.href = "carrinho.html";
  });
})();

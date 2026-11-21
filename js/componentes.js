/*
 * KaTchau — blocos reutilizáveis de interface (geram HTML).
 */

function urlProduto(p) {
  return "produto.html?slug=" + encodeURIComponent(p.slug);
}

const PAGINA_CATEGORIA = { "Consoles": "consoles.html", "Jogos": "jogos.html", "Periféricos": "perifericos.html" };

function htmlEstrelas(valor, classe) {
  let html = '<span class="stars' + (classe ? " " + classe : "") + '" aria-label="Nota ' + valor.toFixed(1) + ' de 5">';
  for (let i = 1; i <= 5; i++) {
    const preenchimento = Math.max(0, Math.min(1, valor - (i - 1)));
    html +=
      '<span class="star">' + icone("star") +
      '<span class="fill" style="width:' + preenchimento * 100 + '%">' + icone("star") + "</span></span>";
  }
  return html + "</span>";
}

function htmlImagemProduto(p, opcoes) {
  opcoes = opcoes || {};
  const jogo = p.kind === "game";
  const classes = ["pimg", jogo ? "game grid-texture" : "hardware"];
  if (opcoes.grande) classes.push("large");
  return (
    '<div class="' + classes.join(" ") + '">' +
    '<img src="' + esc(imagem(p.image)) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">' +
    "</div>"
  );
}

function htmlNotaProduto(p) {
  const a = obterAvaliacoes(p);
  return (
    '<div class="rating">' + htmlEstrelas(a.average, "") +
    '<span class="avg">' + a.average.toFixed(1).replace(".", ",") + "</span>" +
    "<span>(" + a.count + ")</span></div>"
  );
}

function htmlCartaoProduto(p) {
  const desconto = percentualDesconto(p.price, p.oldPrice);
  return (
    '<article class="card group">' +
    '<a href="' + urlProduto(p) + '" class="card-media" aria-label="' + esc(p.name) + '">' +
    htmlImagemProduto(p) +
    '<div class="card-tag"><span>' + esc(p.tag) + "</span></div>" +
    (desconto > 0 ? '<span class="badge-off">-' + desconto + "%</span>" : "") +
    "</a>" +
    '<div class="card-body">' +
    '<span class="card-plat">' + esc(p.platforms.join(" · ")) + "</span>" +
    '<a href="' + urlProduto(p) + '" class="card-title line-clamp-2">' + esc(p.name) + "</a>" +
    htmlNotaProduto(p) +
    '<div class="card-price-row"><div>' +
    '<div class="old-price">' + dinheiro(p.oldPrice) + "</div>" +
    '<div class="card-price">' + dinheiro(p.price) + "</div>" +
    '<div class="card-installment">ou ' + MAX_PARCELAS + "x de " + dinheiro(valorParcela(p.price)) + "</div>" +
    "</div>" +
    '<button type="button" class="add-btn" data-add="' + p.id + '" aria-label="Adicionar ' + esc(p.name) + ' ao carrinho">' +
    icone("plus") + "</button>" +
    "</div></div></article>"
  );
}

function htmlGradeProdutos(lista) {
  return lista.map(htmlCartaoProduto).join("");
}

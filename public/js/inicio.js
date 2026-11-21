/*
 * KaTchau — página inicial: destaque, plataformas, mais procurados e vitrine de jogos.
 */

(function () {
  const porIds = function (ids) {
    return ids.map(obterProduto).filter(function (p) { return !!p; });
  };

  /* Cartão "Lançamento" do hero (Nintendo Switch 2) */
  const heroProduto = obterProduto(5);
  const heroCartao = document.getElementById("hero-cartao");
  if (heroProduto && heroCartao) {
    heroCartao.innerHTML =
      '<div class="hero-card-top"><span class="kicker">Lançamento</span>' +
      '<span class="badge-off">-' + percentualDesconto(heroProduto.price, heroProduto.oldPrice) + "%</span></div>" +
      '<a href="' + urlProduto(heroProduto) + '" class="group">' + htmlImagemProduto(heroProduto) + "</a>" +
      '<div class="hero-card-body">' +
      '<div><p class="plat">' + esc(heroProduto.platforms.join(" · ")) + "</p>" +
      '<p class="name">' + esc(heroProduto.name) + "</p></div>" +
      '<div class="hero-card-price"><div>' +
      '<div class="old-price">' + dinheiro(heroProduto.oldPrice) + "</div>" +
      '<div class="now">' + dinheiro(heroProduto.price) + "</div></div>" +
      '<button type="button" class="btn btn-brand" data-add="' + heroProduto.id + '">Comprar</button></div></div>';
  }

  /* Contagem de produtos por plataforma */
  document.querySelectorAll("[data-plataforma-total]").forEach(function (el) {
    const nome = el.getAttribute("data-plataforma-total");
    el.textContent = PRODUTOS.filter(function (p) { return p.platforms.indexOf(nome) !== -1; }).length;
  });

  /* Mais procurados */
  const destaques = document.getElementById("mais-procurados");
  if (destaques) destaques.innerHTML = htmlGradeProdutos(porIds(IDS_DESTAQUE));

  /* Na fila do play */
  const prateleira = document.getElementById("fila-do-play");
  if (prateleira) {
    prateleira.innerHTML = porIds(IDS_JOGOS_EM_DESTAQUE)
      .map(function (g) {
        return (
          '<a href="' + urlProduto(g) + '" class="shelf-item group">' +
          '<div class="shelf-cover"><img src="' + esc(imagem(g.image)) + '" alt="' + esc(g.name) + '" loading="lazy"></div>' +
          '<p class="gname line-clamp-1">' + esc(g.name) + "</p>" +
          '<p class="gprice">' + dinheiro(g.price) + "</p></a>"
        );
      })
      .join("");
  }
})();

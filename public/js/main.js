/*
 * KaTchau — comportamento comum a todas as páginas:
 * contador do carrinho, busca do cabeçalho, menu do celular e botões "adicionar".
 */

(function () {
  /* ---------- imagens fixas da página (logotipo e capas) ---------- */
  document.querySelectorAll("img[data-img]").forEach(function (img) {
    img.src = imagem(img.getAttribute("data-img"));
  });

  /* ---------- contador do carrinho ---------- */
  function atualizarContador() {
    const total = contarItens(carrinho.itens());
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = total; });
    document.querySelectorAll("[data-cart-link]").forEach(function (el) {
      el.setAttribute("aria-label", "Carrinho, " + total + " " + (total === 1 ? "item" : "itens"));
    });
  }
  carrinho.assinar(atualizarContador);
  atualizarContador();

  /* ---------- botão de conta (cabeçalho, menu do celular e rodapé) ---------- */
  function atualizarConta() {
    const usuario = auth.usuario();
    const primeiroNome = usuario ? usuario.nome.split(" ")[0] : "";
    document.querySelectorAll("[data-conta-label]").forEach(function (el) {
      const modo = el.getAttribute("data-conta-label");
      if (modo === "curto") el.textContent = usuario ? primeiroNome : "Entrar";
      else if (modo === "menu") el.textContent = usuario ? "Minha conta" : "Entrar";
      else el.textContent = usuario ? "Minha conta" : "Entrar / Criar conta";
    });
    document.querySelectorAll("[data-conta-link]").forEach(function (el) {
      el.setAttribute("aria-label", usuario ? "Minha conta, " + usuario.nome : "Entrar ou criar conta");
    });
  }
  auth.assinar(atualizarConta);
  atualizarConta();

  /* ---------- busca do cabeçalho ---------- */
  const termoAtual = function () {
    return (lerParametros().q || "").slice(0, 80);
  };

  window.sincronizarBusca = function (termo) {
    document.querySelectorAll("form[role=search] input").forEach(function (input) { input.value = termo; });
  };
  window.sincronizarBusca(termoAtual());

  // Menu do celular (criado antes dos formulários para poder ser fechado ao buscar)
  let menu = null;
  const camadaMenu = document.getElementById("menu-camada");
  if (camadaMenu) {
    menu = criarCamada(camadaMenu);
    const gatilho = document.querySelector("[data-abrir-menu]");
    if (gatilho) gatilho.addEventListener("click", function () { menu.abrir(gatilho); });
    camadaMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.fechar(); });
    });
  }

  document.querySelectorAll("form[role=search]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = form.querySelector("input").value.trim();
      if (menu && menu.estaAberta()) menu.fechar();
      // Na página do catálogo a navegação acontece sem recarregar.
      if (typeof window.buscarNoCatalogo === "function") {
        window.buscarNoCatalogo(q);
        return;
      }
      window.location.href = "catalogo.html" + (q ? "?q=" + encodeURIComponent(q.slice(0, 80)) : "");
    });
  });

  /* ---------- botões "adicionar ao carrinho" (cartões e destaque) ---------- */
  document.addEventListener("click", function (e) {
    const botao = e.target.closest("[data-add]");
    if (!botao) return;
    const produto = obterProduto(Number(botao.getAttribute("data-add")));
    if (produto) adicionarAoCarrinho(produto);
  });
})();

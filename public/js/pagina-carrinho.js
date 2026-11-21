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

  /* ---------- finalizar pedido (só quando o site está ligado ao banco de dados) ---------- */
  const camadaCheckout = document.getElementById("checkout-camada");
  const checkout = criarCamada(camadaCheckout, { focoInicial: "input[type=radio]:checked" });
  const formCheckout = document.getElementById("form-checkout");
  const painelForm = document.getElementById("checkout-formulario");
  const painelSucesso = document.getElementById("checkout-sucesso");
  const caixaErro = formCheckout.querySelector(".form-error");
  const botaoConfirmar = formCheckout.querySelector("button[type=submit]");
  const NOMES_PAGAMENTO = { pix: "Pix", cartao: "cartão", boleto: "boleto" };

  function mostrarErroCheckout(mensagem, campo) {
    caixaErro.textContent = mensagem;
    caixaErro.hidden = !mensagem;
    formCheckout.querySelectorAll(".input").forEach(function (c) { c.removeAttribute("aria-invalid"); });
    if (mensagem && campo) { campo.setAttribute("aria-invalid", "true"); campo.focus(); }
  }

  const CAMPOS_ENDERECO = [
    ["cep", "Informe o CEP com 8 números.", function (v) { return v.replace(/\D/g, "").length === 8; }],
    ["logradouro", "Informe a rua ou avenida.", function (v) { return v.trim().length >= 3; }],
    ["numero", "Informe o número (use S/N se não houver).", function (v) { return v.trim().length >= 1; }],
    ["bairro", "Informe o bairro.", function (v) { return v.trim().length >= 2; }],
    ["cidade", "Informe a cidade.", function (v) { return v.trim().length >= 2; }],
    ["uf", "Informe o estado com a sigla (ex.: SP).", function (v) { return /^[A-Za-z]{2}$/.test(v.trim()); }]
  ];

  function abrirCheckout(origem) {
    const itens = carrinho.itens().filter(function (i) { return obterProduto(i.id); });
    const totais = totaisCarrinho(itens, PRODUTOS);
    document.getElementById("checkout-resumo").textContent =
      contarItens(itens) + " " + (contarItens(itens) === 1 ? "item" : "itens") + " · total de " + dinheiro(totais.subtotal);
    painelForm.hidden = false;
    painelSucesso.hidden = true;
    mostrarErroCheckout("");
    checkout.abrir(origem);
  }

  formCheckout.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (botaoConfirmar.disabled) return;
    const campos = formCheckout.elements;
    for (const [nome, mensagem, valido] of CAMPOS_ENDERECO) {
      if (!valido(campos[nome].value)) return mostrarErroCheckout(mensagem, campos[nome]);
    }
    const itens = carrinho.itens()
      .filter(function (i) { return obterProduto(i.id); })
      .map(function (i) { return { id: i.id, qty: i.qty }; });
    if (!itens.length) return mostrarErroCheckout("O carrinho está vazio.");

    botaoConfirmar.disabled = true;
    botaoConfirmar.textContent = "Enviando…";
    const metodo = formCheckout.querySelector("input[name=pagamento]:checked").value;
    const resposta = await api.chamar("POST", "/api/pedidos", {
      itens: itens,
      pagamento: metodo,
      endereco: {
        cep: campos.cep.value, logradouro: campos.logradouro.value, numero: campos.numero.value,
        complemento: campos.complemento.value, bairro: campos.bairro.value, cidade: campos.cidade.value, uf: campos.uf.value
      }
    });
    botaoConfirmar.disabled = false;
    botaoConfirmar.textContent = "Confirmar pedido";

    if (resposta.status === 401) {
      auth.sessaoExpirou();
      checkout.fechar();
      toast("Sua sessão expirou", { descricao: "Entre novamente para finalizar o pedido.", acao: { rotulo: "Entrar", aoClicar: function () { window.location.href = "conta.html"; } } });
      return;
    }
    if (resposta.rede) return mostrarErroCheckout("Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.");
    if (!resposta.ok) return mostrarErroCheckout((resposta.dados && resposta.dados.erro) || "Não foi possível registrar o pedido agora.");

    const pedido = resposta.dados.pedido;
    carrinho.limpar();
    formCheckout.reset();
    document.getElementById("checkout-sucesso-texto").textContent =
      "Pedido nº " + pedido.id + " — total de " + dinheiro(pedido.total) + ", pagamento por " + NOMES_PAGAMENTO[metodo] +
      ". Ambiente demonstrativo: nenhuma cobrança será feita.";
    painelForm.hidden = true;
    painelSucesso.hidden = false;
    document.getElementById("checkout-sucesso-titulo").focus();
  });

  async function iniciarFinalizacao(botao) {
    await auth.pronto;
    if (auth.modo() !== "servidor") {
      toast("Compra simulada", { descricao: "Este é um ambiente demonstrativo: nenhum pedido ou pagamento foi realizado." });
      return;
    }
    if (!auth.usuario()) {
      toast("Entre para finalizar o pedido", {
        descricao: "Seu carrinho fica guardado enquanto você entra ou cria a conta.",
        acao: { rotulo: "Entrar", aoClicar: function () { window.location.href = "conta.html"; } }
      });
      return;
    }
    abrirCheckout(botao);
  }

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
      iniciarFinalizacao(alvo);
    }
  });

  carrinho.assinar(renderizar);
  renderizar();
})();

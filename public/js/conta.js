/*
 * KaTchau — página de conta (conta.html): abas "Entrar" e "Criar conta",
 * validação dos campos e painel de quem já está conectado.
 */

(function () {
  const visitante = document.getElementById("conta-visitante");
  if (!visitante) return;

  const logado = document.getElementById("conta-logado");
  const abas = Array.prototype.slice.call(document.querySelectorAll("[role=tab]"));
  const paineis = { entrar: document.getElementById("painel-entrar"), cadastro: document.getElementById("painel-cadastro") };

  /* ---------- abas ---------- */
  function selecionarAba(nome, moverFoco) {
    abas.forEach(function (aba) {
      const ativa = aba.getAttribute("data-aba") === nome;
      aba.setAttribute("aria-selected", String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
      if (ativa && moverFoco) aba.focus();
    });
    Object.keys(paineis).forEach(function (chave) { paineis[chave].hidden = chave !== nome; });
    const hash = nome === "cadastro" ? "#cadastro" : "#entrar";
    if (window.location.hash !== hash) history.replaceState(null, "", window.location.pathname + window.location.search + hash);
  }

  abas.forEach(function (aba, i) {
    aba.addEventListener("click", function () { selecionarAba(aba.getAttribute("data-aba")); });
    aba.addEventListener("keydown", function (e) {
      let alvo = null;
      if (e.key === "ArrowRight") alvo = abas[(i + 1) % abas.length];
      else if (e.key === "ArrowLeft") alvo = abas[(i - 1 + abas.length) % abas.length];
      else if (e.key === "Home") alvo = abas[0];
      else if (e.key === "End") alvo = abas[abas.length - 1];
      if (alvo) { e.preventDefault(); selecionarAba(alvo.getAttribute("data-aba"), true); }
    });
  });

  document.querySelectorAll("[data-ir-aba]").forEach(function (link) {
    link.addEventListener("click", function () { selecionarAba(link.getAttribute("data-ir-aba"), false); });
  });

  /* ---------- mostrar / ocultar senha ---------- */
  document.querySelectorAll("[data-ver-senha]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      const campo = document.getElementById(botao.getAttribute("data-ver-senha"));
      const mostrar = campo.type === "password";
      campo.type = mostrar ? "text" : "password";
      botao.innerHTML = icone(mostrar ? "eye-off" : "eye");
      botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
      botao.setAttribute("aria-pressed", String(mostrar));
    });
  });

  /* ---------- formulários ---------- */
  function marcarInvalido(campo, invalido) {
    if (invalido) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
  }

  function mostrarErro(form, mensagem, campo) {
    const caixa = form.querySelector(".form-error");
    caixa.textContent = mensagem;
    caixa.hidden = !mensagem;
    form.querySelectorAll(".input").forEach(function (c) { marcarInvalido(c, false); });
    if (mensagem && campo) {
      marcarInvalido(campo, true);
      campo.focus();
    }
  }

  function configurarFormulario(form, enviar) {
    const botao = form.querySelector("button[type=submit]");
    const rotulo = botao.textContent;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (botao.disabled) return;
      botao.disabled = true;
      botao.textContent = "Aguarde…";
      try {
        await enviar(form);
      } finally {
        botao.disabled = false;
        botao.textContent = rotulo;
      }
    });
  }

  configurarFormulario(document.getElementById("form-entrar"), async function (form) {
    const email = form.elements.email;
    const senha = form.elements.senha;
    const resultado = await auth.entrar({ email: email.value, senha: senha.value });
    if (!resultado.ok) {
      const campo = validarEmail(email.value) ? email : senha;
      mostrarErro(form, resultado.erro, campo);
      senha.value = "";
      return;
    }
    form.reset();
    mostrarErro(form, "");
    toast.sucesso("Você entrou na sua conta");
  });

  configurarFormulario(document.getElementById("form-cadastro"), async function (form) {
    const nome = form.elements.nome;
    const email = form.elements.email;
    const senha = form.elements.senha;
    const confirmar = form.elements.confirmar;

    const erroNome = validarNome(nome.value);
    const erroEmail = validarEmail(email.value);
    const erroSenha = validarSenha(senha.value);
    if (erroNome) return mostrarErro(form, erroNome, nome);
    if (erroEmail) return mostrarErro(form, erroEmail, email);
    if (erroSenha) return mostrarErro(form, erroSenha, senha);
    if (senha.value !== confirmar.value) return mostrarErro(form, "As senhas não são iguais.", confirmar);

    const resultado = await auth.cadastrar({ nome: nome.value, email: email.value, senha: senha.value });
    if (!resultado.ok) {
      mostrarErro(form, resultado.erro, resultado.erro.indexOf("e-mail") !== -1 ? email : null);
      return;
    }
    form.reset();
    mostrarErro(form, "");
    toast.sucesso("Conta criada", { descricao: "Você já está conectado." });
  });

  /* ---------- painel de quem já entrou ---------- */
  function formatarData(iso) {
    const data = new Date(iso);
    return isNaN(data.getTime()) ? "" : data.toLocaleDateString("pt-BR");
  }

  function atualizar() {
    const usuario = auth.usuario();
    visitante.hidden = !!usuario;
    logado.hidden = !usuario;
    if (!usuario) return;
    document.getElementById("conta-nome").textContent = "Olá, " + usuario.nome.split(" ")[0];
    document.getElementById("conta-email").textContent = usuario.email;
    const desde = formatarData(usuario.criadoEm);
    document.getElementById("conta-desde").textContent = desde ? "Conta criada em " + desde : "";
  }

  document.getElementById("btn-sair").addEventListener("click", async function () {
    await auth.sair();
    toast("Você saiu da sua conta");
  });

  /* ---------- pedidos (somente quando o site está ligado ao banco de dados) ---------- */
  const secaoPedidos = document.getElementById("conta-pedidos");
  const listaPedidos = document.getElementById("lista-pedidos");
  const STATUS = { aguardando_pagamento: "Aguardando pagamento", pago: "Pago", enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado" };
  const METODOS = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };
  let pedidosCarregadosPara = null;

  function htmlPedido(p) {
    const itens = p.itens.map(function (i) {
      return "<li><span>" + i.quantidade + "× " + esc(i.nome) + "</span><span>" + dinheiro(i.preco * i.quantidade) + "</span></li>";
    }).join("");
    const data = formatarData(p.criadoEm);
    const metodo = p.pagamento && METODOS[p.pagamento.metodo] ? " · " + METODOS[p.pagamento.metodo] : "";
    return (
      '<article class="order"><header><div><p class="order-id">Pedido nº ' + p.id + "</p>" +
      '<p class="order-meta">' + (data ? esc(data) : "") + esc(metodo) + "</p></div>" +
      '<span class="order-status">' + esc(STATUS[p.status] || p.status) + "</span></header>" +
      '<ul class="order-items">' + itens + "</ul>" +
      '<p class="order-total"><span>Total</span><strong>' + dinheiro(p.total) + "</strong></p></article>"
    );
  }

  async function carregarPedidos(usuario) {
    if (!usuario || auth.modo() !== "servidor") {
      secaoPedidos.hidden = true;
      pedidosCarregadosPara = null;
      return;
    }
    if (pedidosCarregadosPara === usuario.email) return;
    pedidosCarregadosPara = usuario.email;
    secaoPedidos.hidden = false;
    listaPedidos.innerHTML = '<p class="orders-msg">Carregando…</p>';
    const r = await api.chamar("GET", "/api/pedidos");
    if (r.status === 401) { auth.sessaoExpirou(); return; }
    if (!r.ok || !r.dados) {
      pedidosCarregadosPara = null;
      listaPedidos.innerHTML = '<p class="orders-msg">Não foi possível carregar seus pedidos agora.</p>';
      return;
    }
    listaPedidos.innerHTML = r.dados.pedidos.length
      ? r.dados.pedidos.map(htmlPedido).join("")
      : '<p class="orders-msg">Você ainda não fez nenhum pedido. <a href="catalogo.html">Ver o catálogo</a></p>';
  }

  /* Textos que mudam quando a conta fica no servidor (em vez de só no navegador). */
  function ajustarTextos() {
    if (auth.modo() !== "servidor") return;
    document.querySelectorAll("[data-texto-servidor]").forEach(function (el) {
      el.innerHTML = el.getAttribute("data-texto-servidor");
    });
  }

  auth.assinar(function (usuario) { atualizar(); carregarPedidos(usuario); });
  atualizar();
  auth.pronto.then(function () {
    ajustarTextos();
    carregarPedidos(auth.usuario());
  });
  selecionarAba(window.location.hash === "#cadastro" ? "cadastro" : "entrar");
})();

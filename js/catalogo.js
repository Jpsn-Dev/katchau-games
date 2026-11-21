/*
 * KaTchau — catálogo e departamentos (Consoles, Jogos, Periféricos).
 * Busca sem distinção de acentos, filtros por categoria / plataforma / preço,
 * ordenação e estado compartilhável pelos parâmetros da URL.
 */

/* ------------------------------------------------------------------
 * Regras de filtro e ordenação
 * ------------------------------------------------------------------ */
const OPCOES_ORDEM = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" }
];

const FAIXAS_PRECO = [
  { value: "0-200", label: "Até R$ 200", min: 0, max: 200 },
  { value: "200-500", label: "R$ 200 a R$ 500", min: 200, max: 500 },
  { value: "500-1000", label: "R$ 500 a R$ 1.000", min: 500, max: 1000 },
  { value: "1000-99999", label: "Acima de R$ 1.000", min: 1000, max: 99999 }
];

function filtrarProdutos(lista, f) {
  let saida = lista;
  const q = normalizarTexto((f.q || "").trim());
  if (q) {
    saida = saida.filter(function (p) {
      return normalizarTexto(p.name + " " + p.category + " " + p.platforms.join(" ") + " " + p.tag).indexOf(q) !== -1;
    });
  }
  if (f.categorias && f.categorias.length) {
    saida = saida.filter(function (p) { return f.categorias.indexOf(p.category) !== -1; });
  }
  if (f.plataformas && f.plataformas.length) {
    saida = saida.filter(function (p) {
      return p.platforms.some(function (pl) { return f.plataformas.indexOf(pl) !== -1; });
    });
  }
  if (f.precos && f.precos.length) {
    const faixas = FAIXAS_PRECO.filter(function (r) { return f.precos.indexOf(r.value) !== -1; });
    saida = saida.filter(function (p) {
      return faixas.some(function (r) { return p.price >= r.min && p.price < r.max; });
    });
  }
  const ordenada = saida.slice();
  switch (f.ordem || "relevancia") {
    case "menor-preco":
      ordenada.sort(function (a, b) { return a.price - b.price; });
      break;
    case "maior-preco":
      ordenada.sort(function (a, b) { return b.price - a.price; });
      break;
    case "nome":
      ordenada.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
      break;
    default: {
      const posicao = function (id) {
        const i = IDS_RELEVANCIA.indexOf(id);
        return i === -1 ? 100 + id : i;
      };
      ordenada.sort(function (a, b) { return posicao(a.id) - posicao(b.id); });
    }
  }
  return ordenada;
}

/** Lê listas separadas por vírgula, aceitando apenas valores permitidos. */
function lerLista(valor, permitidos) {
  if (typeof valor !== "string" || !valor) return undefined;
  const itens = valor.split(",").filter(function (v) { return permitidos.indexOf(v) !== -1; });
  return itens.length ? itens : undefined;
}

function validarBusca(bruta) {
  const saida = {};
  if (typeof bruta.q === "string" && bruta.q.trim()) saida.q = bruta.q.slice(0, 80);
  if (typeof bruta.plataforma === "string" && bruta.plataforma) saida.plataforma = bruta.plataforma;
  if (typeof bruta.preco === "string" && bruta.preco) saida.preco = bruta.preco;
  if (typeof bruta.categoria === "string" && bruta.categoria) saida.categoria = bruta.categoria;
  if (OPCOES_ORDEM.some(function (o) { return o.value === bruta.ordem; })) saida.ordem = bruta.ordem;
  return saida;
}

function alternar(lista, valor) {
  const conjunto = new Set(lista || []);
  if (conjunto.has(valor)) conjunto.delete(valor);
  else conjunto.add(valor);
  return conjunto.size ? Array.from(conjunto).join(",") : undefined;
}

/* ------------------------------------------------------------------
 * Interface
 * ------------------------------------------------------------------ */
(function () {
  const raiz = document.getElementById("catalogo-raiz");
  if (!raiz) return;

  const categoriaFixa = raiz.getAttribute("data-categoria-fixa") || undefined;
  const ehCatalogoGeral = !categoriaFixa;
  let busca = validarBusca(lerParametros());

  const elPills = document.getElementById("cat-pills");
  const elFiltrosDesktop = document.getElementById("filtros-desktop");
  const elFiltrosCelular = document.getElementById("filtros-celular");
  const elContagem = document.getElementById("catalogo-contagem");
  const elBadgeFiltros = document.getElementById("filtros-badge");
  const elChips = document.getElementById("chips");
  const elGrade = document.getElementById("catalogo-grade");
  const elSelect = document.getElementById("ordenar");

  /* ---------- estado na URL (sem recarregar nem rolar a página) ---------- */
  function paraQueryString(estado) {
    const params = new URLSearchParams();
    ["q", "plataforma", "preco", "ordem", "categoria"].forEach(function (chave) {
      if (estado[chave]) params.set(chave, estado[chave]);
    });
    const texto = params.toString();
    return texto ? "?" + texto : "";
  }

  function definirBusca(alteracao, substituirTudo) {
    const proximo = substituirTudo ? {} : Object.assign({}, busca);
    Object.keys(alteracao).forEach(function (chave) {
      if (alteracao[chave] === undefined) delete proximo[chave];
      else proximo[chave] = alteracao[chave];
    });
    busca = proximo;
    history.replaceState(null, "", window.location.pathname + paraQueryString(busca));
    renderizar();
  }

  /* Busca digitada no cabeçalho enquanto já estamos no catálogo */
  window.buscarNoCatalogo = function (termo) {
    if (!ehCatalogoGeral) {
      window.location.href = "catalogo.html" + (termo ? "?q=" + encodeURIComponent(termo.slice(0, 80)) : "");
      return;
    }
    busca = termo ? validarBusca({ q: termo }) : {};
    history.pushState(null, "", window.location.pathname + paraQueryString(busca));
    renderizar();
  };

  window.addEventListener("popstate", function () {
    busca = validarBusca(lerParametros());
    renderizar();
  });

  /* ---------- seleção de ordenação (lista suspensa) ---------- */
  const select = (function () {
    const gatilho = elSelect.querySelector(".select-trigger");
    const rotulo = elSelect.querySelector(".val");
    let conteudo = null;
    let destaque = -1;

    function fechar(voltarFoco) {
      if (!conteudo) return;
      conteudo.remove();
      conteudo = null;
      gatilho.setAttribute("aria-expanded", "false");
      document.removeEventListener("mousedown", fora, true);
      if (voltarFoco) gatilho.focus();
    }

    function fora(e) {
      if (!elSelect.contains(e.target)) fechar(false);
    }

    function escolher(valor) {
      definirBusca({ ordem: valor === "relevancia" ? undefined : valor });
      fechar(true);
    }

    function marcar(indice) {
      const itens = conteudo.querySelectorAll(".select-item");
      destaque = (indice + itens.length) % itens.length;
      itens.forEach(function (n, i) { n.classList.toggle("hl", i === destaque); });
      itens[destaque].scrollIntoView({ block: "nearest" });
    }

    function abrir() {
      const atual = busca.ordem || "relevancia";
      conteudo = document.createElement("div");
      conteudo.className = "select-content";
      conteudo.setAttribute("role", "listbox");
      conteudo.innerHTML = OPCOES_ORDEM.map(function (o) {
        const marcado = o.value === atual;
        return (
          '<div class="select-item" role="option" tabindex="-1" data-valor="' + o.value + '" aria-selected="' + marcado + '">' +
          (marcado ? '<span class="tick">' + icone("check") + "</span>" : "") +
          "<span>" + esc(o.label) + "</span></div>"
        );
      }).join("");
      elSelect.appendChild(conteudo);
      gatilho.setAttribute("aria-expanded", "true");
      document.addEventListener("mousedown", fora, true);
      conteudo.addEventListener("click", function (e) {
        const item = e.target.closest(".select-item");
        if (item) escolher(item.getAttribute("data-valor"));
      });
      conteudo.addEventListener("mousemove", function (e) {
        const item = e.target.closest(".select-item");
        if (!item) return;
        const itens = Array.prototype.slice.call(conteudo.querySelectorAll(".select-item"));
        marcar(itens.indexOf(item));
      });
      marcar(OPCOES_ORDEM.findIndex(function (o) { return o.value === atual; }));
    }

    gatilho.addEventListener("click", function () { if (conteudo) fechar(true); else abrir(); });
    gatilho.addEventListener("keydown", function (e) {
      if (!conteudo && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        abrir();
        return;
      }
      if (!conteudo) return;
      if (e.key === "ArrowDown") { e.preventDefault(); marcar(destaque + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); marcar(destaque - 1); }
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        escolher(OPCOES_ORDEM[destaque].value);
      } else if (e.key === "Escape") { e.preventDefault(); fechar(true); }
      else if (e.key === "Tab") fechar(false);
    });

    return { atualizar: function (valor) {
      const opcao = OPCOES_ORDEM.find(function (o) { return o.value === valor; });
      rotulo.textContent = opcao ? opcao.label : "";
    } };
  })();

  /* ---------- painel de filtros do celular ---------- */
  const camadaFiltros = criarCamada(document.getElementById("filtros-camada"));
  const botaoFiltros = document.getElementById("filtros-abrir");
  if (botaoFiltros) botaoFiltros.addEventListener("click", function () { camadaFiltros.abrir(botaoFiltros); });

  /* ---------- renderização ---------- */
  function htmlFiltros(categorias, plataformas, precos, haChips) {
    let html = '<div class="filters">';
    if (!categoriaFixa) {
      html += '<fieldset class="filter-group"><legend class="filter-legend">Categoria</legend><div>';
      CATEGORIAS.forEach(function (c) {
        html += htmlCheck("categoria", c, c, PRODUTOS.filter(function (p) { return p.category === c; }).length, !!(categorias && categorias.indexOf(c) !== -1));
      });
      html += "</div></fieldset>";
    }
    html += '<fieldset class="filter-group"><legend class="filter-legend">Plataforma</legend><div>';
    PLATAFORMAS.forEach(function (pl) {
      const total = PRODUTOS.filter(function (x) {
        return (!categoriaFixa || x.category === categoriaFixa) && x.platforms.indexOf(pl) !== -1;
      }).length;
      html += htmlCheck("plataforma", pl, pl, total, !!(plataformas && plataformas.indexOf(pl) !== -1));
    });
    html += '</div></fieldset><fieldset class="filter-group"><legend class="filter-legend">Faixa de preço</legend><div>';
    FAIXAS_PRECO.forEach(function (r) {
      html += htmlCheck("preco", r.value, r.label, undefined, !!(precos && precos.indexOf(r.value) !== -1));
    });
    html += "</div></fieldset>";
    if (haChips) html += '<button type="button" class="clear-all" data-limpar-tudo>Limpar todos os filtros</button>';
    return html + "</div>";
  }

  function htmlCheck(grupo, valor, rotulo, total, marcado) {
    return (
      '<label class="filter-check">' +
      '<input type="checkbox" class="checkbox" data-grupo="' + grupo + '" data-valor="' + esc(valor) + '"' + (marcado ? " checked" : "") + ">" +
      '<span class="lbl">' + esc(rotulo) + "</span>" +
      (total !== undefined ? '<span class="count">' + total + "</span>" : "") +
      "</label>"
    );
  }

  function atualizarCabecalhoPagina() {
    if (!ehCatalogoGeral) return;
    const crumb = document.getElementById("ph-crumb");
    const eyebrow = document.getElementById("ph-eyebrow");
    const titulo = document.getElementById("ph-title");
    if (busca.q) {
      crumb.textContent = "Busca";
      eyebrow.textContent = "Resultado da busca";
      titulo.textContent = "Busca por “" + busca.q + "”";
    } else {
      crumb.textContent = "Catálogo";
      eyebrow.textContent = "KaTchau / Catálogo";
      titulo.innerHTML = 'Catálogo <span class="text-gradient-brand">completo</span>';
    }
  }

  function renderizar() {
    const categorias = categoriaFixa ? [categoriaFixa] : lerLista(busca.categoria, CATEGORIAS);
    const plataformas = lerLista(busca.plataforma, PLATAFORMAS);
    const precos = lerLista(busca.preco, FAIXAS_PRECO.map(function (r) { return r.value; }));
    const ordem = busca.ordem || "relevancia";

    const lista = filtrarProdutos(PRODUTOS, { q: busca.q, categorias: categorias, plataformas: plataformas, precos: precos, ordem: ordem });

    /* chips dos filtros ativos */
    const chips = [];
    if (busca.q) chips.push({ rotulo: "“" + busca.q + "”", limpar: { q: undefined } });
    if (!categoriaFixa && categorias) {
      categorias.forEach(function (c) { chips.push({ rotulo: c, limpar: { categoria: alternar(categorias, c) } }); });
    }
    if (plataformas) {
      plataformas.forEach(function (p) { chips.push({ rotulo: p, limpar: { plataforma: alternar(plataformas, p) } }); });
    }
    if (precos) {
      precos.forEach(function (v) {
        chips.push({
          rotulo: FAIXAS_PRECO.find(function (r) { return r.value === v; }).label,
          limpar: { preco: alternar(precos, v) }
        });
      });
    }

    atualizarCabecalhoPagina();
    if (typeof window.sincronizarBusca === "function") window.sincronizarBusca(busca.q || "");

    /* atalhos de categoria (somente no catálogo geral) */
    if (elPills) {
      elPills.innerHTML = [undefined].concat(CATEGORIAS).map(function (c) {
        const ativo = c ? !!(categorias && categorias.length === 1 && categorias[0] === c) : !(categorias && categorias.length);
        return '<button type="button" class="cat-pill' + (ativo ? " active" : "") + '" data-categoria="' + (c ? esc(c) : "") + '">' + (c ? esc(c) : "Todos os produtos") + "</button>";
      }).join("");
    }

    const htmlF = htmlFiltros(categorias, plataformas, precos, chips.length > 0);
    elFiltrosDesktop.innerHTML = htmlF;
    elFiltrosCelular.innerHTML = htmlF;

    elContagem.innerHTML = "<strong>" + lista.length + "</strong> " + (lista.length === 1 ? "produto encontrado" : "produtos encontrados");
    if (chips.length) { elBadgeFiltros.hidden = false; elBadgeFiltros.textContent = chips.length; }
    else elBadgeFiltros.hidden = true;
    select.atualizar(ordem);

    elChips.hidden = chips.length === 0;
    elChips.innerHTML = chips.map(function (c, i) {
      return '<button type="button" class="chip" data-chip="' + i + '">' + esc(c.rotulo) + " " + icone("x") + "</button>";
    }).join("");
    elChips._chips = chips;

    if (lista.length) {
      elGrade.innerHTML = '<div class="product-grid catalog">' + htmlGradeProdutos(lista) + "</div>";
    } else {
      elGrade.innerHTML =
        '<div class="empty-box"><p class="display">Nada por aqui</p>' +
        '<p class="msg">Não encontramos produtos com esses filtros. Tente outro termo ou limpe os filtros.</p>' +
        '<div class="empty-actions"><button type="button" class="a-primary" data-limpar-tudo>Limpar filtros</button>' +
        '<a href="catalogo.html" class="a-line">Ver catálogo</a></div></div>';
    }
  }

  /* ---------- eventos (delegação) ---------- */
  function limparTudo() {
    definirBusca({ q: undefined, categoria: undefined, plataforma: undefined, preco: undefined });
  }

  document.addEventListener("change", function (e) {
    const caixa = e.target.closest("input[data-grupo]");
    if (!caixa) return;
    const grupo = caixa.getAttribute("data-grupo");
    const valor = caixa.getAttribute("data-valor");
    const atuais = {
      categoria: categoriaFixa ? [categoriaFixa] : lerLista(busca.categoria, CATEGORIAS),
      plataforma: lerLista(busca.plataforma, PLATAFORMAS),
      preco: lerLista(busca.preco, FAIXAS_PRECO.map(function (r) { return r.value; }))
    };
    const alteracao = {};
    alteracao[grupo] = alternar(atuais[grupo], valor);
    const painel = caixa.closest("#filtros-desktop, #filtros-celular");
    definirBusca(alteracao);
    // A lista de filtros é redesenhada; devolve o foco à mesma caixa para quem usa teclado.
    if (painel) {
      const novaCaixa = Array.prototype.find.call(painel.querySelectorAll("input[data-grupo]"), function (c) {
        return c.getAttribute("data-grupo") === grupo && c.getAttribute("data-valor") === valor;
      });
      if (novaCaixa) novaCaixa.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-limpar-tudo]")) { limparTudo(); return; }
    const chip = e.target.closest("[data-chip]");
    if (chip) { definirBusca(elChips._chips[Number(chip.getAttribute("data-chip"))].limpar); return; }
    const pill = e.target.closest("[data-categoria]");
    if (pill) {
      const categoria = pill.getAttribute("data-categoria");
      definirBusca({ categoria: categoria || undefined });
      const nova = Array.prototype.find.call(elPills.querySelectorAll("[data-categoria]"), function (b) {
        return b.getAttribute("data-categoria") === categoria;
      });
      if (nova) nova.focus();
    }
  });

  renderizar();
})();

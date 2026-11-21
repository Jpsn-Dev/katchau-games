/*
 * KaTchau — carrinho demonstrativo.
 * Regras puras (adicionar, alterar, remover, totais) + armazenamento no navegador (localStorage).
 * Nenhum pedido é enviado e nenhum pagamento é processado.
 */

const QTD_MAXIMA = 99;
const CHAVE_CARRINHO = "katchau-cart-v5";

/* ---------- regras puras ---------- */

function limitarQtd(n) {
  return Math.max(1, Math.min(QTD_MAXIMA, Math.floor(n)));
}

function adicionarItem(itens, id, qtd) {
  qtd = qtd === undefined ? 1 : qtd;
  const achado = itens.find(function (i) { return i.id === id; });
  if (achado) {
    return itens.map(function (i) { return i.id === id ? { id: i.id, qty: limitarQtd(i.qty + qtd) } : i; });
  }
  return itens.concat([{ id: id, qty: limitarQtd(qtd) }]);
}

function removerItem(itens, id) {
  return itens.filter(function (i) { return i.id !== id; });
}

function definirQtd(itens, id, qtd) {
  if (qtd < 1) return removerItem(itens, id);
  return itens.map(function (i) { return i.id === id ? { id: i.id, qty: limitarQtd(qtd) } : i; });
}

function contarItens(itens) {
  return itens.reduce(function (soma, i) { return soma + i.qty; }, 0);
}

function totaisCarrinho(itens, catalogo) {
  let subtotal = 0;
  let original = 0;
  itens.forEach(function (item) {
    const p = catalogo.find(function (x) { return x.id === item.id; });
    if (!p) return;
    subtotal += p.price * item.qty;
    original += p.oldPrice * item.qty;
  });
  const arredondar = function (n) { return Math.round(n * 100) / 100; };
  return { subtotal: arredondar(subtotal), savings: arredondar(original - subtotal) };
}

/* ---------- armazenamento no navegador ---------- */

const carrinho = (function () {
  let estado = [];
  let carregado = false;
  const ouvintes = [];

  function carregar() {
    if (carregado) return;
    carregado = true;
    try {
      const lido = JSON.parse(window.localStorage.getItem(CHAVE_CARRINHO) || "[]");
      if (Array.isArray(lido)) {
        // Descarta itens inválidos ou de produtos que não existem mais no catálogo
        // (senão o contador do cabeçalho contaria itens que nunca aparecem no carrinho)
        // e junta entradas repetidas do mesmo produto.
        estado = lido
          .filter(function (i) { return i && Number.isFinite(Number(i.id)) && obterProduto(Number(i.id)); })
          .reduce(function (itens, i) {
            return adicionarItem(itens, Number(i.id), limitarQtd(Number(i.qty) || 1));
          }, []);
      }
    } catch (e) {
      estado = [];
    }
  }

  function avisar() {
    ouvintes.forEach(function (fn) { fn(estado); });
  }

  function gravar(proximo) {
    estado = proximo;
    try {
      window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(proximo));
    } catch (e) {
      /* armazenamento bloqueado: mantém em memória */
    }
    avisar();
  }

  window.addEventListener("storage", function (e) {
    if (e.key === CHAVE_CARRINHO) {
      carregado = false;
      carregar();
      avisar();
    }
  });

  return {
    itens: function () { carregar(); return estado; },
    assinar: function (fn) { ouvintes.push(fn); },
    adicionar: function (id, qtd) { gravar(adicionarItem(this.itens(), id, qtd)); },
    definirQtd: function (id, qtd) { gravar(definirQtd(this.itens(), id, qtd)); },
    remover: function (id) { gravar(removerItem(this.itens(), id)); },
    limpar: function () { gravar([]); }
  };
})();

/* Adiciona ao carrinho e mostra o aviso com atalho para o carrinho. */
function adicionarAoCarrinho(produto, qtd) {
  carrinho.adicionar(produto.id, qtd === undefined ? 1 : qtd);
  toast.sucesso("Adicionado ao carrinho", {
    descricao: produto.name,
    acao: { rotulo: "Ver carrinho", aoClicar: function () { window.location.href = "carrinho.html"; } }
  });
}

/*
 * Rotas da API da KaTchau (/api/...). Independe da Cloudflare: recebe a Request, as variáveis
 * de ambiente e o acesso ao banco, e devolve uma Response — por isso pode ser testada fora dela.
 */
import { json, erro, lerCookie, cookieSessao, origemPermitida, lerJson, NOME_COOKIE, DURACAO_SESSAO_S } from "./http.js";
import { gerarHashSenha, verificarSenha, gastarTempoDeVerificacao, novoToken, sha256Hex } from "./seguranca.js";
import {
  limparTexto, normalizarEmail, validarNome, validarEmail, validarSenha,
  validarEndereco, validarItens, METODOS_PAGAMENTO
} from "./validacao.js";

const NOMES_CATEGORIA = { consoles: "Consoles", jogos: "Jogos", perifericos: "Periféricos" };
const LOGIN_INVALIDO = "E-mail ou senha incorretos.";

function paraIso(valor) {
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function usuarioPublico(linha) {
  return { nome: linha.nome, email: linha.email, criadoEm: paraIso(linha.criado_em) };
}

function comoLista(valor) {
  if (Array.isArray(valor)) return valor;
  const m = /^\{(.*)\}$/.exec(String(valor || ""));
  return m && m[1] ? m[1].split(",").map(function (t) { return t.replace(/^"|"$/g, ""); }) : [];
}

function somenteJson(valor) {
  if (typeof valor === "string") {
    try { return JSON.parse(valor); } catch (e) { return []; }
  }
  return valor || [];
}

/* ---------- sessão ---------- */

async function abrirSessao(db, request, idCliente) {
  const token = novoToken();
  await db.consultar("DELETE FROM sessao WHERE expira_em < now()");
  await db.consultar(
    "INSERT INTO sessao (token_hash, id_cliente, expira_em) VALUES ($1, $2, now() + ($3 || ' seconds')::interval)",
    [await sha256Hex(token), idCliente, String(DURACAO_SESSAO_S)]
  );
  return cookieSessao(request, token, DURACAO_SESSAO_S);
}

async function clienteDaSessao(db, request) {
  const token = lerCookie(request, NOME_COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const linhas = await db.consultar(
    "SELECT c.id_cliente, c.nome, c.email, c.criado_em FROM sessao s JOIN cliente c ON c.id_cliente = s.id_cliente " +
    "WHERE s.token_hash = $1 AND s.expira_em > now()",
    [await sha256Hex(token)]
  );
  return linhas[0] || null;
}

/* ---------- rotas ---------- */

async function saude(db) {
  await db.consultar("SELECT 1 AS ok");
  return json({ ok: true, banco: true });
}

async function listarProdutos(db) {
  const linhas = await db.consultar(
    "SELECT p.id_produto, p.slug, p.nome, c.nome AS categoria, m.nome AS marca, p.plataformas, p.preco, p.preco_antigo, " +
    "p.etiqueta, p.imagem, p.tipo FROM produto p " +
    "LEFT JOIN categoria c ON c.id_categoria = p.id_categoria LEFT JOIN marca m ON m.id_marca = p.id_marca " +
    "WHERE p.ativo IS NOT FALSE ORDER BY p.id_produto"
  );
  return json({
    produtos: linhas.map(function (p) {
      return {
        id: Number(p.id_produto), slug: p.slug, name: p.nome,
        category: NOMES_CATEGORIA[String(p.categoria || "").toLowerCase()] || p.categoria,
        brand: p.marca, platforms: comoLista(p.plataformas),
        price: Number(p.preco), oldPrice: Number(p.preco_antigo),
        tag: p.etiqueta, image: p.imagem, kind: p.tipo
      };
    })
  });
}

async function cadastrar(request, db) {
  const lido = await lerJson(request);
  if (lido.resposta) return lido.resposta;
  const nome = limparTexto(lido.dados.nome);
  const email = normalizarEmail(lido.dados.email);
  const senha = lido.dados.senha;
  const problema = validarNome(nome) || validarEmail(email) || validarSenha(senha);
  if (problema) return erro(400, problema);

  const hash = await gerarHashSenha(senha);
  const criado = await db.consultar(
    "INSERT INTO cliente (nome, email, senha_hash) VALUES ($1, $2, $3) " +
    "ON CONFLICT (lower(email)) DO NOTHING RETURNING id_cliente, nome, email, criado_em",
    [nome, email, hash]
  );
  if (!criado.length) return erro(409, "Já existe uma conta com este e-mail. Use a aba Entrar.");
  const cookie = await abrirSessao(db, request, criado[0].id_cliente);
  return json({ usuario: usuarioPublico(criado[0]) }, 201, { "Set-Cookie": cookie });
}

async function entrar(request, db) {
  const lido = await lerJson(request);
  if (lido.resposta) return lido.resposta;
  const email = normalizarEmail(lido.dados.email);
  const senha = typeof lido.dados.senha === "string" ? lido.dados.senha : "";
  if (validarEmail(email)) return erro(400, validarEmail(email));
  if (!senha) return erro(400, "Informe sua senha.");
  if (senha.length > 128) return erro(401, LOGIN_INVALIDO);

  const linhas = await db.consultar(
    "SELECT id_cliente, nome, email, senha_hash, criado_em FROM cliente WHERE lower(email) = $1 LIMIT 1", [email]
  );
  const cliente = linhas[0];
  if (!cliente) {
    await gastarTempoDeVerificacao(senha);
    return erro(401, LOGIN_INVALIDO);
  }
  if (!(await verificarSenha(senha, cliente.senha_hash))) return erro(401, LOGIN_INVALIDO);
  const cookie = await abrirSessao(db, request, cliente.id_cliente);
  return json({ usuario: usuarioPublico(cliente) }, 200, { "Set-Cookie": cookie });
}

async function sair(request, db) {
  const token = lerCookie(request, NOME_COOKIE);
  if (token && /^[0-9a-f]{64}$/.test(token)) {
    await db.consultar("DELETE FROM sessao WHERE token_hash = $1", [await sha256Hex(token)]);
  }
  return json({ ok: true }, 200, { "Set-Cookie": cookieSessao(request, "", 0) });
}

async function sessaoAtual(request, db) {
  const cliente = await clienteDaSessao(db, request);
  return json({ usuario: cliente ? usuarioPublico(cliente) : null });
}

async function listarPedidos(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta para ver seus pedidos.");
  const linhas = await db.consultar(
    "SELECT p.id_pedido, p.status, p.total, p.criado_em, pg.metodo, pg.status AS pagamento_status, " +
    "(SELECT json_agg(json_build_object('id', i.id_produto, 'nome', pr.nome, 'quantidade', i.quantidade, 'preco', i.preco_unitario) ORDER BY i.id_item) " +
    " FROM item_pedido i JOIN produto pr ON pr.id_produto = i.id_produto WHERE i.id_pedido = p.id_pedido) AS itens " +
    "FROM pedido p LEFT JOIN pagamento pg ON pg.id_pedido = p.id_pedido " +
    "WHERE p.id_cliente = $1 ORDER BY p.criado_em DESC, p.id_pedido DESC LIMIT 50",
    [cliente.id_cliente]
  );
  return json({
    pedidos: linhas.map(function (p) {
      return {
        id: Number(p.id_pedido), status: p.status, total: Number(p.total), criadoEm: paraIso(p.criado_em),
        pagamento: { metodo: p.metodo, status: p.pagamento_status },
        itens: somenteJson(p.itens).map(function (i) {
          return { id: Number(i.id), nome: i.nome, quantidade: Number(i.quantidade), preco: Number(i.preco) };
        })
      };
    })
  });
}

async function criarPedido(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta para finalizar o pedido.");
  const lido = await lerJson(request);
  if (lido.resposta) return lido.resposta;

  const itens = validarItens(lido.dados.itens);
  if (itens.erro) return erro(400, itens.erro);
  const end = validarEndereco(lido.dados.endereco);
  if (end.erro) return erro(400, end.erro);
  const metodo = String(lido.dados.pagamento || "");
  if (METODOS_PAGAMENTO.indexOf(metodo) === -1) return erro(400, "Escolha uma forma de pagamento.");
  const e = end.endereco;

  // Uma única instrução: ou grava endereço, pedido, itens e pagamento, ou não grava nada.
  // Os preços vêm da tabela produto — valores enviados pelo navegador são ignorados.
  const linhas = await db.consultar(
    "WITH it AS (SELECT x.id_produto, x.qtd FROM unnest($2::int[], $3::int[]) AS x (id_produto, qtd)), " +
    "validos AS (SELECT p.id_produto, it.qtd, p.preco FROM it JOIN produto p ON p.id_produto = it.id_produto AND p.ativo IS NOT FALSE), " +
    "conferido AS (SELECT (SELECT count(*) FROM validos) = (SELECT count(*) FROM it) AS tudo), " +
    "novo_end AS (INSERT INTO endereco (id_cliente, cep, logradouro, numero, complemento, bairro, cidade, uf) " +
    " SELECT $1, $4, $5, $6, $7, $8, $9, $10 WHERE (SELECT tudo FROM conferido) RETURNING id_endereco), " +
    "ped AS (INSERT INTO pedido (id_cliente, id_endereco, status, total) " +
    " SELECT $1, novo_end.id_endereco, 'aguardando_pagamento', (SELECT sum(preco * qtd) FROM validos) FROM novo_end RETURNING id_pedido, total, criado_em), " +
    "itens_gravados AS (INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) " +
    " SELECT ped.id_pedido, v.id_produto, v.qtd, v.preco FROM ped, validos v RETURNING id_item), " +
    "pag AS (INSERT INTO pagamento (id_pedido, metodo, status, valor) SELECT id_pedido, $11, 'pendente', total FROM ped RETURNING id_pagamento) " +
    "SELECT ped.id_pedido, ped.total, ped.criado_em FROM ped",
    [
      cliente.id_cliente,
      itens.itens.map(function (i) { return i.id; }),
      itens.itens.map(function (i) { return i.qtd; }),
      e.cep, e.logradouro, e.numero, e.complemento || null, e.bairro, e.cidade, e.uf, metodo
    ]
  );
  if (!linhas.length) return erro(422, "Algum produto do carrinho não está mais disponível.");
  return json({
    pedido: { id: Number(linhas[0].id_pedido), total: Number(linhas[0].total), criadoEm: paraIso(linhas[0].criado_em), status: "aguardando_pagamento", pagamento: { metodo: metodo, status: "pendente" } }
  }, 201);
}

/* ---------- roteador ---------- */

const ROTAS = {
  "GET /api/saude": function (req, db) { return saude(db); },
  "GET /api/produtos": function (req, db) { return listarProdutos(db); },
  "GET /api/sessao": sessaoAtual,
  "POST /api/cadastro": cadastrar,
  "POST /api/login": entrar,
  "POST /api/logout": sair,
  "GET /api/pedidos": listarPedidos,
  "POST /api/pedidos": criarPedido
};

export async function tratar(request, env, db) {
  const url = new URL(request.url);
  const caminho = url.pathname.length > 5 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const metodo = request.method === "HEAD" ? "GET" : request.method;
  const rota = ROTAS[metodo + " " + caminho];

  if (!rota) {
    const existe = Object.keys(ROTAS).some(function (r) { return r.split(" ")[1] === caminho; });
    return existe ? erro(405, "Método não permitido.") : erro(404, "Rota não encontrada.");
  }
  if (metodo !== "GET" && !origemPermitida(request)) return erro(403, "Origem não permitida.");
  if (!db) return erro(503, "Banco de dados não configurado.");

  try {
    return await rota(request, db);
  } catch (e) {
    console.error("Erro na rota " + metodo + " " + caminho + ": " + (e && e.message));
    return erro(500, "Erro interno. Tente novamente em instantes.");
  }
}

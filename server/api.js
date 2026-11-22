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

/* ---------- limite de tentativas de login ---------- */

const JANELA_MINUTOS = 15;
const MAX_POR_EMAIL = 5;
const MAX_POR_IP = 30;

function chavesDeTentativa(request, email) {
  const ip = request.headers.get("CF-Connecting-IP") || "desconhecido";
  return { email: "e:" + email, ip: "i:" + ip };
}

async function tentativasBloqueadas(db, chaves) {
  const linhas = await db.consultar(
    "SELECT chave, count(*) AS n FROM tentativa_login WHERE chave = ANY($1::text[]) " +
    "AND criada_em > now() - ($2 || ' minutes')::interval GROUP BY chave",
    [[chaves.email, chaves.ip], String(JANELA_MINUTOS)]
  );
  return linhas.some(function (l) {
    return Number(l.n) >= (l.chave === chaves.ip ? MAX_POR_IP : MAX_POR_EMAIL);
  });
}

async function registrarFalha(db, chaves) {
  await db.consultar("INSERT INTO tentativa_login (chave) VALUES ($1), ($2)", [chaves.email, chaves.ip]);
}

const MUITAS_TENTATIVAS = "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";

/* ---------- sessão ---------- */

async function abrirSessao(db, request, idCliente) {
  const token = novoToken();
  await db.consultar("DELETE FROM sessao WHERE expira_em < now()");
  await db.consultar("DELETE FROM tentativa_login WHERE criada_em < now() - interval '1 day'");
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

  const chaves = chavesDeTentativa(request, email);
  if (await tentativasBloqueadas(db, chaves)) return erro(429, MUITAS_TENTATIVAS);

  const linhas = await db.consultar(
    "SELECT id_cliente, nome, email, senha_hash, criado_em FROM cliente WHERE lower(email) = $1 LIMIT 1", [email]
  );
  const cliente = linhas[0];
  if (!cliente) {
    await gastarTempoDeVerificacao(senha);
    await registrarFalha(db, chaves);
    return erro(401, LOGIN_INVALIDO);
  }
  if (!(await verificarSenha(senha, cliente.senha_hash))) {
    await registrarFalha(db, chaves);
    return erro(401, LOGIN_INVALIDO);
  }
  await db.consultar("DELETE FROM tentativa_login WHERE chave = $1", [chaves.email]);
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

async function lerCarrinho(db, idCliente) {
  const linhas = await db.consultar(
    "SELECT ci.id_produto, ci.quantidade FROM carrinho_item ci JOIN produto p ON p.id_produto = ci.id_produto " +
    "WHERE ci.id_cliente = $1 AND p.ativo IS NOT FALSE ORDER BY ci.id_produto", [idCliente]
  );
  return linhas.map(function (l) { return { id: Number(l.id_produto), qty: Number(l.quantidade) }; });
}

async function obterCarrinho(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta.");
  return json({ itens: await lerCarrinho(db, cliente.id_cliente) });
}

async function salvarCarrinho(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta.");
  const lido = await lerJson(request);
  if (lido.resposta) return lido.resposta;
  const itens = validarItens(lido.dados.itens, true);
  if (itens.erro) return erro(400, itens.erro);
  const ids = itens.itens.map(function (i) { return i.id; });
  const qtds = itens.itens.map(function (i) { return i.qtd; });
  if (ids.length) {
    await db.consultar(
      "INSERT INTO carrinho_item (id_cliente, id_produto, quantidade) " +
      "SELECT $1, p.id_produto, x.qtd FROM unnest($2::int[], $3::int[]) AS x (id_produto, qtd) " +
      "JOIN produto p ON p.id_produto = x.id_produto AND p.ativo IS NOT FALSE " +
      "ON CONFLICT (id_cliente, id_produto) DO UPDATE SET quantidade = EXCLUDED.quantidade",
      [cliente.id_cliente, ids, qtds]
    );
  }
  await db.consultar("DELETE FROM carrinho_item WHERE id_cliente = $1 AND id_produto <> ALL($2::int[])", [cliente.id_cliente, ids]);
  return json({ itens: await lerCarrinho(db, cliente.id_cliente) });
}

async function listarEnderecos(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta.");
  const linhas = await db.consultar(
    "SELECT id_endereco, cep, logradouro, numero, complemento, bairro, cidade, uf FROM endereco " +
    "WHERE id_cliente = $1 ORDER BY id_endereco DESC LIMIT 5", [cliente.id_cliente]
  );
  return json({
    enderecos: linhas.map(function (e) {
      return { id: Number(e.id_endereco), cep: e.cep, logradouro: e.logradouro, numero: e.numero,
               complemento: e.complemento || "", bairro: e.bairro, cidade: e.cidade, uf: String(e.uf || "").trim() };
    })
  });
}

async function atualizarPerfil(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta.");
  const lido = await lerJson(request);
  if (lido.resposta) return lido.resposta;
  const nome = limparTexto(lido.dados.nome);
  const problema = validarNome(nome);
  if (problema) return erro(400, problema);
  const linhas = await db.consultar(
    "UPDATE cliente SET nome = $2 WHERE id_cliente = $1 RETURNING nome, email, criado_em", [cliente.id_cliente, nome]
  );
  return json({ usuario: usuarioPublico(linhas[0]) });
}

async function alterarSenha(request, db) {
  const cliente = await clienteDaSessao(db, request);
  if (!cliente) return erro(401, "Entre na sua conta.");
  const lido = await lerJson(request);
  if (lido.resposta) return lido.resposta;
  const atual = typeof lido.dados.atual === "string" ? lido.dados.atual : "";
  const nova = lido.dados.nova;
  const problema = validarSenha(nova);
  if (problema) return erro(400, problema);
  if (!atual || atual.length > 128) return erro(400, "Informe sua senha atual.");

  const chaves = { email: "s:" + cliente.id_cliente, ip: chavesDeTentativa(request, "").ip };
  if (await tentativasBloqueadas(db, chaves)) return erro(429, MUITAS_TENTATIVAS);
  const [conta] = await db.consultar("SELECT senha_hash FROM cliente WHERE id_cliente = $1", [cliente.id_cliente]);
  if (!conta || !(await verificarSenha(atual, conta.senha_hash))) {
    await registrarFalha(db, chaves);
    return erro(401, "A senha atual está incorreta.");
  }
  await db.consultar("UPDATE cliente SET senha_hash = $2 WHERE id_cliente = $1", [cliente.id_cliente, await gerarHashSenha(nova)]);
  // Encerra as outras sessões (outros aparelhos) e mantém só a atual.
  const token = lerCookie(request, NOME_COOKIE);
  await db.consultar("DELETE FROM sessao WHERE id_cliente = $1 AND token_hash <> $2", [cliente.id_cliente, await sha256Hex(token)]);
  await db.consultar("DELETE FROM tentativa_login WHERE chave = $1", [chaves.email]);
  return json({ ok: true });
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
    "validos AS (SELECT p.id_produto, it.qtd, p.preco FROM it JOIN produto p ON p.id_produto = it.id_produto AND p.ativo IS NOT FALSE AND coalesce(p.estoque, 0) >= it.qtd), " +
    "conferido AS (SELECT (SELECT count(*) FROM validos) = (SELECT count(*) FROM it) AS tudo), " +
    "existente AS (SELECT id_endereco FROM endereco WHERE id_cliente = $1 AND cep = $4 AND logradouro = $5 AND numero = $6 " +
    " AND coalesce(complemento, '') = coalesce($7::text, '') AND bairro = $8 AND cidade = $9 AND uf = $10 ORDER BY id_endereco LIMIT 1), " +
    "novo_end AS (INSERT INTO endereco (id_cliente, cep, logradouro, numero, complemento, bairro, cidade, uf) " +
    " SELECT $1, $4, $5, $6, $7, $8, $9, $10 WHERE (SELECT tudo FROM conferido) AND NOT EXISTS (SELECT 1 FROM existente) RETURNING id_endereco), " +
    "endereco_final AS (SELECT id_endereco FROM existente WHERE (SELECT tudo FROM conferido) UNION ALL SELECT id_endereco FROM novo_end), " +
    "ped AS (INSERT INTO pedido (id_cliente, id_endereco, status, total) " +
    " SELECT $1, endereco_final.id_endereco, 'aguardando_pagamento', (SELECT sum(preco * qtd) FROM validos) FROM endereco_final RETURNING id_pedido, total, criado_em), " +
    "itens_gravados AS (INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal) " +
    " SELECT ped.id_pedido, v.id_produto, v.qtd, v.preco, v.preco * v.qtd FROM ped, validos v RETURNING id_item), " +
    "baixa AS (UPDATE produto SET estoque = produto.estoque - v.qtd FROM validos v " +
    " WHERE produto.id_produto = v.id_produto AND (SELECT tudo FROM conferido) RETURNING produto.id_produto), " +
    "pag AS (INSERT INTO pagamento (id_pedido, metodo, status, valor) SELECT id_pedido, $11, 'pendente', total FROM ped RETURNING id_pagamento) " +
    "SELECT ped.id_pedido, ped.total, ped.criado_em FROM ped",
    [
      cliente.id_cliente,
      itens.itens.map(function (i) { return i.id; }),
      itens.itens.map(function (i) { return i.qtd; }),
      e.cep, e.logradouro, e.numero, e.complemento || null, e.bairro, e.cidade, e.uf, metodo
    ]
  );
  if (!linhas.length) return erro(422, "Algum produto do carrinho não está disponível ou não tem estoque suficiente.");
  await db.consultar("DELETE FROM carrinho_item WHERE id_cliente = $1", [cliente.id_cliente]); // pedido feito: carrinho da conta esvazia
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
  "GET /api/carrinho": obterCarrinho,
  "PUT /api/carrinho": salvarCarrinho,
  "GET /api/enderecos": listarEnderecos,
  "POST /api/perfil": atualizarPerfil,
  "POST /api/senha": alterarSenha,
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
    // 23514 = regra "estoque >= 0" violada: outra compra levou as últimas unidades neste instante.
    if (e && (e.code === "23514" || /ck_produto_estoque/.test(String(e.message)))) {
      return erro(422, "Algum produto do carrinho não está disponível ou não tem estoque suficiente.");
    }
    console.error("Erro na rota " + metodo + " " + caminho + ": " + (e && e.message));
    return erro(500, "Erro interno. Tente novamente em instantes.");
  }
}

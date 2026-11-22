import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tratar } from "../server/api.js";
import { criarDb, executar } from "./psql-db.js";

// Prepara um banco limpo com o esquema e o seed reais.
process.env.PGDATABASE = process.env.PGDATABASE || "katchau_teste";
executar("SELECT 1");
const db = criarDb();
const contar = async (tabela) => Number((await db.consultar("SELECT count(*) AS n FROM " + tabela))[0].n);

const BASE = "http://localhost:8788";
async function chamar(metodo, caminho, corpo, opcoes) {
  opcoes = opcoes || {};
  const h = { Origin: BASE };
  if (corpo !== undefined) h["Content-Type"] = opcoes.tipo || "application/json";
  if (opcoes.cookie) h.Cookie = opcoes.cookie;
  Object.assign(h, opcoes.cabecalhos || {});
  const resp = await tratar(new Request(BASE + caminho, { method: metodo, headers: h, body: corpo === undefined ? undefined : (typeof corpo === "string" ? corpo : JSON.stringify(corpo)) }), {}, db);
  const texto = await resp.text();
  return { status: resp.status, dados: texto ? JSON.parse(texto) : null, cookie: resp.headers.get("Set-Cookie") };
}
const centavos = (n) => Math.round(n * 100) / 100;
const cookieDe = (r) => r.cookie.split(";")[0];

const ENDERECO = { cep: "01310-100", logradouro: "Avenida Paulista", numero: "1000", complemento: "", bairro: "Bela Vista", cidade: "São Paulo", uf: "sp" };
const EMAIL = "teste." + Date.now() + "@exemplo.com";
let cookie;

test("saúde e catálogo vêm do banco", async () => {
  assert.deepEqual((await chamar("GET", "/api/saude")).dados, { ok: true, banco: true });
  const { dados } = await chamar("GET", "/api/produtos");
  assert.equal(dados.produtos.length, 36);
  const spider = dados.produtos.find((p) => p.id === 10);
  assert.deepEqual(spider.platforms, ["PlayStation"]);
  assert.equal(spider.category, "Jogos");
  assert.equal(spider.price, 249.9);
  assert.equal(spider.brand, "Sony");
});

test("rotas inexistentes, métodos errados, origem e tipo inválidos", async () => {
  assert.equal((await chamar("GET", "/api/nada")).status, 404);
  assert.equal((await chamar("GET", "/api/login")).status, 405);
  assert.equal((await chamar("POST", "/api/login", {}, { cabecalhos: { Origin: "https://site-malicioso.com" } })).status, 403);
  assert.equal((await chamar("POST", "/api/login", "x=1", { tipo: "text/plain" })).status, 415);
  assert.equal((await chamar("POST", "/api/login", "{quebrado")).status, 400);
});

test("cadastro valida os dados", async () => {
  const ruim = async (c) => (await chamar("POST", "/api/cadastro", c)).status;
  assert.equal(await ruim({ nome: "", email: EMAIL, senha: "12345678" }), 400);
  assert.equal(await ruim({ nome: "Ana", email: "sem-arroba", senha: "12345678" }), 400);
  assert.equal(await ruim({ nome: "Ana", email: EMAIL, senha: "curta" }), 400);
  assert.equal(await ruim({ nome: "Ana", email: EMAIL, senha: { $ne: 1 } }), 400);
  assert.equal(await contar("cliente"), 0);
});

test("cadastro cria a conta, a sessão e guarda só o hash da senha", async () => {
  const r = await chamar("POST", "/api/cadastro", { nome: "  Ana   Souza ", email: EMAIL.toUpperCase(), senha: "senha-forte-123" });
  assert.equal(r.status, 201);
  assert.equal(r.dados.usuario.nome, "Ana Souza");
  assert.equal(r.dados.usuario.email, EMAIL);
  assert.match(r.cookie, /HttpOnly/);
  assert.match(r.cookie, /SameSite=Lax/);
  assert.doesNotMatch(r.cookie, /Secure/, "em http://localhost o cookie não pode ser Secure");
  cookie = cookieDe(r);
  const [linha] = await db.consultar("SELECT senha_hash FROM cliente");
  assert.match(linha.senha_hash, /^pbkdf2-sha256\$100000\$/);
  assert.ok(!linha.senha_hash.includes("senha-forte-123"));
  const [s] = await db.consultar("SELECT token_hash FROM sessao");
  assert.equal(s.token_hash.length, 64);
  assert.ok(!cookie.includes(s.token_hash), "o banco guarda o hash do token, não o token");
});

test("e-mail duplicado (qualquer caixa) é recusado", async () => {
  const r = await chamar("POST", "/api/cadastro", { nome: "Outra", email: EMAIL, senha: "outra-senha-123" });
  assert.equal(r.status, 409);
  assert.equal(await contar("cliente"), 1);
});

test("sessão: reconhece o cookie, ignora lixo, e o logout encerra", async () => {
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie })).dados.usuario.email, EMAIL);
  assert.equal((await chamar("GET", "/api/sessao")).dados.usuario, null);
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie: "katchau_sessao=abc' OR '1'='1" })).dados.usuario, null);
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie: "katchau_sessao=" + "0".repeat(64) })).dados.usuario, null);
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie: "katchau_sessao=%E0%A4%A" })).dados.usuario, null);
  const saiu = await chamar("POST", "/api/logout", {}, { cookie });
  assert.match(saiu.cookie, /Max-Age=0/);
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie })).dados.usuario, null);
});

test("login: erro único para e-mail inexistente e senha errada; sucesso abre sessão", async () => {
  const errada = await chamar("POST", "/api/login", { email: EMAIL, senha: "senha-errada-1" });
  const inexistente = await chamar("POST", "/api/login", { email: "nao.existe@exemplo.com", senha: "senha-errada-1" });
  assert.equal(errada.status, 401);
  assert.equal(inexistente.status, 401);
  assert.deepEqual(errada.dados, inexistente.dados);
  assert.equal((await chamar("POST", "/api/login", { email: "x' OR 1=1 --@a.com", senha: "12345678" })).status, 400);
  assert.equal((await chamar("POST", "/api/login", { email: EMAIL })).status, 400);
  const ok = await chamar("POST", "/api/login", { email: EMAIL.toUpperCase(), senha: "senha-forte-123" });
  assert.equal(ok.status, 200);
  cookie = cookieDe(ok);
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie })).dados.usuario.nome, "Ana Souza");
});

test("pedidos exigem login", async () => {
  assert.equal((await chamar("GET", "/api/pedidos")).status, 401);
  assert.equal((await chamar("POST", "/api/pedidos", { itens: [{ id: 1, qty: 1 }], endereco: ENDERECO, pagamento: "pix" })).status, 401);
});

test("pedido inválido não grava nada", async () => {
  const antes = [await contar("pedido"), await contar("endereco"), await contar("item_pedido"), await contar("pagamento")];
  const casos = [
    [{ itens: [], endereco: ENDERECO, pagamento: "pix" }, 400],
    [{ itens: [{ id: 1, qty: 0 }], endereco: ENDERECO, pagamento: "pix" }, 400],
    [{ itens: [{ id: 1, qty: 100 }], endereco: ENDERECO, pagamento: "pix" }, 400],
    [{ itens: [{ id: 1, qty: 1 }], endereco: { ...ENDERECO, cep: "123" }, pagamento: "pix" }, 400],
    [{ itens: [{ id: 1, qty: 1 }], endereco: { ...ENDERECO, uf: "XX" }, pagamento: "pix" }, 400],
    [{ itens: [{ id: 1, qty: 1 }], endereco: ENDERECO, pagamento: "dinheiro" }, 400],
    [{ itens: [{ id: 1, qty: 1 }, { id: 9999, qty: 1 }], endereco: ENDERECO, pagamento: "pix" }, 422]
  ];
  for (const [corpo, esperado] of casos) assert.equal((await chamar("POST", "/api/pedidos", corpo, { cookie })).status, esperado, JSON.stringify(corpo).slice(0, 80));
  const depois = [await contar("pedido"), await contar("endereco"), await contar("item_pedido"), await contar("pagamento")];
  assert.deepEqual(depois, antes);
});

test("pedido válido: preços do banco, itens somados, tudo gravado junto", async () => {
  const r = await chamar("POST", "/api/pedidos", {
    itens: [{ id: 1, qty: 1 }, { id: 6, qty: 2 }, { id: 6, qty: 1 }], // jogo 6 repetido: soma 3
    preco: 0.01, total: 0.01, // valores enviados pelo navegador devem ser ignorados
    endereco: ENDERECO, pagamento: "pix"
  }, { cookie });
  assert.equal(r.status, 201);
  assert.equal(r.dados.pedido.total, centavos(3299.9 + 99.9 * 3));
  assert.equal(await contar("pedido"), 1);
  assert.equal(await contar("item_pedido"), 2);
  assert.equal(await contar("pagamento"), 1);
  const [e] = await db.consultar("SELECT cep, uf, complemento FROM endereco");
  assert.equal(e.cep, "01310-100");
  assert.equal(e.uf, "SP");
  const [pg] = await db.consultar("SELECT metodo, status, valor FROM pagamento");
  assert.deepEqual([pg.metodo, pg.status, Number(pg.valor)], ["pix", "pendente", centavos(3299.9 + 99.9 * 3)]);
});

test("lista só os pedidos do próprio cliente", async () => {
  const lista = await chamar("GET", "/api/pedidos", undefined, { cookie });
  assert.equal(lista.dados.pedidos.length, 1);
  const p = lista.dados.pedidos[0];
  assert.equal(p.status, "aguardando_pagamento");
  assert.equal(p.pagamento.metodo, "pix");
  assert.deepEqual(p.itens.map((i) => [i.id, i.quantidade, i.preco]), [[1, 1, 3299.9], [6, 3, 99.9]]);

  const outro = await chamar("POST", "/api/cadastro", { nome: "Bruno", email: "b." + EMAIL, senha: "senha-forte-456" });
  const vazia = await chamar("GET", "/api/pedidos", undefined, { cookie: cookieDe(outro) });
  assert.deepEqual(vazia.dados.pedidos, []);
});

/* ---------- novas rotas ---------- */
let cookie2;
const EMAIL2 = "carrinho." + EMAIL;

test("carrinho do usuário: exige login, grava, substitui, ignora produto inexistente e esvazia", async () => {
  assert.equal((await chamar("GET", "/api/carrinho")).status, 401);
  assert.equal((await chamar("PUT", "/api/carrinho", { itens: [] })).status, 401);
  const r = await chamar("POST", "/api/cadastro", { nome: "Carla", email: EMAIL2, senha: "senha-carla-123" });
  cookie2 = cookieDe(r);
  assert.deepEqual((await chamar("GET", "/api/carrinho", undefined, { cookie: cookie2 })).dados.itens, []);

  let put = await chamar("PUT", "/api/carrinho", { itens: [{ id: 5, qty: 2 }, { id: 22, qty: 1 }, { id: 9999, qty: 3 }] }, { cookie: cookie2 });
  assert.equal(put.status, 200);
  assert.deepEqual(put.dados.itens, [{ id: 5, qty: 2 }, { id: 22, qty: 1 }]);

  put = await chamar("PUT", "/api/carrinho", { itens: [{ id: 22, qty: 4 }] }, { cookie: cookie2 }); // substitui
  assert.deepEqual(put.dados.itens, [{ id: 22, qty: 4 }]);
  assert.equal((await chamar("PUT", "/api/carrinho", { itens: [{ id: 22, qty: 500 }] }, { cookie: cookie2 })).status, 400);
  assert.equal((await chamar("PUT", "/api/carrinho", { itens: "x" }, { cookie: cookie2 })).status, 400);
  assert.deepEqual((await chamar("PUT", "/api/carrinho", { itens: [] }, { cookie: cookie2 })).dados.itens, []);
  // o carrinho de uma conta não aparece na outra
  await chamar("PUT", "/api/carrinho", { itens: [{ id: 5, qty: 1 }] }, { cookie: cookie2 });
  assert.deepEqual((await chamar("GET", "/api/carrinho", undefined, { cookie })).dados.itens, []);
});

test("endereços: mesmo endereço não é duplicado e aparece na lista", async () => {
  assert.equal((await chamar("GET", "/api/enderecos")).status, 401);
  const pedido = () => chamar("POST", "/api/pedidos", { itens: [{ id: 6, qty: 1 }], endereco: ENDERECO, pagamento: "boleto" }, { cookie: cookie2 });
  await chamar("PUT", "/api/carrinho", { itens: [{ id: 6, qty: 1 }] }, { cookie: cookie2 });
  assert.equal((await pedido()).status, 201);
  assert.deepEqual((await chamar("GET", "/api/carrinho", undefined, { cookie: cookie2 })).dados.itens, [], "pedido feito esvazia o carrinho da conta");
  assert.equal((await pedido()).status, 201);
  assert.equal(Number((await db.consultar("SELECT count(*) AS n FROM endereco e JOIN cliente c USING (id_cliente) WHERE lower(c.email) = '" + EMAIL2.toLowerCase() + "'"))[0].n), 1);
  const lista = (await chamar("GET", "/api/enderecos", undefined, { cookie: cookie2 })).dados.enderecos;
  assert.equal(lista.length, 1);
  assert.equal(lista[0].uf, "SP");
  assert.equal(lista[0].logradouro, "Avenida Paulista");
  // outro endereço (complemento diferente) vira um segundo registro
  assert.equal((await chamar("POST", "/api/pedidos", { itens: [{ id: 6, qty: 1 }], endereco: { ...ENDERECO, complemento: "Apto 12" }, pagamento: "pix" }, { cookie: cookie2 })).status, 201);
  assert.equal((await chamar("GET", "/api/enderecos", undefined, { cookie: cookie2 })).dados.enderecos.length, 2);
  assert.deepEqual((await chamar("GET", "/api/enderecos", undefined, { cookie })).dados.enderecos.length, 1); // só os da própria conta
});

test("perfil: troca o nome", async () => {
  assert.equal((await chamar("POST", "/api/perfil", { nome: "X" })).status, 401);
  assert.equal((await chamar("POST", "/api/perfil", { nome: " " }, { cookie: cookie2 })).status, 400);
  const r = await chamar("POST", "/api/perfil", { nome: "  Carla   Dias " }, { cookie: cookie2 });
  assert.equal(r.dados.usuario.nome, "Carla Dias");
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie: cookie2 })).dados.usuario.nome, "Carla Dias");
});

test("senha: exige a atual, valida a nova e encerra as outras sessões", async () => {
  const outraSessao = cookieDe(await chamar("POST", "/api/login", { email: EMAIL2, senha: "senha-carla-123" }));
  assert.equal((await chamar("POST", "/api/senha", { atual: "senha-carla-123", nova: "123" }, { cookie: cookie2 })).status, 400);
  assert.equal((await chamar("POST", "/api/senha", { atual: "errada-errada", nova: "nova-senha-456" }, { cookie: cookie2 })).status, 401);
  assert.equal((await chamar("POST", "/api/senha", { atual: "senha-carla-123", nova: "nova-senha-456" })).status, 401);
  assert.equal((await chamar("POST", "/api/senha", { atual: "senha-carla-123", nova: "nova-senha-456" }, { cookie: cookie2 })).status, 200);
  assert.ok((await chamar("GET", "/api/sessao", undefined, { cookie: cookie2 })).dados.usuario, "a sessão atual continua");
  assert.equal((await chamar("GET", "/api/sessao", undefined, { cookie: outraSessao })).dados.usuario, null, "a outra sessão foi encerrada");
  assert.equal((await chamar("POST", "/api/login", { email: EMAIL2, senha: "senha-carla-123" })).status, 401);
  assert.equal((await chamar("POST", "/api/login", { email: EMAIL2, senha: "nova-senha-456" })).status, 200);
});

test("limite de tentativas: bloqueia depois de 5 falhas, mesmo com a senha certa", async () => {
  const email = "lento." + EMAIL;
  await chamar("POST", "/api/cadastro", { nome: "Lento", email: email, senha: "senha-lento-123" });
  for (let i = 0; i < 5; i++) assert.equal((await chamar("POST", "/api/login", { email: email, senha: "errada-errada-" + i })).status, 401);
  const bloqueado = await chamar("POST", "/api/login", { email: email, senha: "senha-lento-123" });
  assert.equal(bloqueado.status, 429);
  assert.match(bloqueado.dados.erro, /Muitas tentativas/);
  // e-mail inexistente também conta (não revela quais e-mails existem)
  const fantasma = "fantasma." + EMAIL;
  for (let i = 0; i < 5; i++) await chamar("POST", "/api/login", { email: fantasma, senha: "errada-errada" });
  assert.equal((await chamar("POST", "/api/login", { email: fantasma, senha: "errada-errada" })).status, 429);
  // outra conta não é afetada
  assert.equal((await chamar("POST", "/api/login", { email: EMAIL2, senha: "nova-senha-456" })).status, 200);
  // passada a janela, volta a funcionar
  await db.consultar("DELETE FROM tentativa_login WHERE chave = $1", ["e:" + email]);
  assert.equal((await chamar("POST", "/api/login", { email: email, senha: "senha-lento-123" })).status, 200);
});

/* ---------- estoque e subtotal (modelo conceitual) ---------- */
test("pedido baixa o estoque, grava o subtotal e recusa quando não há unidades", async () => {
  const estoque = async (id) => Number((await db.consultar("SELECT estoque FROM produto WHERE id_produto = " + id))[0].estoque);
  assert.equal(await estoque(22), 100, "seed cria 100 unidades");
  const pedir = (qty) => chamar("POST", "/api/pedidos", { itens: [{ id: 22, qty }], endereco: ENDERECO, pagamento: "pix" }, { cookie: cookie2 });

  assert.equal((await pedir(3)).status, 201);
  assert.equal(await estoque(22), 97, "estoque baixou 3");
  const [item] = await db.consultar("SELECT quantidade, preco_unitario, subtotal FROM item_pedido ORDER BY id_item DESC LIMIT 1");
  assert.equal(Number(item.subtotal), centavos(Number(item.preco_unitario) * 3), "subtotal = preço × quantidade");

  await db.consultar("UPDATE produto SET estoque = 2 WHERE id_produto = 22");
  const antes = await contar("pedido");
  const recusado = await pedir(3);
  assert.equal(recusado.status, 422);
  assert.match(recusado.dados.erro, /estoque/);
  assert.equal(await contar("pedido"), antes, "nada é gravado");
  assert.equal(await estoque(22), 2, "estoque não muda quando o pedido é recusado");

  // mistura: um item sem estoque derruba o pedido inteiro (outros itens não são baixados)
  const estoque6 = await estoque(6);
  const misto = await chamar("POST", "/api/pedidos", { itens: [{ id: 6, qty: 1 }, { id: 22, qty: 9 }], endereco: ENDERECO, pagamento: "pix" }, { cookie: cookie2 });
  assert.equal(misto.status, 422);
  assert.equal(await estoque(6), estoque6);

  assert.equal((await pedir(2)).status, 201, "as últimas unidades podem ser compradas");
  assert.equal(await estoque(22), 0);
  assert.equal((await pedir(1)).status, 422, "esgotado");
});

test("o seed pode ser reexecutado sem zerar o estoque", async () => {
  await db.consultar("UPDATE produto SET estoque = 7 WHERE id_produto = 1");
  executar(readFileSync(new URL("../db/seed.sql", import.meta.url), "utf8"));
  assert.equal(Number((await db.consultar("SELECT estoque FROM produto WHERE id_produto = 1"))[0].estoque), 7);
});

test("compra simultânea que viola a regra de estoque vira 422, não 500", async () => {
  const falso = { consultar: async (t) => { if (/INSERT INTO pedido|WITH it AS/.test(t)) { const e = new Error('violates check constraint "ck_produto_estoque"'); e.code = "23514"; throw e; } return db.consultar.apply(null, arguments); } };
  const resp = await tratar(new Request(BASE + "/api/pedidos", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: BASE, Cookie: cookie2 },
    body: JSON.stringify({ itens: [{ id: 5, qty: 1 }], endereco: ENDERECO, pagamento: "pix" })
  }), {}, { consultar: (t, p) => (/WITH it AS/.test(t) ? falso.consultar(t) : db.consultar(t, p)) });
  assert.equal(resp.status, 422);
});

/*
 * Confere se a API publicada está funcionando de ponta a ponta (banco, conta, carrinho e pedido).
 *
 * Uso:  node scripts/verificar-api.cjs https://katchau.jpsn-dev.workers.dev
 *
 * Atenção: o teste cria no banco uma conta de verificação ("verificacao-…@exemplo.com") e um
 * pedido de R$ da loja fictícia. Pode apagá-los depois no Neon:
 *   DELETE FROM cliente WHERE email LIKE 'verificacao-%@exemplo.com';
 */
const base = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Informe o endereço do site. Ex.: node scripts/verificar-api.cjs https://katchau.jpsn-dev.workers.dev");
  process.exit(2);
}

let cookie = "";
let falhas = 0;

async function chamar(metodo, caminho, corpo) {
  const resp = await fetch(base + caminho, {
    method: metodo,
    headers: Object.assign({ "Content-Type": "application/json" }, cookie ? { Cookie: cookie } : {}),
    body: corpo === undefined ? undefined : JSON.stringify(corpo)
  });
  const set = resp.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  let dados = null;
  try { dados = await resp.json(); } catch (e) { /* sem JSON */ }
  return { status: resp.status, dados };
}

function conferir(descricao, condicao, detalhe) {
  console.log((condicao ? "  ok   " : "  FALHA ") + descricao + (condicao || !detalhe ? "" : "  → " + detalhe));
  if (!condicao) falhas++;
}

(async () => {
  console.log("Verificando " + base + "\n");
  const email = "verificacao-" + Date.now() + "@exemplo.com";
  const senha = "senha-de-teste-123";

  let r = await chamar("GET", "/api/saude");
  conferir("banco responde (/api/saude)", r.status === 200 && r.dados && r.dados.banco === true, JSON.stringify(r.dados));
  if (!(r.status === 200)) {
    console.log("\nSem conexão com o banco: confira a variável secreta DATABASE_URL no Worker e se db/schema.sql foi executado.");
    process.exit(1);
  }

  r = await chamar("GET", "/api/produtos");
  conferir("produtos carregados do banco (36 esperados)", r.status === 200 && r.dados.produtos.length === 36, "recebidos: " + (r.dados && r.dados.produtos ? r.dados.produtos.length : "nenhum — execute db/seed.sql"));

  r = await chamar("POST", "/api/cadastro", { nome: "Verificação", email, senha });
  conferir("cadastro", r.status === 201, JSON.stringify(r.dados));
  conferir("cookie de sessão recebido", cookie.startsWith("katchau_sessao="));

  r = await chamar("GET", "/api/sessao");
  conferir("sessão reconhecida", r.dados && r.dados.usuario && r.dados.usuario.email === email);

  r = await chamar("PUT", "/api/carrinho", { itens: [{ id: 1, qty: 1 }, { id: 6, qty: 2 }] });
  conferir("carrinho da conta salvo", r.status === 200 && r.dados.itens.length === 2, JSON.stringify(r.dados));

  r = await chamar("POST", "/api/pedidos", {
    itens: [{ id: 1, qty: 1 }, { id: 6, qty: 2 }], pagamento: "pix",
    endereco: { cep: "01310-100", logradouro: "Avenida Paulista", numero: "1000", complemento: "", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" }
  });
  conferir("pedido criado", r.status === 201 && r.dados.pedido && r.dados.pedido.id > 0, JSON.stringify(r.dados));

  r = await chamar("GET", "/api/pedidos");
  conferir("pedido aparece no histórico", r.status === 200 && r.dados.pedidos.length === 1 && r.dados.pedidos[0].itens.length === 2, JSON.stringify(r.dados));

  r = await chamar("POST", "/api/logout", {});
  conferir("logout", r.status === 200);
  cookie = "";
  r = await chamar("POST", "/api/login", { email, senha: "senha-errada-999" });
  conferir("senha errada é recusada", r.status === 401);
  r = await chamar("POST", "/api/login", { email, senha });
  conferir("login com a senha certa", r.status === 200);

  console.log(falhas ? "\n" + falhas + " verificação(ões) falharam." : "\nTudo certo: banco, conta, carrinho e pedidos funcionam.");
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error("Erro de rede:", e.message); process.exit(1); });

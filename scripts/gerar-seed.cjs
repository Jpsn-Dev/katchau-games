/*
 * Gera db/seed.sql (categorias, marcas e os 36 produtos) a partir de public/js/dados.js.
 * O catálogo do site continua sendo o arquivo dados.js; este script só o copia para o banco.
 *
 * Uso:  node scripts/gerar-seed.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..");
const codigo = fs.readFileSync(path.join(raiz, "public", "js", "dados.js"), "utf8");
const contexto = {};
vm.createContext(contexto);
vm.runInContext(codigo + "\nthis.PRODUTOS = PRODUTOS; this.CATEGORIAS = CATEGORIAS;", contexto);
const { PRODUTOS, CATEGORIAS } = contexto;

// Marca de cada produto (id do produto → nome da marca).
const MARCAS_POR_PRODUTO = {
  1: "Sony", 2: "Sony", 3: "Microsoft", 4: "Microsoft", 5: "Nintendo", 36: "Nintendo",
  6: "Unknown Worlds", 7: "Team Cherry", 8: "CD Projekt Red", 9: "Rockstar Games", 10: "Sony",
  11: "NetherRealm Studios", 12: "Warner Bros. Games", 13: "Mojang Studios", 14: "Team Cherry",
  15: "Bethesda", 16: "Activision", 17: "Microsoft", 18: "Electronic Arts", 19: "Rockstar Games",
  20: "Hello Games", 21: "Nintendo", 22: "Sony", 23: "Sony", 24: "Microsoft", 25: "Microsoft",
  26: "Redragon", 27: "JBL", 28: "KZ", 29: "Redragon", 30: "Redragon", 31: "QCY", 32: "Corsair",
  33: "Nintendo", 34: "Nintendo", 35: "Nintendo"
};

// Estoque inicial de cada produto novo (ao reexecutar o seed o estoque já existente NÃO é alterado).
const ESTOQUE_INICIAL = 100;

const sql = (texto) => "'" + String(texto).replace(/'/g, "''") + "'";
const categoriasBanco = { Consoles: "consoles", "Jogos": "jogos", "Periféricos": "perifericos" };

const faltando = PRODUTOS.filter((p) => !MARCAS_POR_PRODUTO[p.id]);
if (faltando.length) {
  console.error("Produtos sem marca definida: " + faltando.map((p) => p.id).join(", "));
  process.exit(1);
}

const marcas = [...new Set(Object.values(MARCAS_POR_PRODUTO))];
const saida = [];
saida.push("-- Gerado por scripts/gerar-seed.cjs a partir de public/js/dados.js. Não edite à mão.");
saida.push("-- Pode ser executado várias vezes: atualiza os produtos e não duplica categorias nem marcas.\n");

saida.push("INSERT INTO categoria (nome)");
saida.push("SELECT v.nome FROM (VALUES " + CATEGORIAS.map((c) => "(" + sql(categoriasBanco[c]) + ")").join(", ") + ") AS v (nome)");
saida.push("WHERE NOT EXISTS (SELECT 1 FROM categoria c WHERE lower(c.nome) = lower(v.nome));\n");

saida.push("INSERT INTO marca (nome)");
saida.push("SELECT v.nome FROM (VALUES " + marcas.map((m) => "(" + sql(m) + ")").join(", ") + ") AS v (nome)");
saida.push("WHERE NOT EXISTS (SELECT 1 FROM marca m WHERE lower(m.nome) = lower(v.nome));\n");

saida.push("INSERT INTO produto (id_produto, slug, nome, id_categoria, id_marca, plataformas, preco, preco_antigo, etiqueta, imagem, tipo, ativo, estoque)");
saida.push("VALUES");
saida.push(PRODUTOS.map((p) =>
  "  (" + [
    p.id, sql(p.slug), sql(p.name),
    "(SELECT id_categoria FROM categoria WHERE lower(nome) = " + sql(categoriasBanco[p.category]) + " LIMIT 1)",
    "(SELECT id_marca FROM marca WHERE lower(nome) = lower(" + sql(MARCAS_POR_PRODUTO[p.id]) + ") LIMIT 1)",
    "ARRAY[" + p.platforms.map(sql).join(", ") + "]::text[]",
    p.price.toFixed(2), p.oldPrice.toFixed(2), sql(p.tag), sql(p.image), sql(p.kind), "true", ESTOQUE_INICIAL
  ].join(", ") + ")"
).join(",\n"));
saida.push("ON CONFLICT (id_produto) DO UPDATE SET");
saida.push("  slug = EXCLUDED.slug, nome = EXCLUDED.nome, id_categoria = EXCLUDED.id_categoria, id_marca = EXCLUDED.id_marca,");
saida.push("  plataformas = EXCLUDED.plataformas, preco = EXCLUDED.preco, preco_antigo = EXCLUDED.preco_antigo,");
saida.push("  etiqueta = EXCLUDED.etiqueta, imagem = EXCLUDED.imagem, tipo = EXCLUDED.tipo, ativo = EXCLUDED.ativo;");
saida.push("-- (a coluna estoque fica de fora do UPDATE de propósito)\n");

saida.push("-- Mantém o contador automático alinhado com os ids inseridos (caso a coluna seja serial).");
saida.push("SELECT setval(pg_get_serial_sequence('produto', 'id_produto'), (SELECT max(id_produto) FROM produto))");
saida.push("WHERE pg_get_serial_sequence('produto', 'id_produto') IS NOT NULL;");

fs.writeFileSync(path.join(raiz, "db", "seed.sql"), saida.join("\n") + "\n");
console.log("db/seed.sql gerado: " + PRODUTOS.length + " produtos, " + marcas.length + " marcas, " + CATEGORIAS.length + " categorias.");

/*
 * Baixa as imagens do site KaTchau para public/assets/images/ e ativa o modo local.
 *
 * Uso (na pasta do projeto, com Node.js 18+):
 *     node scripts/baixar-imagens.cjs
 *
 * Depois disso o site funciona sem internet para as imagens
 * (as fontes do Google Fonts continuam sendo carregadas online).
 */
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const arquivoDados = path.join(raiz, "public", "js", "dados.js");
const pasta = path.join(raiz, "public", "assets", "images");

const fonte = fs.readFileSync(arquivoDados, "utf8");
const base = /IMAGENS_URL_REMOTA = "([^"]+)"/.exec(fonte)[1];
const bloco = fonte.split("const IMAGENS = {")[1].split("\n};")[0];
const imagens = [...bloco.matchAll(/"([^"]+)":\s*"([0-9a-f-]{36})"/g)].map((m) => ({ arquivo: m[1], id: m[2] }));

async function baixar({ arquivo, id }) {
  const url = base + id + "/" + arquivo;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(arquivo + " → HTTP " + resposta.status);
  fs.writeFileSync(path.join(pasta, arquivo), Buffer.from(await resposta.arrayBuffer()));
}

(async () => {
  fs.mkdirSync(pasta, { recursive: true });
  let falhas = 0;
  for (const img of imagens) {
    try {
      await baixar(img);
      console.log("ok   " + img.arquivo);
    } catch (e) {
      falhas++;
      console.error("ERRO " + e.message);
    }
  }
  if (falhas) {
    console.error("\n" + falhas + " imagem(ns) falharam. O modo local NÃO foi ativado.");
    process.exit(1);
  }
  fs.writeFileSync(arquivoDados, fonte.replace("USAR_IMAGENS_LOCAIS = false", "USAR_IMAGENS_LOCAIS = true"));
  console.log("\n" + imagens.length + " imagens salvas em public/assets/images/. Modo local ativado em js/dados.js.");
})();

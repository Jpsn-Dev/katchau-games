/*
 * Mantém o cabeçalho e o rodapé iguais em todas as páginas.
 *
 * Os modelos ficam em partials/cabecalho.html e partials/rodape.html. Este script copia cada
 * um para o trecho marcado de cada página em public/*.html e destaca no menu o link da própria
 * página (class="active"). O resultado continua sendo HTML puro: nada é montado no navegador.
 *
 * Uso:
 *   node scripts/gerar-paginas.cjs             atualiza as páginas
 *   node scripts/gerar-paginas.cjs --verificar só confere (sai com erro se alguma estiver desatualizada)
 */
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const pasta = path.join(raiz, "public");
const modelo = (nome) => fs.readFileSync(path.join(raiz, "partials", nome), "utf8").replace(/\s+$/, "");
const cabecalho = modelo("cabecalho.html");
const rodape = modelo("rodape.html");
// Páginas que aparecem no menu principal e por isso ganham destaque quando estão abertas.
const COM_DESTAQUE = ["index.html", "catalogo.html", "consoles.html", "jogos.html", "perifericos.html", "conta.html"];
const verificar = process.argv.includes("--verificar");

const trecho = (nome) => new RegExp("(    <!-- " + nome + ":inicio[^\\n]*-->\\n)[\\s\\S]*?(    <!-- " + nome + ":fim -->)");

let desatualizadas = 0;
for (const arquivo of fs.readdirSync(pasta).filter((f) => f.endsWith(".html")).sort()) {
  const caminho = path.join(pasta, arquivo);
  const original = fs.readFileSync(caminho, "utf8");
  if (!trecho("cabecalho").test(original)) continue; // ex.: 404.html tem layout próprio

  const comDestaque = !COM_DESTAQUE.includes(arquivo) ? cabecalho : cabecalho.split('<a href="' + arquivo + '">').join('<a href="' + arquivo + '" class="active">');
  const novo = original
    .replace(trecho("cabecalho"), (_, ini, fim) => ini + "    " + comDestaque + "\n" + fim)
    .replace(trecho("rodape"), (_, ini, fim) => ini + "    " + rodape + "\n" + fim);

  if (novo !== original) {
    desatualizadas++;
    if (!verificar) fs.writeFileSync(caminho, novo);
    console.log((verificar ? "desatualizada: " : "atualizada: ") + arquivo);
  }
}
if (verificar && desatualizadas) process.exit(1);
console.log(desatualizadas ? "" : "Todas as páginas já estão em dia.");

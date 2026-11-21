/*
 * KaTchau — dúvidas frequentes: acordeão de abertura única (um item aberto por vez,
 * podendo fechar todos). O primeiro item inicia aberto.
 */

(function () {
  const gatilhos = Array.prototype.slice.call(document.querySelectorAll(".acc-trigger"));
  if (!gatilhos.length) return;

  function definir(gatilho, aberto) {
    gatilho.setAttribute("aria-expanded", String(aberto));
    const painel = document.getElementById(gatilho.getAttribute("aria-controls"));
    painel.classList.toggle("open", aberto);
    painel.setAttribute("aria-hidden", String(!aberto));
  }

  gatilhos.forEach(function (g) {
    g.addEventListener("click", function () {
      const abrir = g.getAttribute("aria-expanded") !== "true";
      gatilhos.forEach(function (outro) { definir(outro, false); });
      if (abrir) definir(g, true);
    });
    g.addEventListener("keydown", function (e) {
      const i = gatilhos.indexOf(g);
      let alvo = null;
      if (e.key === "ArrowDown") alvo = gatilhos[(i + 1) % gatilhos.length];
      else if (e.key === "ArrowUp") alvo = gatilhos[(i - 1 + gatilhos.length) % gatilhos.length];
      else if (e.key === "Home") alvo = gatilhos[0];
      else if (e.key === "End") alvo = gatilhos[gatilhos.length - 1];
      if (alvo) { e.preventDefault(); alvo.focus(); }
    });
  });

  definir(gatilhos[0], true);
})();

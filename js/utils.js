/*
 * KaTchau — utilitários compartilhados:
 * formatação, ícones, escape de HTML, avisos (toasts) e camadas (painel lateral / diálogo).
 */

/* ------------------------------------------------------------------
 * Formatação
 * ------------------------------------------------------------------ */
const formatadorBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function dinheiro(valor) {
  return formatadorBRL.format(valor);
}

function percentualDesconto(preco, precoAntigo) {
  return precoAntigo > preco ? Math.round((1 - preco / precoAntigo) * 100) : 0;
}

const MAX_PARCELAS = 10;

function valorParcela(preco) {
  return Math.round((preco / MAX_PARCELAS) * 100) / 100;
}

function normalizarTexto(valor) {
  return valor
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function esc(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------
 * Ícones (traçado Lucide, 24x24)
 * ------------------------------------------------------------------ */
const ICONES = {
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "shopping-bag": '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  "menu": '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  "plus": '<path d="M5 12h14"/><path d="M12 5v14"/>',
  "minus": '<path d="M5 12h14"/>',
  "trash": '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  "sparkles": '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  "tag": '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  "star": '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  "check": '<path d="M20 6 9 17l-5-5"/>',
  "copy": '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  "help-circle": '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  "mail": '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  "package": '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  "instagram": '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  "youtube": '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  "truck": '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  "gamepad": '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
  "headphones": '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  "monitor-play": '<path d="M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.638z"/><path d="M12 17v4"/><path d="M8 21h8"/><rect x="2" y="3" width="20" height="14" rx="2"/>',
  "sliders": '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  "eye": '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  "eye-off": '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>'
};

function icone(nome, classe) {
  return '<svg class="icon' + (classe ? " " + classe : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONES[nome] + "</svg>";
}

/* ------------------------------------------------------------------
 * Avisos (toasts) — canto inferior direito
 * ------------------------------------------------------------------ */
const DURACAO_TOAST = 4000;
const TOASTS_VISIVEIS = 3;
const ICONE_SUCESSO =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"/></svg>';

function obterToaster() {
  let el = document.querySelector(".toaster");
  if (!el) {
    el = document.createElement("section");
    el.className = "toaster";
    el.setAttribute("aria-label", "Notificações");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  return el;
}

function fecharToast(el) {
  if (!el || el.dataset.saindo) return;
  el.dataset.saindo = "1";
  el.classList.add("out");
  setTimeout(function () { el.remove(); }, 300);
}

/**
 * toast("Título", { descricao, acao: { rotulo, aoClicar }, sucesso: true })
 */
function toast(titulo, opcoes) {
  opcoes = opcoes || {};
  const toaster = obterToaster();
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");

  let html = "";
  if (opcoes.sucesso) html += '<div class="t-icon">' + ICONE_SUCESSO + "</div>";
  html += '<div class="t-content"><div class="t-title">' + esc(titulo) + "</div>";
  if (opcoes.descricao) html += '<div class="t-desc">' + esc(opcoes.descricao) + "</div>";
  html += "</div>";
  if (opcoes.acao) html += '<button type="button" class="t-action">' + esc(opcoes.acao.rotulo) + "</button>";
  el.innerHTML = html;

  if (opcoes.acao) {
    el.querySelector(".t-action").addEventListener("click", function () {
      opcoes.acao.aoClicar();
      fecharToast(el);
    });
  }

  toaster.appendChild(el);
  const ativos = toaster.querySelectorAll(".toast:not(.out)");
  if (ativos.length > TOASTS_VISIVEIS) fecharToast(ativos[0]);
  setTimeout(function () { fecharToast(el); }, DURACAO_TOAST);
}

toast.sucesso = function (titulo, opcoes) {
  toast(titulo, Object.assign({}, opcoes, { sucesso: true }));
};

/* ------------------------------------------------------------------
 * Camadas modais (painel lateral e diálogo de confirmação)
 * HTML esperado:
 *   <div class="layer" hidden>
 *     <div class="overlay"></div>
 *     <div class="sheet|dialog" role="dialog" aria-modal="true"> … </div>
 *   </div>
 * ------------------------------------------------------------------ */
const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function criarCamada(camada, opcoes) {
  opcoes = opcoes || {};
  const overlay = camada.querySelector(".overlay");
  const conteudo = camada.querySelector(".sheet, .dialog");
  const atraso = conteudo.classList.contains("sheet") ? 300 : 200;
  let gatilho = null;
  let aberta = false;
  let timer = null;

  function aoTeclar(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      fechar();
      return;
    }
    if (e.key !== "Tab") return;
    const itens = Array.prototype.filter.call(conteudo.querySelectorAll(FOCAVEIS), function (n) { return n.offsetParent !== null; });
    if (!itens.length) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  }

  function abrir(origem) {
    if (aberta) return;
    aberta = true;
    clearTimeout(timer);
    gatilho = origem || document.activeElement;
    camada.hidden = false;
    overlay.dataset.state = "open";
    conteudo.dataset.state = "open";
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", aoTeclar, true);
    const alvo = (opcoes.focoInicial && conteudo.querySelector(opcoes.focoInicial)) || conteudo.querySelector(FOCAVEIS);
    if (alvo) alvo.focus();
    if (opcoes.aoAbrir) opcoes.aoAbrir();
  }

  function fechar() {
    if (!aberta) return;
    aberta = false;
    overlay.dataset.state = "closed";
    conteudo.dataset.state = "closed";
    document.removeEventListener("keydown", aoTeclar, true);
    timer = setTimeout(function () {
      camada.hidden = true;
      document.body.style.overflow = "";
    }, atraso);
    if (gatilho && gatilho.focus) gatilho.focus();
    if (opcoes.aoFechar) opcoes.aoFechar();
  }

  if (opcoes.fecharAoClicarFora !== false) overlay.addEventListener("click", fechar);
  camada.querySelectorAll("[data-fechar]").forEach(function (b) { b.addEventListener("click", fechar); });

  return { abrir: abrir, fechar: fechar, estaAberta: function () { return aberta; } };
}

/* ------------------------------------------------------------------
 * Parâmetros da URL
 * ------------------------------------------------------------------ */
function lerParametros() {
  const out = {};
  new URLSearchParams(window.location.search).forEach(function (valor, chave) { out[chave] = valor; });
  return out;
}

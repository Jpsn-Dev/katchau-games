/* Navegação nativa, menu, avisos e apresentação do carrinho. */
(function () {
  'use strict';
  const root = document.body.dataset.root || '';
  const cls = (...names) => names.map(name => KT_CLASSES[name] || name).join(' ');
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let timer;
  const notify = (message, cartLink = false) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.replaceChildren(document.createTextNode(message));
    if (cartLink) { const a = document.createElement('a'); a.href = root + 'carrinho.html'; a.textContent = 'Ver carrinho'; toast.append(a); }
    toast.hidden = false; clearTimeout(timer); timer = setTimeout(() => { toast.hidden = true; }, 5000);
  };
  window.KT_UI = { notify, money };
  const closeDialog = dialog => {
    dialog.close(); document.body.classList.remove('dialog-open');
    document.querySelectorAll('[data-open]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  };
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', () => { document.body.classList.remove('dialog-open'); });
    dialog.addEventListener('click', event => { if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    } });
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); });
  });
  const renderCart = () => {
    const items = KT_CART.read(); const count = KT_CART.count(items);
    document.querySelectorAll('[data-cart-count]').forEach(span => {
      span.textContent = count;
      const link = span.closest('a'); if (link) link.setAttribute('aria-label', `Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`);
    });
    const content = document.querySelector('[data-cart-content]'); if (!content) return;
    const clearButton = document.querySelector('[data-clear-cart]');
    const lines = items.map(item => ({ ...item, product: KT_DATA.products.find(p => p.id === item.id) })).filter(item => item.product);
    if (clearButton) clearButton.hidden = !lines.length;
    if (!lines.length) {
      content.innerHTML = `<div class="${cls('mt-10', 'rounded-xl', 'border', 'border-dashed', 'px-6', 'py-24', 'text-center')}"><div class="empty-bag" aria-hidden="true">♧</div><p class="${cls('display', 'mt-5', 'text-3xl')}">Seu carrinho está vazio</p><p class="${cls('mt-2','text-muted-foreground')}">Adicione produtos pelo catálogo — consoles, jogos e periféricos esperam por você.</p><a href="catalogo.html" class="native-brand-link">Voltar ao catálogo</a></div>`;
      return;
    }
    const { subtotal, savings } = KT_CART.totals(items, KT_DATA.products);
    content.innerHTML = `<div class="cart-layout"> <ul class="cart-list">${lines.map(({ product: p, qty }) => `
      <li class="cart-row"><a href="produtos/${p.slug}.html" class="cart-thumb"><div class="${cls('relative','grid','aspect-square','place-items-center','overflow-hidden',p.kind === 'game' ? 'bg-surface-raised' : 'bg-tile')}"><img src="${p.image}" alt="${escape(p.name)}" class="${cls('absolute','inset-0','m-auto','object-contain',p.kind === 'game' ? 'w-[84%]' : 'w-[78%]',p.kind === 'game' ? 'h-[84%]' : 'h-[78%]')}"></div></a>
      <div class="cart-line-body"><div class="cart-line-top"><div class="cart-name"><p class="${cls('text-[11px]','uppercase','text-muted-foreground')}">${p.platforms.join(' · ')}</p><a href="produtos/${p.slug}.html" class="${cls('font-semibold')}">${escape(p.name)}</a><p class="${cls('mt-1','text-sm','text-muted-foreground')}">${money(p.price)} cada</p></div><p class="cart-total">${money(p.price * qty)}</p></div>
      <div class="cart-line-bottom"><div class="quantity-control"><button aria-label="Diminuir quantidade" data-cart-step="-1" data-id="${p.id}">−</button><span>${qty}</span><button aria-label="Aumentar quantidade" data-cart-step="1" data-id="${p.id}" ${qty >= 99 ? 'disabled' : ''}>+</button></div><button data-remove="${p.id}" class="remove-item">♲ Remover</button></div></div></li>`).join('')}</ul>
      <aside class="cart-summary"><h2 class="${cls('font-display','text-lg','font-bold','uppercase')}">Resumo do pedido</h2><dl><div><dt>Produtos (${count})</dt><dd>${money(subtotal + savings)}</dd></div><div><dt>Descontos</dt><dd class="savings">− ${money(savings)}</dd></div></dl><div class="cart-grand-total"><span>Total</span><div><p>${money(subtotal)}</p><small>ou 10x de ${money(Math.round(subtotal / 10 * 100) / 100)} sem juros</small></div></div><button data-checkout class="native-brand-link">Finalizar compra →</button><a href="catalogo.html" class="continue-shopping">Continuar comprando</a><p class="cart-disclaimer">Ambiente demonstrativo. Nenhuma cobrança será feita.</p></aside></div>`;
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-open')) {
      const dialog = document.getElementById(button.dataset.open);
      if (dialog) { dialog.showModal(); document.body.classList.add('dialog-open'); button.setAttribute('aria-expanded', 'true'); }
    }
    if (button.hasAttribute('data-close')) { const dialog = button.closest('dialog'); if (dialog) closeDialog(dialog); }
    if (button.hasAttribute('data-add')) { KT_CART.add(Number(button.dataset.add)); notify('Adicionado ao carrinho', true); }
    if (button.hasAttribute('data-cart-step')) {
      const id = Number(button.dataset.id); const item = KT_CART.read().find(item => item.id === id);
      if (item) KT_CART.quantity(id, item.qty + Number(button.dataset.cartStep));
    }
    if (button.hasAttribute('data-remove')) KT_CART.remove(Number(button.dataset.remove));
    if (button.hasAttribute('data-clear-cart')) {
      const count = KT_CART.count(KT_CART.read());
      document.querySelector('[data-clear-description]').textContent = `Todos os ${count} ${count === 1 ? 'item será removido' : 'itens serão removidos'}. Essa ação não pode ser desfeita.`;
      document.getElementById('clear-dialog').showModal(); document.body.classList.add('dialog-open');
    }
    if (button.hasAttribute('data-confirm-clear')) { KT_CART.clear(); closeDialog(document.getElementById('clear-dialog')); notify('Carrinho esvaziado'); }
    if (button.hasAttribute('data-checkout')) notify('Compra simulada. Este é um ambiente demonstrativo: nenhum pedido ou pagamento foi realizado.');
  });
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('header nav a, #menu-dialog nav a').forEach(a => {
    if (a.getAttribute('href') === root + current) { a.classList.add('current-page'); a.setAttribute('aria-current','page'); }
    else { a.classList.remove('current-page'); a.removeAttribute('aria-current'); }
  });
  window.addEventListener('kt:cart', renderCart);
  renderCart();
})();
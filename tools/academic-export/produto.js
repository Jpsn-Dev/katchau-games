/* Quantidade e compra simulada na página HTML de cada produto. */
(function () {
  'use strict';
  const main = document.querySelector('[data-product]');
  if (!main) return;
  let quantity = 1;
  main.addEventListener('click', event => {
    const step = event.target.closest('[data-qty]');
    if (step) {
      quantity = Math.max(1, Math.min(KT_CART.MAX_QTY, quantity + Number(step.dataset.qty)));
      main.querySelector('[data-product-qty]').textContent = quantity;
      main.querySelector('[data-qty="-1"]').disabled = quantity <= 1;
      main.querySelector('[data-qty="1"]').disabled = quantity >= KT_CART.MAX_QTY;
    }
    if (event.target.closest('[data-product-add], [data-buy-now]')) {
      KT_CART.add(Number(main.dataset.product), quantity);
      if (event.target.closest('[data-buy-now]')) location.href = document.body.dataset.root + 'carrinho.html';
      else window.KT_UI.notify('Adicionado ao carrinho', true);
    }
  });
})();
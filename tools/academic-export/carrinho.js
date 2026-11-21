/* Carrinho demonstrativo: regras e persistência locais, sem servidor. */
(function () {
  'use strict';
  const KEY = 'katchau-cart-v5';
  const MAX_QTY = 99;
  const clamp = value => Math.max(1, Math.min(MAX_QTY, Math.floor(Number(value) || 1)));
  const addItem = (items, id, qty = 1) => items.some(item => item.id === id)
    ? items.map(item => item.id === id ? { id, qty: clamp(item.qty + qty) } : item)
    : [...items, { id, qty: clamp(qty) }];
  const removeItem = (items, id) => items.filter(item => item.id !== id);
  const setQty = (items, id, qty) => qty < 1 ? removeItem(items, id)
    : items.map(item => item.id === id ? { id, qty: clamp(qty) } : item);
  const totals = (items, products) => {
    let subtotal = 0, original = 0;
    items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      subtotal += product.price * item.qty;
      original += product.oldPrice * item.qty;
    });
    return { subtotal: Math.round(subtotal * 100) / 100, savings: Math.round((original - subtotal) * 100) / 100 };
  };
  const count = items => items.reduce((sum, item) => sum + item.qty, 0);
  let state = [];
  const read = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
      state = Array.isArray(parsed) ? parsed.filter(item => Number.isFinite(Number(item?.id)))
        .map(item => ({ id: Number(item.id), qty: clamp(item.qty) })) : [];
    } catch { /* Navegadores que bloqueiam armazenamento mantêm o carrinho na memória. */ }
    return state;
  };
  const commit = items => {
    state = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* Memória local como alternativa. */ }
    window.dispatchEvent(new Event('kt:cart'));
  };
  window.KT_CART = {
    MAX_QTY, addItem, removeItem, setQty, totals, count, read,
    add: (id, qty = 1) => commit(addItem(read(), id, qty)),
    quantity: (id, qty) => commit(setQty(read(), id, qty)),
    remove: id => commit(removeItem(read(), id)), clear: () => commit([]),
  };
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) { read(); window.dispatchEvent(new Event('kt:cart')); }
  });
})();
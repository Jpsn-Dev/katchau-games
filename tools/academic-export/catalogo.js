/* Atualiza somente os resultados; cada departamento é um arquivo HTML independente. */
(function () {
  'use strict';
  const main = document.querySelector('[data-catalog]');
  if (!main) return;
  const grid = main.querySelector('[data-product-grid]');
  const counter = main.querySelector('[data-result-count]');
  const chips = main.querySelector('[data-chips]');
  const read = () => Object.fromEntries(new URLSearchParams(location.search));
  const update = patch => {
    const params = new URLSearchParams(location.search);
    Object.entries(patch).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
    render();
  };
  const toggle = (key, value) => {
    const values = new Set((read()[key] || '').split(',').filter(Boolean));
    values.has(value) ? values.delete(value) : values.add(value);
    update({ [key]: [...values].join(',') });
  };
  const clear = () => update({ q: '', categoria: '', plataforma: '', preco: '' });
  const render = () => {
    const search = read();
    const results = KT_FILTERS.filter(KT_DATA.products, search, main.dataset.catalog);
    if (counter) counter.innerHTML = `<strong>${results.length}</strong> ${results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
    if (grid) {
      grid.innerHTML = results.length ? results.map(p => KT_CARDS[p.slug]).join('')
        : `<div class="empty-results"><h2>Nada por aqui</h2><p>Não encontramos produtos com esses filtros. Tente outro termo ou limpe os filtros.</p><button data-clear-filters>Limpar filtros</button> <a href="catalogo.html">Ver catálogo</a></div>`;
    }
    document.querySelectorAll('[data-filter]').forEach(input => {
      input.checked = (search[input.dataset.filter] || '').split(',').includes(input.value);
    });
    document.querySelectorAll('[data-sort]').forEach(select => { select.value = search.ordem || 'relevancia'; });
    main.querySelectorAll('[data-category]').forEach(button => {
      const active = (search.categoria || '') === button.dataset.category;
      button.className = active ? KT_CLASSES['shrink-0'] + ' ' + KT_CLASSES['rounded-full'] + ' ' + KT_CLASSES['bg-primary'] + ' ' + KT_CLASSES['px-5'] + ' ' + KT_CLASSES['py-2'] + ' ' + KT_CLASSES['text-sm'] + ' ' + KT_CLASSES['font-bold'] + ' ' + KT_CLASSES['text-primary-foreground']
        : KT_CLASSES['shrink-0'] + ' ' + KT_CLASSES['rounded-full'] + ' ' + KT_CLASSES['border'] + ' ' + KT_CLASSES['px-5'] + ' ' + KT_CLASSES['py-2'] + ' ' + KT_CLASSES['text-sm'] + ' ' + KT_CLASSES['text-muted-foreground'];
      button.setAttribute('aria-pressed', String(active));
    });
    const activeChips = [];
    if (search.q) activeChips.push({ key: 'q', value: search.q, label: `“${search.q}”` });
    ['categoria', 'plataforma', 'preco'].forEach(key => {
      if (key === 'categoria' && main.dataset.catalog) return;
      (search[key] || '').split(',').filter(Boolean).forEach(value => {
        const allowed = key === 'categoria' ? KT_FILTERS.CATEGORIES : key === 'plataforma' ? KT_FILTERS.PLATFORMS : KT_FILTERS.RANGES.map(r => r.value);
        if (!allowed.includes(value)) return;
        activeChips.push({ key, value, label: key === 'preco' ? KT_FILTERS.RANGES.find(r => r.value === value).label : value });
      });
    });
    if (chips) {
      chips.replaceChildren();
      activeChips.forEach(chip => {
        const button = document.createElement('button');
        button.className = 'filter-chip'; button.textContent = chip.label + ' ×';
        button.setAttribute('aria-label', 'Remover filtro ' + chip.label);
        button.addEventListener('click', () => chip.key === 'q' ? update({ q: '' }) : toggle(chip.key, chip.value));
        chips.append(button);
      });
      if (activeChips.length) {
        const button = document.createElement('button'); button.textContent = 'Limpar todos os filtros';
        button.className = 'filter-clear'; button.addEventListener('click', clear); chips.append(button);
      }
    }
    const title = document.querySelector('[data-catalog-title]');
    if (title) {
      if (search.q) title.textContent = `Busca por “${search.q}”`;
      else title.innerHTML = 'Catálogo <span class="' + KT_CLASSES['text-gradient-brand'] + '">completo</span>';
    }
    document.querySelectorAll('form[role="search"] input').forEach(input => { input.value = search.q || ''; });
  };
  document.addEventListener('change', event => {
    if (event.target.matches('[data-filter]')) toggle(event.target.dataset.filter, event.target.value);
    if (event.target.matches('[data-sort]')) update({ ordem: event.target.value === 'relevancia' ? '' : event.target.value });
  });
  document.addEventListener('click', event => {
    const category = event.target.closest('[data-category]');
    if (category) update({ categoria: category.dataset.category });
    if (event.target.closest('[data-clear-filters]')) clear();
  });
  window.addEventListener('popstate', render);
  render();
})();
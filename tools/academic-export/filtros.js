/* Funções puras para pesquisa, filtros e ordenação. */
(function () {
  'use strict';
  const CATEGORIES = ['Consoles', 'Jogos', 'Periféricos'];
  const PLATFORMS = ['PlayStation', 'Xbox', 'Nintendo'];
  const RANGES = [
    { value: '0-200', label: 'Até R$ 200', min: 0, max: 200 },
    { value: '200-500', label: 'R$ 200 a R$ 500', min: 200, max: 500 },
    { value: '500-1000', label: 'R$ 500 a R$ 1.000', min: 500, max: 1000 },
    { value: '1000-99999', label: 'Acima de R$ 1.000', min: 1000, max: 99999 },
  ];
  const RELEVANCE = [5, 1, 4, 19, 17, 10, 36, 3, 7, 22, 24, 2, 8, 18, 35, 34, 33, 16];
  const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const list = (value, allowed) => (value || '').split(',').filter(v => allowed.includes(v));
  const filter = (products, search, fixedCategory = '') => {
    const q = normalize((search.q || '').trim());
    const categories = fixedCategory ? [fixedCategory] : list(search.categoria, CATEGORIES);
    const platforms = list(search.plataforma, PLATFORMS);
    const ranges = RANGES.filter(range => list(search.preco, RANGES.map(r => r.value)).includes(range.value));
    const result = products.filter(product =>
      (!q || normalize(`${product.name} ${product.category} ${product.platforms.join(' ')} ${product.tag}`).includes(q)) &&
      (!categories.length || categories.includes(product.category)) &&
      (!platforms.length || product.platforms.some(p => platforms.includes(p))) &&
      (!ranges.length || ranges.some(r => product.price >= r.min && product.price < r.max)));
    const rank = id => RELEVANCE.includes(id) ? RELEVANCE.indexOf(id) : 100 + id;
    return result.sort((a, b) => search.ordem === 'menor-preco' ? a.price - b.price
      : search.ordem === 'maior-preco' ? b.price - a.price
      : search.ordem === 'nome' ? a.name.localeCompare(b.name, 'pt-BR') : rank(a.id) - rank(b.id));
  };
  window.KT_FILTERS = { CATEGORIES, PLATFORMS, RANGES, normalize, list, filter };
})();
/*
 * KaTchau — dados estáticos do catálogo (sem backend).
 * Catálogo demonstrativo: preços ilustrativos, nenhuma venda é realizada.
 */

/* ------------------------------------------------------------------
 * Imagens
 * As imagens originais ficam hospedadas no site publicado da KaTchau.
 * Para usar cópias locais (funciona offline), rode uma vez:
 *     node scripts/baixar-imagens.cjs
 * O script baixa tudo para assets/images/ e liga USAR_IMAGENS_LOCAIS.
 * ------------------------------------------------------------------ */
const USAR_IMAGENS_LOCAIS = false;
const IMAGENS_URL_REMOTA = "https://katchau-games.lovable.app/__l5e/assets-v1/";
const IMAGENS_PASTA_LOCAL = "assets/images/";

const IMAGENS = {
  "capa-consoles.webp": "727c95b7-02de-4df0-a048-016c533f9894",
  "capa-inicial.webp": "3d77a544-7517-4ed6-a6e0-433004595c8f",
  "capa-jogos.webp": "eeb70cc1-6826-4c2c-87cb-e4114f62006e",
  "capa-perifericos.webp": "4df95a37-7022-4dc9-83a0-4c4940de7553",
  "jogo-01.webp": "6009bda6-f5d7-4e2f-9055-cf4641c742d7",
  "jogo-02.webp": "4fe1beb5-2744-4481-aa07-200fbc1fa120",
  "jogo-03.webp": "d6682567-9d8f-4428-93bc-ea984a5ce1a6",
  "jogo-04.webp": "f11aa4eb-b4ba-4cf9-b327-a5f8bc2a2a2e",
  "jogo-05.webp": "24a6ad92-db29-439d-a304-b7f8480c24b8",
  "jogo-06.webp": "b26427de-dbc0-48bd-aec2-69208e84a869",
  "jogo-07.webp": "9b07b93b-435b-404c-bc08-cd3a4e8c2ab8",
  "jogo-08.webp": "586928d9-9ca3-4534-9cf9-91500503994a",
  "jogo-09.webp": "5a733026-a361-46ba-a88c-e80db5fd7939",
  "jogo-10.webp": "3f0b4eee-9c1d-43a7-ae1e-30f4ce9a746a",
  "jogo-11.webp": "931b7a0a-21aa-4638-b9c2-b0e19ebf880e",
  "jogo-12.webp": "81e86357-9a3a-4bb2-8def-c17a75c6e5f4",
  "jogo-13.webp": "fae28392-09d9-48ec-9b89-e8f3bed8b80a",
  "jogo-14.webp": "65030ce2-ac34-4c34-96a6-7d656a031106",
  "jogo-15.webp": "0802ed32-7967-45dc-b979-b7bf1f1c6bc7",
  "katchau-logo.webp": "59e7cf13-c0ad-4312-a50a-1100fb234449",
  "mouse-redragon-naga.webp": "a5d2349c-50dd-4dc5-bd7e-77715a6c7cd4",
  "mouse-redragon-viper-fly.webp": "c9a30c16-9a38-40ed-aca4-e2cdaac15f93",
  "periferico-01.webp": "b302c612-7304-4e2b-a0c7-0e150c27d625",
  "periferico-02.webp": "9e7748e2-4a38-4a74-a328-731b2a47c0ca",
  "periferico-03.webp": "7d10aafb-87b2-4cf9-b4e9-2d5a41612d1f",
  "periferico-04.webp": "6d974942-2fad-430d-b061-6647125bda9c",
  "periferico-05.webp": "799f6c50-fe01-49b3-a790-52c5ec250e42",
  "periferico-07.webp": "d9fd4cbe-9bc6-449e-8d7e-7fc99f8a24c9",
  "periferico-08.webp": "0a2092bf-75d7-4c7d-865d-325b7820e181",
  "periferico-11.webp": "18764078-fde1-4ef7-b6e3-3e51405a41a8",
  "pokemon-scarlet.webp": "f55e6fde-923c-4cbd-92f9-fa0fbee06a71",
  "ps4.webp": "8fcf6176-3ba4-4283-9a7f-3903644c7f08",
  "ps5.webp": "5a8dc892-1090-41af-b0cb-70d37a2677d3",
  "super-mario-odyssey.webp": "0c264843-6d00-49c5-8fca-acc6b45e052f",
  "switch-2.webp": "c2ec691b-185c-42d2-83db-57dd9a69aa4f",
  "switch-oled.webp": "801c2526-4303-496b-ac41-61e0318a4bd2",
  "teclado-corsair-clipper.webp": "0078b193-e9ea-441f-8ada-ac6b292dcc6c",
  "teclado-redragon-nephrite-pro.webp": "0af2e8ff-eb0d-4bcb-9508-5839b092b809",
  "xbox-series-s.webp": "e34b0438-b93e-4d94-9738-90c7dfcbdbb2",
  "xbox-series-x.webp": "5fd32777-38c9-4932-af90-2b4214d7c1f3",
  "zelda-breath-of-the-wild.webp": "9628c922-f7f8-4623-8dc0-a7da7215d8e3",
};

function imagem(arquivo) {
  if (USAR_IMAGENS_LOCAIS) return IMAGENS_PASTA_LOCAL + arquivo;
  return IMAGENS_URL_REMOTA + IMAGENS[arquivo] + "/" + arquivo;
}

/* ------------------------------------------------------------------
 * Produtos
 * ------------------------------------------------------------------ */
const CATEGORIAS = ["Consoles", "Jogos", "Periféricos"];
const PLATAFORMAS = ["PlayStation", "Xbox", "Nintendo"];

const PRODUTOS = [
  { id: 1, slug: "playstation-5-slim", name: "PlayStation 5 Slim", category: "Consoles", platforms: ["PlayStation"], price: 3299.9, oldPrice: 3699.9, tag: "Destaque", image: "ps5.webp", kind: "hardware" },
  { id: 2, slug: "playstation-4", name: "PlayStation 4", category: "Consoles", platforms: ["PlayStation"], price: 1599.9, oldPrice: 1899.9, tag: "Clássico", image: "ps4.webp", kind: "hardware" },
  { id: 3, slug: "xbox-series-s", name: "Xbox Series S", category: "Consoles", platforms: ["Xbox"], price: 2399.9, oldPrice: 2699.9, tag: "Compacto", image: "xbox-series-s.webp", kind: "hardware" },
  { id: 4, slug: "xbox-series-x", name: "Xbox Series X", category: "Consoles", platforms: ["Xbox"], price: 3899.9, oldPrice: 4299.9, tag: "Potência", image: "xbox-series-x.webp", kind: "hardware" },
  { id: 5, slug: "nintendo-switch-2", name: "Nintendo Switch 2", category: "Consoles", platforms: ["Nintendo"], price: 3499.9, oldPrice: 3799.9, tag: "Lançamento", image: "switch-2.webp", kind: "hardware" },
  { id: 36, slug: "nintendo-switch-oled", name: "Nintendo Switch OLED", category: "Consoles", platforms: ["Nintendo"], price: 2299.9, oldPrice: 2599.9, tag: "OLED", image: "switch-oled.webp", kind: "hardware" },
  { id: 6, slug: "subnautica", name: "Subnautica", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 99.9, oldPrice: 129.9, tag: "Exploração", image: "jogo-01.webp", kind: "game" },
  { id: 7, slug: "hollow-knight-silksong", name: "Hollow Knight: Silksong", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 119.9, oldPrice: 149.9, tag: "Destaque", image: "jogo-02.webp", kind: "game" },
  { id: 8, slug: "cyberpunk-2077", name: "Cyberpunk 2077", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 149.9, oldPrice: 199.9, tag: "RPG", image: "jogo-03.webp", kind: "game" },
  { id: 9, slug: "red-dead-redemption", name: "Red Dead Redemption", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 179.9, oldPrice: 229.9, tag: "Clássico", image: "jogo-04.webp", kind: "game" },
  { id: 10, slug: "marvels-spider-man-2", name: "Marvel’s Spider-Man 2", category: "Jogos", platforms: ["PlayStation"], price: 249.9, oldPrice: 299.9, tag: "Destaque", image: "jogo-05.webp", kind: "game" },
  { id: 11, slug: "mortal-kombat-11", name: "Mortal Kombat 11", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 79.9, oldPrice: 119.9, tag: "Luta", image: "jogo-06.webp", kind: "game" },
  { id: 12, slug: "batman-arkham-collection", name: "Batman: Arkham Collection", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 89.9, oldPrice: 129.9, tag: "Coleção", image: "jogo-07.webp", kind: "game" },
  { id: 13, slug: "minecraft", name: "Minecraft", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 99.9, oldPrice: 129.9, tag: "Criatividade", image: "jogo-08.webp", kind: "game" },
  { id: 14, slug: "hollow-knight", name: "Hollow Knight", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 49.9, oldPrice: 69.9, tag: "Indie", image: "jogo-09.webp", kind: "game" },
  { id: 15, slug: "the-elder-scrolls-v-skyrim", name: "The Elder Scrolls V: Skyrim", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 89.9, oldPrice: 129.9, tag: "RPG", image: "jogo-10.webp", kind: "game" },
  { id: 16, slug: "call-of-duty-modern-warfare-ii", name: "Call of Duty: Modern Warfare II", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 179.9, oldPrice: 229.9, tag: "FPS", image: "jogo-11.webp", kind: "game" },
  { id: 17, slug: "forza-horizon-6", name: "Forza Horizon 6", category: "Jogos", platforms: ["Xbox"], price: 249.9, oldPrice: 299.9, tag: "Corrida", image: "jogo-12.webp", kind: "game" },
  { id: 18, slug: "ea-sports-fc-26", name: "EA SPORTS FC 26", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 299.9, oldPrice: 349.9, tag: "Esporte", image: "jogo-13.webp", kind: "game" },
  { id: 19, slug: "grand-theft-auto-vi", name: "Grand Theft Auto VI", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 349.9, oldPrice: 399.9, tag: "Destaque", image: "jogo-14.webp", kind: "game" },
  { id: 20, slug: "no-mans-sky", name: "No Man’s Sky", category: "Jogos", platforms: ["PlayStation", "Xbox"], price: 119.9, oldPrice: 159.9, tag: "Exploração", image: "jogo-15.webp", kind: "game" },
  { id: 21, slug: "controle-nintendo-switch-2", name: "Controle Nintendo Switch 2", category: "Periféricos", platforms: ["Nintendo"], price: 499.9, oldPrice: 549.9, tag: "Nintendo", image: "periferico-01.webp", kind: "hardware" },
  { id: 22, slug: "controle-dualsense", name: "Controle DualSense", category: "Periféricos", platforms: ["PlayStation"], price: 449.9, oldPrice: 499.9, tag: "PlayStation", image: "periferico-02.webp", kind: "hardware" },
  { id: 23, slug: "headset-sony", name: "Headset Sony", category: "Periféricos", platforms: ["PlayStation"], price: 599.9, oldPrice: 699.9, tag: "Áudio", image: "periferico-03.webp", kind: "hardware" },
  { id: 24, slug: "controle-xbox-wireless", name: "Controle Xbox Wireless", category: "Periféricos", platforms: ["Xbox"], price: 399.9, oldPrice: 449.9, tag: "Xbox", image: "periferico-04.webp", kind: "hardware" },
  { id: 25, slug: "headset-xbox", name: "Headset Xbox", category: "Periféricos", platforms: ["Xbox"], price: 649.9, oldPrice: 749.9, tag: "Áudio", image: "periferico-05.webp", kind: "hardware" },
  { id: 27, slug: "headphone-jbl-live-780nc", name: "Headphone JBL Live 780NC", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 699.9, oldPrice: 799.9, tag: "Áudio", image: "periferico-07.webp", kind: "hardware" },
  { id: 28, slug: "fone-kz-castor", name: "Fone KZ Castor", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 149.9, oldPrice: 189.9, tag: "Áudio", image: "periferico-08.webp", kind: "hardware" },
  { id: 31, slug: "fone-qcy-n30-anc", name: "Fone QCY N30 ANC", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 249.9, oldPrice: 299.9, tag: "Áudio", image: "periferico-11.webp", kind: "hardware" },
  { id: 26, slug: "mouse-gamer-redragon-naga", name: "Mouse Gamer Redragon Naga RGB 32000 DPI", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 229.9, oldPrice: 279.9, tag: "Mouse", image: "mouse-redragon-naga.webp", kind: "hardware" },
  { id: 29, slug: "mouse-gamer-redragon-viper-fly", name: "Mouse Gamer Redragon Viper Fly RGB 26000 DPI", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 189.9, oldPrice: 239.9, tag: "Mouse", image: "mouse-redragon-viper-fly.webp", kind: "hardware" },
  { id: 30, slug: "teclado-magnetico-redragon-nephrite-pro", name: "Teclado Magnético Redragon Nephrite Pro", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 549.9, oldPrice: 649.9, tag: "Teclado", image: "teclado-redragon-nephrite-pro.webp", kind: "hardware" },
  { id: 32, slug: "teclado-mecanico-corsair-clipper", name: "Teclado Mecânico Corsair Clipper", category: "Periféricos", platforms: ["PlayStation", "Xbox"], price: 479.9, oldPrice: 569.9, tag: "Teclado", image: "teclado-corsair-clipper.webp", kind: "hardware" },
  { id: 33, slug: "pokemon-scarlet", name: "Pokémon Scarlet", category: "Jogos", platforms: ["Nintendo"], price: 249.9, oldPrice: 299.9, tag: "Nintendo", image: "pokemon-scarlet.webp", kind: "game" },
  { id: 34, slug: "super-mario-odyssey", name: "Super Mario Odyssey", category: "Jogos", platforms: ["Nintendo"], price: 229.9, oldPrice: 279.9, tag: "Nintendo", image: "super-mario-odyssey.webp", kind: "game" },
  { id: 35, slug: "the-legend-of-zelda-breath-of-the-wild", name: "The Legend of Zelda: Breath of the Wild", category: "Jogos", platforms: ["Nintendo"], price: 249.9, oldPrice: 299.9, tag: "Nintendo", image: "zelda-breath-of-the-wild.webp", kind: "game" },
];

/* ------------------------------------------------------------------
 * Catálogo do banco de dados
 * Com a API ativa, js/catalogo-servidor.js guarda uma cópia do catálogo do banco neste
 * navegador. Se ela existir, é válida e tem menos de 7 dias, substitui a lista acima;
 * caso contrário (arquivo local, sem API, cópia antiga ou suspeita) vale o catálogo estático.
 * ------------------------------------------------------------------ */
(function () {
  try {
    const copia = JSON.parse(window.localStorage.getItem("katchau-catalogo-v1") || "null");
    if (!copia || !Array.isArray(copia.produtos) || !copia.produtos.length) return;
    if (!(Date.now() - copia.em < 7 * 24 * 60 * 60 * 1000)) return;
    const valido = copia.produtos.every(function (p) {
      return p && Number.isInteger(p.id) && typeof p.slug === "string" && typeof p.name === "string" &&
        CATEGORIAS.indexOf(p.category) !== -1 && Array.isArray(p.platforms) &&
        p.platforms.every(function (x) { return PLATAFORMAS.indexOf(x) !== -1; }) &&
        Number.isFinite(p.price) && Number.isFinite(p.oldPrice) && typeof p.image === "string" &&
        Object.prototype.hasOwnProperty.call(IMAGENS, p.image) && typeof p.kind === "string" && typeof p.tag === "string";
    });
    if (valido) PRODUTOS.splice.apply(PRODUTOS, [0, PRODUTOS.length].concat(copia.produtos));
  } catch (e) {
    /* sem armazenamento ou cópia ilegível: mantém o catálogo estático */
  }
})();

const IDS_DESTAQUE = [5, 1, 4, 19, 17, 10, 22, 24];
const IDS_JOGOS_EM_DESTAQUE = [19, 17, 7, 10, 18, 35, 34, 8];
const IDS_RELEVANCIA = [5, 1, 4, 19, 17, 10, 36, 3, 7, 22, 24, 2, 8, 18, 35, 34, 33, 16];

const EMAIL_CONTATO = "joao.p.nunes.200707@uni9.edu.br";

function obterProduto(id) {
  return PRODUTOS.find(function (p) { return p.id === id; });
}

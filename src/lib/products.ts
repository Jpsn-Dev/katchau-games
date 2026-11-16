// Catálogo demonstrativo da KaTchau. Preços ilustrativos.
import img_ps5 from "@/assets/products/ps5.webp.asset.json";
import img_ps4 from "@/assets/products/ps4.webp.asset.json";
import img_xbox_series_s from "@/assets/products/xbox-series-s.webp.asset.json";
import img_xbox_series_x from "@/assets/products/xbox-series-x.webp.asset.json";
import img_switch_2 from "@/assets/products/switch-2.webp.asset.json";
import img_switch_oled from "@/assets/products/switch-oled.webp.asset.json";
import img_jogo_01 from "@/assets/products/jogo-01.webp.asset.json";
import img_jogo_02 from "@/assets/products/jogo-02.webp.asset.json";
import img_jogo_03 from "@/assets/products/jogo-03.webp.asset.json";
import img_jogo_04 from "@/assets/products/jogo-04.webp.asset.json";
import img_jogo_05 from "@/assets/products/jogo-05.webp.asset.json";
import img_jogo_06 from "@/assets/products/jogo-06.webp.asset.json";
import img_jogo_07 from "@/assets/products/jogo-07.webp.asset.json";
import img_jogo_08 from "@/assets/products/jogo-08.webp.asset.json";
import img_jogo_09 from "@/assets/products/jogo-09.webp.asset.json";
import img_jogo_10 from "@/assets/products/jogo-10.webp.asset.json";
import img_jogo_11 from "@/assets/products/jogo-11.webp.asset.json";
import img_jogo_12 from "@/assets/products/jogo-12.webp.asset.json";
import img_jogo_13 from "@/assets/products/jogo-13.webp.asset.json";
import img_jogo_14 from "@/assets/products/jogo-14.webp.asset.json";
import img_jogo_15 from "@/assets/products/jogo-15.webp.asset.json";
import img_periferico_01 from "@/assets/products/periferico-01.webp.asset.json";
import img_periferico_02 from "@/assets/products/periferico-02.webp.asset.json";
import img_periferico_03 from "@/assets/products/periferico-03.webp.asset.json";
import img_periferico_04 from "@/assets/products/periferico-04.webp.asset.json";
import img_periferico_05 from "@/assets/products/periferico-05.webp.asset.json";
import img_periferico_07 from "@/assets/products/periferico-07.webp.asset.json";
import img_periferico_08 from "@/assets/products/periferico-08.webp.asset.json";
import img_periferico_11 from "@/assets/products/periferico-11.webp.asset.json";
import img_pokemon_scarlet from "@/assets/products/pokemon-scarlet.webp.asset.json";
import img_super_mario_odyssey from "@/assets/products/super-mario-odyssey.webp.asset.json";
import img_zelda_breath_of_the_wild from "@/assets/products/zelda-breath-of-the-wild.webp.asset.json";
import img_mouse_naga from "@/assets/products/mouse-redragon-naga.webp.asset.json";
import img_mouse_viper from "@/assets/products/mouse-redragon-viper-fly.webp.asset.json";
import img_teclado_nephrite from "@/assets/products/teclado-redragon-nephrite-pro.webp.asset.json";
import img_teclado_clipper from "@/assets/products/teclado-corsair-clipper.webp.asset.json";

export type Category = "Consoles" | "Jogos" | "Periféricos";
export type Platform = "PlayStation" | "Xbox" | "Nintendo";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: Category;
  platforms: Platform[];
  price: number;
  oldPrice: number;
  tag: string;
  image: string;
  kind: "game" | "hardware";
};

export const CATEGORIES: Category[] = ["Consoles", "Jogos", "Periféricos"];
export const PLATFORMS: Platform[] = ["PlayStation", "Xbox", "Nintendo"];

export const products: Product[] = [
  {
    id: 1,
    slug: "playstation-5-slim",
    name: "PlayStation 5 Slim",
    category: "Consoles",
    platforms: ["PlayStation"],
    price: 3299.9,
    oldPrice: 3699.9,
    tag: "Destaque",
    image: img_ps5.url,
    kind: "hardware",
  },
  {
    id: 2,
    slug: "playstation-4",
    name: "PlayStation 4",
    category: "Consoles",
    platforms: ["PlayStation"],
    price: 1599.9,
    oldPrice: 1899.9,
    tag: "Clássico",
    image: img_ps4.url,
    kind: "hardware",
  },
  {
    id: 3,
    slug: "xbox-series-s",
    name: "Xbox Series S",
    category: "Consoles",
    platforms: ["Xbox"],
    price: 2399.9,
    oldPrice: 2699.9,
    tag: "Compacto",
    image: img_xbox_series_s.url,
    kind: "hardware",
  },
  {
    id: 4,
    slug: "xbox-series-x",
    name: "Xbox Series X",
    category: "Consoles",
    platforms: ["Xbox"],
    price: 3899.9,
    oldPrice: 4299.9,
    tag: "Potência",
    image: img_xbox_series_x.url,
    kind: "hardware",
  },
  {
    id: 5,
    slug: "nintendo-switch-2",
    name: "Nintendo Switch 2",
    category: "Consoles",
    platforms: ["Nintendo"],
    price: 3499.9,
    oldPrice: 3799.9,
    tag: "Lançamento",
    image: img_switch_2.url,
    kind: "hardware",
  },
  {
    id: 36,
    slug: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    category: "Consoles",
    platforms: ["Nintendo"],
    price: 2299.9,
    oldPrice: 2599.9,
    tag: "OLED",
    image: img_switch_oled.url,
    kind: "hardware",
  },
  {
    id: 6,
    slug: "subnautica",
    name: "Subnautica",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 99.9,
    oldPrice: 129.9,
    tag: "Exploração",
    image: img_jogo_01.url,
    kind: "game",
  },
  {
    id: 7,
    slug: "hollow-knight-silksong",
    name: "Hollow Knight: Silksong",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 119.9,
    oldPrice: 149.9,
    tag: "Destaque",
    image: img_jogo_02.url,
    kind: "game",
  },
  {
    id: 8,
    slug: "cyberpunk-2077",
    name: "Cyberpunk 2077",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 149.9,
    oldPrice: 199.9,
    tag: "RPG",
    image: img_jogo_03.url,
    kind: "game",
  },
  {
    id: 9,
    slug: "red-dead-redemption",
    name: "Red Dead Redemption",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 179.9,
    oldPrice: 229.9,
    tag: "Clássico",
    image: img_jogo_04.url,
    kind: "game",
  },
  {
    id: 10,
    slug: "marvels-spider-man-2",
    name: "Marvel’s Spider-Man 2",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 249.9,
    oldPrice: 299.9,
    tag: "Destaque",
    image: img_jogo_05.url,
    kind: "game",
  },
  {
    id: 11,
    slug: "mortal-kombat-11",
    name: "Mortal Kombat 11",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 79.9,
    oldPrice: 119.9,
    tag: "Luta",
    image: img_jogo_06.url,
    kind: "game",
  },
  {
    id: 12,
    slug: "batman-arkham-collection",
    name: "Batman: Arkham Collection",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 89.9,
    oldPrice: 129.9,
    tag: "Coleção",
    image: img_jogo_07.url,
    kind: "game",
  },
  {
    id: 13,
    slug: "minecraft",
    name: "Minecraft",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 99.9,
    oldPrice: 129.9,
    tag: "Criatividade",
    image: img_jogo_08.url,
    kind: "game",
  },
  {
    id: 14,
    slug: "hollow-knight",
    name: "Hollow Knight",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 49.9,
    oldPrice: 69.9,
    tag: "Indie",
    image: img_jogo_09.url,
    kind: "game",
  },
  {
    id: 15,
    slug: "the-elder-scrolls-v-skyrim",
    name: "The Elder Scrolls V: Skyrim",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 89.9,
    oldPrice: 129.9,
    tag: "RPG",
    image: img_jogo_10.url,
    kind: "game",
  },
  {
    id: 16,
    slug: "call-of-duty-modern-warfare-ii",
    name: "Call of Duty: Modern Warfare II",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 179.9,
    oldPrice: 229.9,
    tag: "FPS",
    image: img_jogo_11.url,
    kind: "game",
  },
  {
    id: 17,
    slug: "forza-horizon-6",
    name: "Forza Horizon 6",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 249.9,
    oldPrice: 299.9,
    tag: "Corrida",
    image: img_jogo_12.url,
    kind: "game",
  },
  {
    id: 18,
    slug: "ea-sports-fc-26",
    name: "EA SPORTS FC 26",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 299.9,
    oldPrice: 349.9,
    tag: "Esporte",
    image: img_jogo_13.url,
    kind: "game",
  },
  {
    id: 19,
    slug: "grand-theft-auto-vi",
    name: "Grand Theft Auto VI",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 349.9,
    oldPrice: 399.9,
    tag: "Em Destaque",
    image: img_jogo_14.url,
    kind: "game",
  },
  {
    id: 20,
    slug: "no-mans-sky",
    name: "No Man’s Sky",
    category: "Jogos",
    platforms: ["PlayStation", "Xbox"],
    price: 119.9,
    oldPrice: 159.9,
    tag: "Exploração",
    image: img_jogo_15.url,
    kind: "game",
  },
  {
    id: 21,
    slug: "controle-nintendo-switch-2",
    name: "Controle Nintendo Switch 2",
    category: "Periféricos",
    platforms: ["Nintendo"],
    price: 499.9,
    oldPrice: 549.9,
    tag: "Nintendo",
    image: img_periferico_01.url,
    kind: "hardware",
  },
  {
    id: 22,
    slug: "controle-dualsense",
    name: "Controle DualSense",
    category: "Periféricos",
    platforms: ["PlayStation"],
    price: 449.9,
    oldPrice: 499.9,
    tag: "Playstation",
    image: img_periferico_02.url,
    kind: "hardware",
  },
  {
    id: 23,
    slug: "headset-sony",
    name: "Headset Sony",
    category: "Periféricos",
    platforms: ["PlayStation"],
    price: 599.9,
    oldPrice: 699.9,
    tag: "Áudio",
    image: img_periferico_03.url,
    kind: "hardware",
  },
  {
    id: 24,
    slug: "controle-xbox-wireless",
    name: "Controle Xbox Wireless",
    category: "Periféricos",
    platforms: ["Xbox"],
    price: 399.9,
    oldPrice: 449.9,
    tag: "Xbox",
    image: img_periferico_04.url,
    kind: "hardware",
  },
  {
    id: 25,
    slug: "headset-xbox",
    name: "Headset Xbox",
    category: "Periféricos",
    platforms: ["Xbox"],
    price: 649.9,
    oldPrice: 749.9,
    tag: "Áudio",
    image: img_periferico_05.url,
    kind: "hardware",
  },
  {
    id: 27,
    slug: "headphone-jbl-live-780nc",
    name: "Headphone JBL Live 780NC",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 699.9,
    oldPrice: 799.9,
    tag: "Áudio",
    image: img_periferico_07.url,
    kind: "hardware",
  },
  {
    id: 28,
    slug: "fone-kz-castor",
    name: "Fone KZ Castor",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 149.9,
    oldPrice: 189.9,
    tag: "Áudio",
    image: img_periferico_08.url,
    kind: "hardware",
  },
  {
    id: 31,
    slug: "fone-qcy-n30-anc",
    name: "Fone QCY N30 ANC",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 249.9,
    oldPrice: 299.9,
    tag: "Áudio",
    image: img_periferico_11.url,
    kind: "hardware",
  },
  {
    id: 26,
    slug: "mouse-gamer-redragon-naga",
    name: "Mouse Gamer Redragon Naga RGB 32000 DPI",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 229.9,
    oldPrice: 279.9,
    tag: "Mouse",
    image: img_mouse_naga.url,
    kind: "hardware",
  },
  {
    id: 29,
    slug: "mouse-gamer-redragon-viper-fly",
    name: "Mouse Gamer Redragon Viper Fly RGB 26000 DPI",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 189.9,
    oldPrice: 239.9,
    tag: "Mouse",
    image: img_mouse_viper.url,
    kind: "hardware",
  },
  {
    id: 30,
    slug: "teclado-magnetico-redragon-nephrite-pro",
    name: "Teclado Magnético Redragon Nephrite Pro",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 549.9,
    oldPrice: 649.9,
    tag: "Teclado",
    image: img_teclado_nephrite.url,
    kind: "hardware",
  },
  {
    id: 32,
    slug: "teclado-mecanico-corsair-clipper",
    name: "Teclado Mecânico Corsair Clipper",
    category: "Periféricos",
    platforms: ["PlayStation", "Xbox"],
    price: 479.9,
    oldPrice: 569.9,
    tag: "Teclado",
    image: img_teclado_clipper.url,
    kind: "hardware",
  },
  {
    id: 33,
    slug: "pokemon-scarlet",
    name: "Pokémon Scarlet",
    category: "Jogos",
    platforms: ["Nintendo"],
    price: 249.9,
    oldPrice: 299.9,
    tag: "Nintendo",
    image: img_pokemon_scarlet.url,
    kind: "game",
  },
  {
    id: 34,
    slug: "super-mario-odyssey",
    name: "Super Mario Odyssey",
    category: "Jogos",
    platforms: ["Nintendo"],
    price: 229.9,
    oldPrice: 279.9,
    tag: "Nintendo",
    image: img_super_mario_odyssey.url,
    kind: "game",
  },
  {
    id: 35,
    slug: "the-legend-of-zelda-breath-of-the-wild",
    name: "The Legend of Zelda: Breath of the Wild",
    category: "Jogos",
    platforms: ["Nintendo"],
    price: 249.9,
    oldPrice: 299.9,
    tag: "Nintendo",
    image: img_zelda_breath_of_the_wild.url,
    kind: "game",
  },
];

export const getProduct = (id: number) => products.find((p) => p.id === id);

export const FEATURED_IDS = [5, 1, 4, 19, 17, 10, 22, 24];
export const SPOTLIGHT_GAME_IDS = [19, 17, 7, 10, 18, 35, 34, 8];

// Avaliações DEMONSTRATIVAS (fictícias) para o projeto acadêmico KaTchau.
import type { Category, Product } from "./products";

export type Review = { author: string; city: string; rating: number; date: string; title: string; text: string };
export type ReviewSummary = { average: number; count: number; reviews: Review[] };

const NAMES = [
  ["Marina Teles", "Recife, PE"], ["Rafael Okada", "São Paulo, SP"], ["Bianca Lourenço", "Curitiba, PR"],
  ["Diego Fontana", "Porto Alegre, RS"], ["Larissa Quintela", "Salvador, BA"], ["Thiago Brandão", "Belo Horizonte, MG"],
  ["Camila Werneck", "Niterói, RJ"], ["Henrique Paiva", "Goiânia, GO"], ["Aline Mororó", "Fortaleza, CE"],
  ["Gustavo Reis", "Campinas, SP"], ["Patrícia Nogueira", "Florianópolis, SC"], ["Vinícius Amaral", "Manaus, AM"],
  ["Júlia Cardoso", "Santos, SP"], ["Otávio Lemos", "Vitória, ES"], ["Renata Siqueira", "Natal, RN"],
  ["Lucas Ferraz", "Londrina, PR"], ["Fernanda Dutra", "Brasília, DF"], ["Igor Matsumoto", "Ribeirão Preto, SP"],
  ["Sofia Albuquerque", "João Pessoa, PB"], ["Bruno Cavalcanti", "Maceió, AL"],
] as const;

type Pool = Record<number, { title: string; text: string }[]>;

const POOLS: Record<Category, Pool> = {
  Consoles: {
    5: [
      { title: "Valeu cada centavo", text: "Liguei, atualizou em poucos minutos e já estava jogando. Silencioso mesmo em jogo pesado." },
      { title: "Carregamentos absurdos", text: "Saí de um console antigo e a diferença no tempo de loading é o que mais me impressionou." },
      { title: "Presente certeiro", text: "Comprei para meu filho e acabei jogando mais do que ele. A interface é bem simples de usar." },
      { title: "Bonito na estante", text: "Ocupa menos espaço do que eu imaginava e combina com a sala. Controle muito confortável." },
    ],
    4: [
      { title: "Muito bom, com ressalvas", text: "Desempenho excelente. Só achei que o armazenamento enche rápido com jogos grandes." },
      { title: "Recomendo", text: "Roda tudo liso. Tirei uma estrela porque a caixa chegou meio amassada, mas o aparelho estava perfeito." },
      { title: "Ótimo custo-benefício", text: "Para o que eu jogo atende muito bem. Quero comprar um segundo controle em breve." },
    ],
    3: [
      { title: "Cumpre o papel", text: "Funciona bem, mas esquenta um pouco em sessões longas. Deixei num lugar mais ventilado e melhorou." },
    ],
  },
  Jogos: {
    5: [
      { title: "Joguei de uma vez só", text: "A história me prendeu do começo ao fim. Terminei em um fim de semana e já comecei de novo." },
      { title: "Trilha sonora linda", text: "Além da jogabilidade, a música e os cenários são de outro nível. Um dos melhores que já joguei." },
      { title: "Diversão garantida", text: "Joguei com meu irmão e rendeu muitas risadas. Tem conteúdo para muitas horas." },
      { title: "Obra-prima", text: "Cada detalhe parece pensado com carinho. Vale muito pelo preço que está agora." },
    ],
    4: [
      { title: "Muito bom", text: "Gráficos bonitos e controles precisos. Algumas missões secundárias ficam repetitivas, mas nada grave." },
      { title: "Curti bastante", text: "Começo um pouco lento, mas depois das primeiras horas fica viciante." },
      { title: "Boa compra", text: "Legendas em português bem feitas. Só queria que o modo online tivesse mais gente jogando." },
    ],
    3: [
      { title: "Esperava mais", text: "É divertido, mas achei a campanha curta. Talvez valha mais em uma promoção ainda maior." },
    ],
  },
  "Periféricos": {
    5: [
      { title: "Conforto total", text: "Uso por horas e não cansa a mão. O acabamento parece bem mais caro do que é." },
      { title: "Melhor upgrade do setup", text: "Precisão impressionante. Fez diferença real nas partidas competitivas." },
      { title: "Chegou rápido e bem embalado", text: "Funcionou na primeira conexão, sem precisar instalar nada. Muito satisfeito." },
      { title: "Bateria dura muito", text: "Passo a semana inteira sem recarregar. A iluminação é discreta e bonita." },
    ],
    4: [
      { title: "Gostei", text: "Qualidade boa e construção firme. O cabo poderia ser um pouco mais longo." },
      { title: "Bom produto", text: "Responde muito bem. Levei uns dias para me acostumar com o tamanho, depois ficou ótimo." },
      { title: "Recomendo com uma ressalva", text: "Som e resposta excelentes, mas o software de configuração é meio confuso." },
    ],
    3: [
      { title: "Razoável", text: "Faz o que promete, porém senti falta de mais opções de ajuste para o meu jeito de jogar." },
    ],
  },
};

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out"];

function seeded(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getReviews(product: Product): ReviewSummary {
  const rand = seeded(product.id * 7 + 3);
  const pool = POOLS[product.category];
  const shown = 3 + Math.floor(rand() * 3); // 3 a 5 comentários
  const reviews: Review[] = [];
  const used = new Set<string>();
  for (let i = 0; i < shown; i++) {
    const r = rand();
    const rating = r < 0.55 ? 5 : r < 0.88 ? 4 : 3;
    const list = pool[rating] ?? [];
    let entry = list[Math.floor(rand() * list.length)]!;
    for (let k = 0; k < list.length && used.has(entry.title); k++) entry = list[(list.indexOf(entry) + 1) % list.length]!;
    used.add(entry.title);
    const [author, city] = NAMES[(product.id * 3 + i * 7) % NAMES.length]!;
    reviews.push({ author, city, rating, title: entry.title, text: entry.text, date: `${1 + Math.floor(rand() * 27)} ${MONTHS[Math.floor(rand() * MONTHS.length)]} 2026` });
  }
  const count = 18 + Math.floor(rand() * 260);
  const avg = 4 + rand() * 0.9;
  return { average: Math.round(avg * 10) / 10, count, reviews };
}

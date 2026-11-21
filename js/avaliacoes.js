/*
 * KaTchau — avaliações DEMONSTRATIVAS (fictícias) para o projeto acadêmico.
 * Geração determinística (mesma semente por produto): cada produto exibe
 * sempre as mesmas notas, quantidades e comentários.
 */

const NOMES_AVALIADORES = [
  ["Marina Teles", "Recife, PE"], ["Rafael Okada", "São Paulo, SP"], ["Bianca Lourenço", "Curitiba, PR"],
  ["Diego Fontana", "Porto Alegre, RS"], ["Larissa Quintela", "Salvador, BA"], ["Thiago Brandão", "Belo Horizonte, MG"],
  ["Camila Werneck", "Niterói, RJ"], ["Henrique Paiva", "Goiânia, GO"], ["Aline Mororó", "Fortaleza, CE"],
  ["Gustavo Reis", "Campinas, SP"], ["Patrícia Nogueira", "Florianópolis, SC"], ["Vinícius Amaral", "Manaus, AM"],
  ["Júlia Cardoso", "Santos, SP"], ["Otávio Lemos", "Vitória, ES"], ["Renata Siqueira", "Natal, RN"],
  ["Lucas Ferraz", "Londrina, PR"], ["Fernanda Dutra", "Brasília, DF"], ["Igor Matsumoto", "Ribeirão Preto, SP"],
  ["Sofia Albuquerque", "João Pessoa, PB"], ["Bruno Cavalcanti", "Maceió, AL"]
];

const COMENTARIOS = {
  "Consoles": {
    5: [
      { title: "Valeu cada centavo", text: "Liguei, atualizou em poucos minutos e já estava jogando. Silencioso mesmo em jogo pesado." },
      { title: "Carregamentos absurdos", text: "Saí de um console antigo e a diferença no tempo de loading é o que mais me impressionou." },
      { title: "Presente certeiro", text: "Comprei para meu filho e acabei jogando mais do que ele. A interface é bem simples de usar." },
      { title: "Bonito na estante", text: "Ocupa menos espaço do que eu imaginava e combina com a sala. Controle muito confortável." }
    ],
    4: [
      { title: "Muito bom, com ressalvas", text: "Desempenho excelente. Só achei que o armazenamento enche rápido com jogos grandes." },
      { title: "Recomendo", text: "Roda tudo liso. Tirei uma estrela porque a caixa chegou meio amassada, mas o aparelho estava perfeito." },
      { title: "Ótimo custo-benefício", text: "Para o que eu jogo atende muito bem. Quero comprar um segundo controle em breve." }
    ],
    3: [
      { title: "Cumpre o papel", text: "Funciona bem, mas esquenta um pouco em sessões longas. Deixei num lugar mais ventilado e melhorou." }
    ]
  },
  "Jogos": {
    5: [
      { title: "Joguei de uma vez só", text: "A história me prendeu do começo ao fim. Terminei em um fim de semana e já comecei de novo." },
      { title: "Trilha sonora linda", text: "Além da jogabilidade, a música e os cenários são de outro nível. Um dos melhores que já joguei." },
      { title: "Diversão garantida", text: "Joguei com meu irmão e rendeu muitas risadas. Tem conteúdo para muitas horas." },
      { title: "Obra-prima", text: "Cada detalhe parece pensado com carinho. Vale muito pelo preço que está agora." }
    ],
    4: [
      { title: "Muito bom", text: "Gráficos bonitos e controles precisos. Algumas missões secundárias ficam repetitivas, mas nada grave." },
      { title: "Curti bastante", text: "Começo um pouco lento, mas depois das primeiras horas fica viciante." },
      { title: "Boa compra", text: "Legendas em português bem feitas. Só queria que o modo online tivesse mais gente jogando." }
    ],
    3: [
      { title: "Esperava mais", text: "É divertido, mas achei a campanha curta. Talvez valha mais em uma promoção ainda maior." }
    ]
  },
  "Periféricos": {
    5: [
      { title: "Conforto total", text: "Uso por horas e não cansa a mão. O acabamento parece bem mais caro do que é." },
      { title: "Melhor upgrade do setup", text: "Precisão impressionante. Fez diferença real nas partidas competitivas." },
      { title: "Chegou rápido e bem embalado", text: "Funcionou na primeira conexão, sem precisar instalar nada. Muito satisfeito." },
      { title: "Bateria dura muito", text: "Passo a semana inteira sem recarregar. A iluminação é discreta e bonita." }
    ],
    4: [
      { title: "Gostei", text: "Qualidade boa e construção firme. O cabo poderia ser um pouco mais longo." },
      { title: "Bom produto", text: "Responde muito bem. Levei uns dias para me acostumar com o tamanho, depois ficou ótimo." },
      { title: "Recomendo com uma ressalva", text: "Som e resposta excelentes, mas o software de configuração é meio confuso." }
    ],
    3: [
      { title: "Razoável", text: "Faz o que promete, porém senti falta de mais opções de ajuste para o meu jeito de jogar." }
    ]
  }
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out"];

function gerador(semente) {
  let s = semente * 9301 + 49297;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function obterAvaliacoes(produto) {
  const rand = gerador(produto.id * 7 + 3);
  const pool = COMENTARIOS[produto.category];
  const exibidos = 3 + Math.floor(rand() * 3); // 3 a 5 comentários
  const avaliacoes = [];
  const usados = new Set();
  for (let i = 0; i < exibidos; i++) {
    const r = rand();
    const nota = r < 0.55 ? 5 : r < 0.88 ? 4 : 3;
    const lista = pool[nota] || [];
    let entrada = lista[Math.floor(rand() * lista.length)];
    for (let k = 0; k < lista.length && usados.has(entrada.title); k++) {
      entrada = lista[(lista.indexOf(entrada) + 1) % lista.length];
    }
    usados.add(entrada.title);
    const par = NOMES_AVALIADORES[(produto.id * 3 + i * 7) % NOMES_AVALIADORES.length];
    const dia = 1 + Math.floor(rand() * 27);
    const mes = MESES[Math.floor(rand() * MESES.length)];
    avaliacoes.push({
      author: par[0],
      city: par[1],
      rating: nota,
      title: entrada.title,
      text: entrada.text,
      date: dia + " " + mes + " 2026"
    });
  }
  const quantidade = 18 + Math.floor(rand() * 260);
  const media = 4 + rand() * 0.9;
  return { average: Math.round(media * 10) / 10, count: quantidade, reviews: avaliacoes };
}

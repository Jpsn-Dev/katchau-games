# KaTchau Games

Loja virtual fictícia de games, consoles e periféricos, desenvolvida como projeto acadêmico com **HTML5, CSS3 e JavaScript puro**. Não usa frameworks, bibliotecas, etapa de build nem backend.

## Funcionalidades

- Catálogo com 36 produtos em três departamentos: consoles, jogos e periféricos.
- Pesquisa sem distinção de acentos, filtros (categoria, plataforma e faixa de preço), ordenação e chips de filtros ativos.
- Estado dos filtros na URL, o que permite compartilhar o link de uma busca.
- Página de produto com avaliações demonstrativas.
- Carrinho salvo no navegador, com quantidades, remoção, resumo, descontos e parcelamento.
- Cadastro e login demonstrativos (`conta.html`).
- Atendimento, perguntas frequentes e página institucional.
- Layout responsivo e navegação por teclado.

## Como executar

1. Clone o repositório ou baixe o código.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` no navegador ou use a extensão **Live Server**.

As fontes vêm do Google Fonts e as imagens dos produtos são carregadas da internet. Para usar offline, execute uma vez `node scripts/baixar-imagens.js`; as imagens vão para `assets/images/`.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Início |
| `catalogo.html` | Catálogo completo e resultados de busca |
| `consoles.html`, `jogos.html`, `perifericos.html` | Departamentos |
| `produto.html?slug=...` | Detalhes do produto |
| `carrinho.html` | Carrinho |
| `conta.html` | Entrar e criar conta |
| `atendimento.html`, `faq.html`, `sobre.html` | Institucionais |
| `404.html` | Página não encontrada |

## Estrutura

```text
katchau-games/
├── *.html                  # Páginas do site
├── css/style.css           # Estilos
├── js/
│   ├── dados.js            # Catálogo e configurações
│   ├── utils.js            # Formatação, ícones e componentes de interface
│   ├── avaliacoes.js       # Avaliações demonstrativas
│   ├── carrinho.js         # Regras e armazenamento do carrinho
│   ├── auth.js             # Cadastro e login locais
│   ├── componentes.js      # Cartão de produto e estrelas
│   ├── main.js             # Comportamento comum (cabeçalho, busca, menu)
│   └── <página>.js         # Script específico de cada página
├── scripts/                # Utilitário opcional para baixar imagens
└── atividades-c/           # Atividades em Linguagem C
```

## Cadastro e login

A conta é **demonstrativa**: os dados ficam no `localStorage` do navegador e nada é enviado a um servidor. A senha é guardada apenas como hash (PBKDF2-SHA256 com sal aleatório), e as mensagens de erro de login não revelam se o e-mail existe. Por não haver backend, isso não substitui uma autenticação real. O recurso exige contexto seguro (`file://`, `localhost` ou `https`).

## Atividades em Linguagem C

| Pasta | Descrição |
|---|---|
| [`atividades-c/cadastro-e-login`](atividades-c/cadastro-e-login) | Menu de cadastro e login com validação de dados |
| [`atividades-c/cadastro-de-produtos`](atividades-c/cadastro-de-produtos) | Cadastro de produtos, listagem de estoque e reajuste de preço |

```bash
gcc -Wall -o programa atividades-c/cadastro-e-login/main.c
./programa
```

## Manutenção

Cabeçalho e rodapé são repetidos em cada arquivo `.html`; ao alterar o menu, atualize todas as páginas.

# KaTchau Games

Projeto acadêmico de uma loja fictícia de games, consoles e periféricos. O repositório reúne o código-fonte do site e materiais desenvolvidos nas atividades relacionadas à empresa.

> **Situação atual:** o site está implementado com React, TypeScript e Vite. Esta versão ainda não representa uma migração para HTML, CSS e JavaScript puros.

## Visão geral

A KaTchau foi concebida como uma loja virtual demonstrativa, com catálogo organizado por departamentos e recursos de navegação e compra simulada.

- **Projeto:** KaTchau Games
- **Tipo:** site demonstrativo / projeto acadêmico
- **Interface:** React + TypeScript
- **Ferramentas de desenvolvimento:** Vite, TanStack Start e Tailwind CSS
- **Dados:** catálogo estático no próprio projeto
- **Backend e vendas reais:** não implementados nesta demonstração

## Funcionalidades do site

A aplicação contém páginas e recursos para:

- Página inicial e apresentação da loja;
- Catálogo de produtos;
- Departamentos de consoles, jogos e periféricos;
- Pesquisa, filtros e ordenação do catálogo;
- Carrinho demonstrativo armazenado no navegador;
- Páginas de atendimento e perguntas frequentes.

O carrinho e o catálogo são recursos de demonstração. Não há processamento de pagamentos nem registro de vendas reais.

## Organização do repositório

```text
katchau-games/
├── docs/                 # Documentação do projeto
├── public/               # Arquivos públicos, como favicon e robots.txt
├── src/
│   ├── assets/           # Recursos visuais utilizados pela aplicação
│   ├── components/
│   │   ├── site/         # Componentes específicos do site
│   │   └── ui/           # Componentes de interface reutilizáveis
│   ├── hooks/            # Hooks React
│   ├── lib/              # Dados e regras auxiliares (catálogo, carrinho etc.)
│   └── routes/           # Páginas e rotas da aplicação
├── Cadastro-de-produtos-listagem-de-estoque-e-reajuste-de-pre-o.zip
├── cadastro-e-login.zip
├── package.json
└── README.md
```

Os arquivos ZIP na raiz são materiais de atividades em Linguagem C. Consulte [Documentação e atividades](docs/README.md) para entender a separação dos materiais.

## Executar o site localmente

### Pré-requisitos

- Node.js em versão compatível com as dependências do projeto;
- npm.

### Instalação

```bash
git clone https://github.com/Jpsn-Dev/katchau-games.git
cd katchau-games
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir a aplicação no navegador.

### Verificações disponíveis

```bash
npm run lint
npm test
npm run build
```

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React | Construção da interface |
| TypeScript | Tipagem e organização do código |
| Vite | Servidor de desenvolvimento e build |
| TanStack Start / Router | Estrutura da aplicação e navegação |
| Tailwind CSS | Estilização |
| Vitest | Testes automatizados |

## Contexto acadêmico

O repositório também reúne entregas relacionadas à empresa fictícia KaTchau. Como há requisitos acadêmicos específicos para o desenvolvimento web, a tecnologia desta versão deve ser conferida com o roteiro da disciplina antes da entrega.

A documentação da migração acadêmica e das próximas etapas está em [roadmap.md](roadmap.md).

## Links

- [Repositório no GitHub](https://github.com/Jpsn-Dev/katchau-games)
- [Prévia publicada no Lovable](https://katchau-games.lovable.app)

# Estrutura do projeto

Este documento explica onde localizar as principais partes do site KaTchau Games.

## Diretórios principais

| Caminho | Responsabilidade |
|---|---|
| `public/` | Arquivos servidos diretamente, como favicon e robots.txt. |
| `src/assets/` | Recursos visuais importados pelo código da aplicação. |
| `src/components/site/` | Componentes reutilizáveis que fazem parte da experiência da loja. |
| `src/components/ui/` | Elementos genéricos de interface. |
| `src/hooks/` | Hooks React compartilhados. |
| `src/lib/` | Dados e funções auxiliares da aplicação. |
| `src/routes/` | Páginas e rotas acessíveis pelo usuário. |

## Arquivos importantes em `src/lib/`

- `products.ts`: dados estáticos dos produtos.
- `catalog.ts` e `use-catalog-search.ts`: regras relacionadas à consulta e aos filtros do catálogo.
- `cart.ts`: estado e operações do carrinho demonstrativo.
- `format.ts`: funções de formatação reutilizáveis.
- `contact.ts`: configuração auxiliar relacionada ao contato.

## Como localizar uma página

As páginas ficam em `src/routes/`. Os nomes dos arquivos indicam sua finalidade, por exemplo:

- `index.tsx`: página inicial;
- `catalogo.tsx`: catálogo;
- `consoles.tsx`: departamento de consoles;
- `jogos.tsx`: departamento de jogos;
- `perifericos.tsx`: departamento de periféricos;
- `carrinho.tsx`: carrinho;
- `atendimento.tsx` e `faq.tsx`: suporte e dúvidas.

Os arquivos com extensão `.tsx` utilizam JSX e TypeScript. Portanto, esta implementação não é um site feito somente com HTML, CSS e JavaScript puros.

## Onde ficam os estilos

O arquivo global de estilos está em `src/styles.css`. Componentes também podem possuir classes e estilos específicos.

## Fluxo básico de desenvolvimento

1. Instale as dependências com `npm install`.
2. Inicie o servidor local com `npm run dev`.
3. Faça alterações nos arquivos de `src/`.
4. Execute `npm run lint` e `npm test` quando aplicável.
5. Gere a versão de produção com `npm run build`.

> Antes de reorganizar ou renomear arquivos, verifique os imports e as rotas que dependem deles.

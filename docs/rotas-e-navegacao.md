# Rotas e navegação

A aplicação utiliza o roteamento baseado em arquivos do **TanStack Router**. Cada arquivo de página em `src/routes/` representa uma rota, e o arquivo `src/routeTree.gen.ts` é gerado automaticamente.

## Páginas

| Arquivo | Caminho | Finalidade |
|---|---|---|
| `index.tsx` | `/` | Página inicial |
| `catalogo.tsx` | `/catalogo` | Catálogo completo |
| `consoles.tsx` | `/consoles` | Departamento de consoles |
| `jogos.tsx` | `/jogos` | Departamento de jogos |
| `perifericos.tsx` | `/perifericos` | Controles e periféricos |
| `produto.$slug.tsx` | `/produto/:slug` | Detalhes de um produto |
| `busca.tsx` | `/busca` | Resultados da pesquisa |
| `carrinho.tsx` | `/carrinho` | Carrinho demonstrativo |
| `atendimento.tsx` | `/atendimento` | Canais e informações de atendimento |
| `faq.tsx` | `/faq` | Perguntas frequentes |
| `sobre.tsx` | `/sobre` | Apresentação do projeto |

## Arquivos importantes

- `__root.tsx`: estrutura compartilhada entre as páginas, como cabeçalho, rodapé e conteúdo da rota.
- `src/router.tsx`: configuração do roteador.
- `src/routeTree.gen.ts`: árvore de rotas gerada pelo TanStack; não editar manualmente.

## Como adicionar uma página

1. Crie um arquivo `.tsx` em `src/routes/`.
2. Defina a rota usando a API do TanStack Router, seguindo o padrão das páginas existentes.
3. Atualize a navegação do site se a nova página precisar aparecer no menu.
4. Execute `npm run lint`, `npm test` e `npm run build` para validar a alteração.

Consulte também [estrutura do projeto](estrutura-do-projeto.md).

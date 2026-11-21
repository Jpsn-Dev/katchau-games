# KaTchau Games

Projeto acadêmico de uma loja fictícia de games, consoles e periféricos, feito **somente com HTML5, CSS3 e JavaScript puro** (sem React, TypeScript, Vite, Tailwind ou qualquer framework). Não há etapa de build nem dependências.

> **Situação atual:** o repositório contém apenas a versão em HTML. O código anterior (React/TanStack/Vite) continua disponível no histórico do Git, antes do commit que fez a migração. Como a estrutura mudou, a sincronização com o Lovable deixa de funcionar.

## Executar localmente

Abra a pasta no Visual Studio Code e abra `index.html` (ou use a extensão **Live Server**). Há um guia completo abaixo.

---

## Sobre a versão HTML

Reprodução fiel do site KaTchau portada do código original (React) deste repositório: mesmos produtos, preços, textos, páginas, cores, fontes, espaçamentos e comportamentos, mais o cadastro/login e as correções descritas abaixo.

## Como abrir

1. Abra a pasta no Visual Studio Code.
2. Abra `index.html` no navegador (ou use a extensão **Live Server**, recomendada).
3. É necessário estar online: as fontes vêm do Google Fonts e as imagens, do site publicado.

> Para usar as imagens offline, rode uma vez `node scripts/baixar-imagens.js`.
> Ele baixa tudo para `assets/images/` e muda `USAR_IMAGENS_LOCAIS` para `true` em `js/dados.js`.

## Páginas

| Arquivo | Equivale a |
| --- | --- |
| `index.html` | Início |
| `catalogo.html` | Catálogo completo e busca (`?q=`) |
| `consoles.html`, `jogos.html`, `perifericos.html` | Departamentos |
| `produto.html?slug=...` | Página de produto |
| `carrinho.html` | Carrinho |
| `conta.html` | Entrar / Criar conta (cadastro e login demonstrativos) |
| `atendimento.html`, `faq.html`, `sobre.html` | Institucionais |
| `404.html` | Página não encontrada |

## Estrutura

```
index.html … 404.html      páginas
css/style.css              estilos (tokens, componentes e responsividade)
js/dados.js                catálogo (36 produtos), imagens e e-mail de contato
js/utils.js                formatação, ícones, avisos (toasts), painel lateral e diálogo
js/avaliacoes.js           avaliações demonstrativas (geração determinística)
js/carrinho.js             regras do carrinho + armazenamento no navegador
js/auth.js                 cadastro/login locais (PBKDF2 via Web Crypto, localStorage)
js/componentes.js          cartão de produto, estrelas e imagem
js/main.js                 contador do carrinho, busca do cabeçalho, menu do celular
js/inicio.js · catalogo.js · produto.js · pagina-carrinho.js · atendimento.js · faq.js · conta.js
scripts/baixar-imagens.js  (opcional) baixa as imagens para uso offline
```

## Funcionalidades preservadas

- Busca sem distinção de acentos (cabeçalho e `?q=`).
- Filtros por categoria, plataforma e faixa de preço, com contagens, chips removíveis e "Limpar filtros".
- Ordenação: mais relevantes, menor preço, maior preço, nome (A–Z).
- Estado dos filtros na URL (link compartilhável).
- Carrinho salvo no navegador (`localStorage`), quantidade de 1 a 99, remover, esvaziar com confirmação e resumo com descontos e parcelamento em 10x.
- Quantidade, "Adicionar ao carrinho" e "Comprar agora" na página de produto.
- Acordeão do FAQ, formulário de atendimento demonstrativo e botão "copiar e-mail".

## Como o conteúdo foi tratado

- **Sem backend:** como no original, o carrinho vive só no navegador e nenhum dado é enviado.
- **Rotas:** o site original usava `/produto/<slug>` e `/catalogo?...`. Em arquivos locais isso vira `produto.html?slug=<slug>` e `catalogo.html?...`. A navegação, os links e os parâmetros equivalem.
- **Avaliações:** o original gera notas, quantidades e comentários de forma determinística a partir do id do produto. O algoritmo, os nomes e os textos foram portados sem alteração, então cada produto mostra as mesmas avaliações do site publicado.
- **Imagens:** continuam sendo as do site original (mesmos arquivos). Nenhuma foi recriada ou substituída.

## Cadastro e login (conta.html)

- Abas **Entrar** e **Criar conta** (`conta.html#cadastro` abre direto o cadastro); o cabeçalho, o menu do celular e o rodapé mostram "Entrar" ou o nome de quem está conectado.
- **Demonstrativo e local:** não existe servidor. A conta fica no `localStorage` deste navegador e nada é enviado. A senha nunca é guardada em texto: usa-se PBKDF2-SHA256 (150 mil iterações, sal aleatório). Isso **não substitui** autenticação real com backend.
- Requer contexto seguro (`file://`, `localhost` ou `https`) por usar a Web Crypto API.
- O cadastro é opcional: navegação e carrinho funcionam sem conta.

## Correções feitas na revisão

- Plataformas de *Marvel's Spider-Man 2* (só PlayStation) e *Forza Horizon 6* (só Xbox) corrigidas; contagens do filtro atualizadas.
- Etiquetas padronizadas ("Destaque", "PlayStation").
- Carrinho ignora itens inexistentes ou corrompidos no armazenamento.
- O foco do teclado não se perde mais ao alterar filtros.
- Cursor de mão em botões; texto "Close" traduzido para "Fechar"; estilo das estrelas movido para o CSS.

## Observação de manutenção

Cabeçalho e rodapé estão repetidos em cada arquivo `.html` (não há framework nem includes). Ao alterar o menu, edite todas as páginas.

## Materiais de Linguagem C

Os dois arquivos `.zip` na raiz (`cadastro-e-login.zip` e `Cadastro-de-produtos-listagem-de-estoque-e-reajuste-de-pre-o.zip`) são atividades em C, cada um com um `main.c`. Não fazem parte do site e foram mantidos como estavam.

## Links

- [Repositório no GitHub](https://github.com/Jpsn-Dev/katchau-games)

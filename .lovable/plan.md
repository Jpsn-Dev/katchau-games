# Migração acadêmica da KaTchau Games

## Diagnóstico do projeto atual

A KaTchau é uma loja acadêmica demonstrativa, sem vendas, cadastro, pagamentos ou envio real de mensagens. O projeto atual utiliza React, TypeScript, TanStack Start e Tailwind CSS; portanto, **a versão atual não atende à exigência de código exclusivamente em HTML, CSS e JavaScript puros**.

Foram analisadas todas as páginas de conteúdo, o cabeçalho, o rodapé, as vitrines, os filtros, as informações de produtos e avaliações, o carrinho, o formulário e os estilos globais.

### Páginas e recursos existentes

- Início: banner, Switch 2 em destaque, atalhos de plataformas, departamentos, produtos mais procurados, vitrine de jogos e seleção da semana.
- Catálogo e departamentos independentes: Consoles, Jogos e Periféricos.
- Detalhes de produto: imagem, descrição, preços, parcelamento, quantidade, avaliações demonstrativas e produtos relacionados.
- Carrinho: armazenamento no navegador, alteração de quantidade, remoção, confirmação para limpar, descontos e finalização simulada.
- Atendimento: e-mail demonstrativo com cópia, assuntos de ajuda e formulário demonstrativo.
- Sobre: apresentação da marca fictícia, transparência acadêmica e departamentos.
- Dúvidas frequentes e endereço de busca que encaminha ao catálogo.
- Catálogo com 36 produtos, imagens e banners atuais, logotipo, fontes Manrope e Barlow Condensed, cores grafite, amarelo e vermelho.
- Busca sem distinção de acentos; filtros por categoria, plataforma e preço; ordenação por relevância, preço ou nome; filtros compartilháveis pelo endereço.
- Menu para celular, contador do carrinho e avisos de interação.

**Não existem favoritos implementados.** Os símbolos das redes sociais indicam perfis indisponíveis, não são botões ativos. História empresarial, missão, visão e valores não estão escritos como seções próprias; não serão inventados como fatos.

## Limitação e forma de entrega

O Lovable exige que a aplicação da prévia continue em React e TanStack Start. Não é possível substituir sua base integralmente aqui por páginas HTML puras.

**Entrega independente confirmada por você:** entregar um projeto independente em ZIP, realmente composto de HTML5, CSS3 externo e JavaScript Vanilla, sem React, TypeScript, JSX, Tailwind ou bibliotecas de interface. O site atual e o endereço publicado ficam intactos. A versão independente poderá ser apresentada na faculdade e hospedada em um serviço para sites estáticos; sua publicação não está incluída nesta etapa.

## Etapas da reconstrução independente

1. Registrar uma referência visual do site atual em computador e celular, incluindo páginas e estados importantes.
2. Preservar os 36 produtos, textos, descrições, preços, avaliações fictícias, fontes, imagens e banners. Levar as imagens para o pacote para que não dependam dos caminhos internos do Lovable.
3. Criar páginas HTML independentes com conteúdo estruturado, navegação por links reais e CSS externo escrito sem Tailwind.
4. Reimplementar os comportamentos em JavaScript puro, separado por responsabilidade: menu, pesquisa, filtros, ordenação, carrinho, confirmação, notificações e formulário.
5. Criar **Novidades** reutilizando os lançamentos e a curadoria já presentes, sem remover essas seções da página inicial nem inventar notícias.
6. Manter o conteúdo atual de **Sobre**. Missão, visão, valores e uma história adicional só entram com texto fornecido ou autorizado por você; a ausência ficará documentada caso não haja esse conteúdo.
7. Comparar as páginas com as referências originais, ajustar diferenças e testar as interações com produtos reais do catálogo, em computador e celular.
8. Entregar o ZIP com instruções de abertura, diagnóstico e relação honesta de funcionalidades preservadas e adaptações.

## Estrutura prevista

```text
katchau-games/
  assets/
    images/
    icons/
    fonts/
  css/
    style.css
  js/
    dados.js
    main.js
    catalogo.js
    filtros.js
    carrinho.js
    produto.js
    contato.js
  produtos/
    [uma página HTML por produto]
  index.html
  sobre.html
  catalogo.html
  consoles.html
  jogos.html
  perifericos.html
  contato.html
  novidades.html
  carrinho.html
  faq.html
  busca.html
  README.md
  DIAGNOSTICO.md
```

## Detalhes técnicos e adaptações

- HTML conterá o conteúdo das páginas, sem uma página única disfarçada com âncoras ou troca de telas.
- CSS manterá os estilos e proporções atuais, incluindo pontos de adaptação para celular e efeitos; não haverá dependência de Tailwind no pacote.
- JavaScript utilizará APIs nativas do navegador e dados locais, sem instalação ou compilação obrigatória para utilização.
- O carrinho continuará local, com limite de 99 unidades por produto e parcelamento ilustrativo em 10 vezes. Mudar de domínio não transfere automaticamente o carrinho salvo no site atual.
- Filtros continuarão no endereço com os mesmos parâmetros. Os caminhos das páginas passarão a terminar em `.html`.
- Avaliações continuarão identificadas como demonstrativas. O formulário e a compra continuarão simulados, sem envio, pagamento ou armazenamento de dados pessoais.
- Testes verificarão preços, totais, limites, busca, filtros e ordenação, além de links, imagens e navegação. A validação visual será separada dos testes de regras.
- O pacote será inspecionado antes da entrega para excluir metadados de repositório, dependências e arquivos de compilação.

## Critérios de conclusão

- Pelo menos cinco arquivos HTML independentes acessíveis e interligados, incluindo Início, Sobre, Catálogo, Contato e Novidades.
- Nenhum código React, TypeScript, JSX, TSX ou dependência de Tailwind na entrega independente.
- Recursos atuais preservados, com ajustes de aparência conferidos e diferenças restantes documentadas, sem prometer identidade visual perfeita sem verificação.
- Carrinho, busca, filtros, ordenação, menu e formulário demonstrativo testados de ponta a ponta.
- Site do Lovable preservado; nenhuma afirmação de que a aplicação publicada foi migrada para HTML puro.
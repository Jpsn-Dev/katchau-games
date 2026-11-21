# Banco de dados e publicação

O site funciona de duas formas, escolhidas automaticamente:

| Modo | Quando | O que acontece |
|---|---|---|
| **Servidor** | Publicado na Cloudflare (Workers) com o banco configurado | Contas, sessões e pedidos ficam no Neon (PostgreSQL). Finalizar pedido exige login. |
| **Local** | Aberto pelo arquivo ou pelo Live Server | Como antes: conta e carrinho só no navegador; "Finalizar compra" apenas simula. |

A página pergunta a `/api/saude` se o banco responde; se não responder, usa o modo local.

## Como funciona

```text
navegador ──► /api/* (Cloudflare Worker) ──► Neon (PostgreSQL)
```

- O navegador nunca recebe a senha do banco. A string de conexão fica só na variável secreta `DATABASE_URL`.
- O catálogo exibido continua vindo de `public/js/dados.js`. O banco recebe uma cópia dos produtos (`db/seed.sql`, gerada por `npm run seed`) e **é ele quem define os preços dos pedidos**: valores enviados pelo navegador são ignorados.
- Ao alterar produtos em `dados.js`, rode `npm run seed` e execute o novo `db/seed.sql` no Neon.

## Tabelas

`categoria`, `marca`, `produto`, `cliente`, `endereco`, `pedido`, `item_pedido`, `pagamento` (relações 1:N do modelo do projeto; pedido 1 : 0..1 pagamento) e `sessao` (login por cookie).

## Passo a passo

### 1. Neon

1. (Recomendado) No Neon, crie um **branch** do banco atual para testar sem mexer nos dados do seu colega.
2. Abra o **SQL Editor** e execute, nesta ordem, o conteúdo de `db/schema.sql` e depois `db/seed.sql`. Ambos podem ser executados mais de uma vez.
3. Copie a **connection string** (Connection details → formato `postgresql://…`).

O `schema.sql` cria o que falta e acrescenta as colunas que o site usa nas tabelas que já existem, sem apagar nada. Se aparecer erro sobre coluna obrigatória (`NOT NULL`) em `cliente`, `produto` ou outra tabela, significa que o seu colega criou uma coluna que o site não preenche: torne-a opcional (`ALTER TABLE tabela ALTER COLUMN coluna DROP NOT NULL;`) ou ajuste o código.

### 2. Cloudflare Workers

O projeto já tem o `wrangler.jsonc`: ele publica a pasta `public/` como arquivos estáticos e envia só as rotas `/api/*` ao Worker (`worker/index.js`). O nome do Worker é `katchau`, o mesmo do endereço `katchau.jpsn-dev.workers.dev`.

1. No Worker `katchau` (Workers & Pages), confira em **Settings → Build** que o repositório está conectado, o *Build command* está em branco e o *Deploy command* é `npx wrangler deploy` (padrão). As dependências do `package.json` são instaladas no deploy.
2. Em **Settings → Variables and Secrets**, adicione `DATABASE_URL` como **Secret**, com a connection string do Neon.
3. Faça um novo deploy (um push na `main` já dispara) e abra `https://katchau.jpsn-dev.workers.dev/api/saude`. O esperado é `{"ok":true,"banco":true}`; se vier `Banco de dados não configurado`, falta o passo 2.

Os nomes dos menus da Cloudflare podem mudar com o tempo; a ideia é sempre: deploy com o `wrangler.jsonc` e variável secreta `DATABASE_URL`.

### 3. Rodar na sua máquina com a API

```bash
npm install
cp .dev.vars.example .dev.vars    # edite com a sua connection string
npm run dev                        # abre em http://localhost:8787
```

`.dev.vars` está no `.gitignore` e nunca deve ser enviado ao GitHub.

## API

| Rota | Função |
|---|---|
| `GET /api/saude` | Confere a conexão com o banco |
| `GET /api/produtos` | Produtos do banco |
| `POST /api/cadastro` · `POST /api/login` · `POST /api/logout` · `GET /api/sessao` | Conta e sessão |
| `GET /api/pedidos` · `POST /api/pedidos` | Histórico e criação de pedidos (exigem login) |

Segurança: consultas sempre parametrizadas; senha com PBKDF2-SHA256 (100 mil iterações, limite do Workers) e sal aleatório; sessão em cookie `HttpOnly` + `SameSite=Lax` (o banco guarda só o hash do token); verificação de `Origin` nas requisições que alteram dados; mensagem única para e-mail inexistente e senha errada; pedido gravado de forma atômica (endereço, pedido, itens e pagamento juntos).

Limites conhecidos: não há limitação de tentativas de login (use as regras de *Rate limiting* da Cloudflare se quiser), o carrinho continua só no navegador, e o pagamento é apenas registrado como `pendente`: nenhuma cobrança real existe.

## Testes

```bash
# precisa de um PostgreSQL local (não usa o Neon)
export PGHOST=localhost PGUSER=postgres PGDATABASE=katchau_teste
psql -f db/schema.sql && psql -f db/seed.sql
npm test
```

Os testes executam a API de verdade contra o banco local: validações, cadastro, login, sessão, pedidos e recusas.

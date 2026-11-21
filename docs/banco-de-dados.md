# Banco de dados e publicação

O site funciona de duas formas, escolhidas automaticamente:

| Modo | Quando | O que acontece |
|---|---|---|
| **Servidor** | Publicado na Cloudflare Pages com o banco configurado | Contas, sessões e pedidos ficam no Neon (PostgreSQL). Finalizar pedido exige login. |
| **Local** | Aberto pelo arquivo ou pelo Live Server | Como antes: conta e carrinho só no navegador; "Finalizar compra" apenas simula. |

A página pergunta a `/api/saude` se o banco responde; se não responder, usa o modo local.

## Como funciona

```text
navegador ──► /api/* (Cloudflare Pages Functions) ──► Neon (PostgreSQL)
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

### 2. Cloudflare Pages

1. Em **Workers & Pages → Create → Pages → Connect to Git**, escolha este repositório.
2. Configure: *Framework preset* **None**, *Build command* em branco, *Build output directory* **`public`**. A pasta `functions/` é detectada sozinha e as dependências do `package.json` são instaladas no deploy.
3. Em **Settings → Variables and Secrets**, adicione `DATABASE_URL` (tipo *Secret*) com a connection string, para *Production* e *Preview*.
4. Faça o deploy e abra `https://<seu-projeto>.pages.dev/api/saude`. O esperado é `{"ok":true,"banco":true}`.

Os nomes dos menus da Cloudflare podem mudar com o tempo; a ideia é sempre: build sem comando, saída em `public`, variável secreta `DATABASE_URL`.

### 3. Rodar na sua máquina com a API

```bash
npm install
cp .dev.vars.example .dev.vars    # edite com a sua connection string
npm run dev                        # abre em http://localhost:8788
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

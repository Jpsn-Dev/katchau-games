-- KaTchau Games — esquema do banco (PostgreSQL / Neon)
--
-- É seguro executar este arquivo mais de uma vez: ele só cria o que ainda não existe
-- e só acrescenta as colunas que faltam. Nada é apagado.
--
-- Tabelas: categoria, marca, cliente, endereco, produto, pedido, item_pedido, pagamento
-- (mesmos nomes e relações do modelo do projeto) + sessao (login por cookie),
-- carrinho_item (carrinho de quem está conectado) e tentativa_login (limite de tentativas).

SET client_min_messages = warning;

CREATE TABLE IF NOT EXISTS categoria (
  id_categoria serial PRIMARY KEY,
  nome         varchar(40) NOT NULL,
  descricao    varchar(200)
);

CREATE TABLE IF NOT EXISTS marca (
  id_marca serial PRIMARY KEY,
  nome     varchar(70) NOT NULL
);

CREATE TABLE IF NOT EXISTS cliente (
  id_cliente serial PRIMARY KEY,
  nome       varchar(80)  NOT NULL,
  email      varchar(120) NOT NULL,
  senha_hash text         NOT NULL,
  telefone   varchar(20),
  cpf        varchar(14),
  criado_em  timestamptz  NOT NULL DEFAULT now()   -- Data_cadastro do modelo
);

CREATE TABLE IF NOT EXISTS endereco (
  id_endereco serial PRIMARY KEY,
  id_cliente  integer NOT NULL REFERENCES cliente (id_cliente) ON DELETE CASCADE,
  cep         varchar(9),
  logradouro  varchar(120),
  numero      varchar(10),
  complemento varchar(60),
  bairro      varchar(60),
  cidade      varchar(60),
  uf          char(2)
);

CREATE TABLE IF NOT EXISTS produto (
  id_produto   integer PRIMARY KEY,
  slug         varchar(120),
  nome         varchar(120),
  descricao    text,
  estoque      integer NOT NULL DEFAULT 100,
  id_categoria integer REFERENCES categoria (id_categoria),
  id_marca     integer REFERENCES marca (id_marca),
  plataformas  text[],
  preco        numeric(10, 2),
  preco_antigo numeric(10, 2),
  etiqueta     varchar(40),
  imagem       varchar(80),
  tipo         varchar(20),
  ativo        boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS pedido (
  id_pedido   serial PRIMARY KEY,
  id_cliente  integer NOT NULL REFERENCES cliente (id_cliente),
  id_endereco integer REFERENCES endereco (id_endereco),
  status      varchar(30)   DEFAULT 'aguardando_pagamento',
  total       numeric(10, 2),
  criado_em   timestamptz   DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_pedido (
  id_item        serial PRIMARY KEY,
  id_pedido      integer NOT NULL REFERENCES pedido (id_pedido) ON DELETE CASCADE,
  id_produto     integer NOT NULL REFERENCES produto (id_produto),
  quantidade     integer NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric(10, 2),
  subtotal       numeric(10, 2)
);

CREATE TABLE IF NOT EXISTS pagamento (
  id_pagamento serial PRIMARY KEY,
  id_pedido    integer NOT NULL REFERENCES pedido (id_pedido) ON DELETE CASCADE,
  metodo       varchar(20),
  status       varchar(20)   DEFAULT 'pendente',
  valor        numeric(10, 2),
  criado_em    timestamptz   DEFAULT now(),
  data_pagamento timestamptz                       -- preenchida quando o pagamento for confirmado
);

CREATE TABLE IF NOT EXISTS sessao (
  token_hash char(64) PRIMARY KEY,
  id_cliente integer NOT NULL REFERENCES cliente (id_cliente) ON DELETE CASCADE,
  criada_em  timestamptz NOT NULL DEFAULT now(),
  expira_em  timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS carrinho_item (
  id_cliente integer NOT NULL REFERENCES cliente (id_cliente) ON DELETE CASCADE,
  id_produto integer NOT NULL REFERENCES produto (id_produto) ON DELETE CASCADE,
  quantidade integer NOT NULL CHECK (quantidade BETWEEN 1 AND 99),
  PRIMARY KEY (id_cliente, id_produto)
);

CREATE TABLE IF NOT EXISTS tentativa_login (
  id        bigserial PRIMARY KEY,
  chave     varchar(160) NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now()
);

-- Se alguma tabela já existia com menos colunas, acrescenta as que o site usa.
ALTER TABLE categoria   ADD COLUMN IF NOT EXISTS descricao varchar(200);
ALTER TABLE cliente     ADD COLUMN IF NOT EXISTS email varchar(120);
ALTER TABLE cliente     ADD COLUMN IF NOT EXISTS telefone varchar(20);
ALTER TABLE cliente     ADD COLUMN IF NOT EXISTS cpf varchar(14);
ALTER TABLE cliente     ADD COLUMN IF NOT EXISTS senha_hash text;
ALTER TABLE cliente     ADD COLUMN IF NOT EXISTS criado_em timestamptz DEFAULT now();
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS id_cliente integer REFERENCES cliente (id_cliente) ON DELETE CASCADE;
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS cep varchar(9);
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS logradouro varchar(120);
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS numero varchar(10);
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS complemento varchar(60);
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS bairro varchar(60);
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS cidade varchar(60);
ALTER TABLE endereco    ADD COLUMN IF NOT EXISTS uf char(2);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS slug varchar(120);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS nome varchar(120);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS descricao text;
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS estoque integer NOT NULL DEFAULT 100;
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS id_categoria integer REFERENCES categoria (id_categoria);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS id_marca integer REFERENCES marca (id_marca);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS plataformas text[];
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS preco numeric(10, 2);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS preco_antigo numeric(10, 2);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS etiqueta varchar(40);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS imagem varchar(80);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS tipo varchar(20);
ALTER TABLE produto     ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;
ALTER TABLE pedido      ADD COLUMN IF NOT EXISTS id_cliente integer REFERENCES cliente (id_cliente);
ALTER TABLE pedido      ADD COLUMN IF NOT EXISTS id_endereco integer REFERENCES endereco (id_endereco);
ALTER TABLE pedido      ADD COLUMN IF NOT EXISTS status varchar(30) DEFAULT 'aguardando_pagamento';
ALTER TABLE pedido      ADD COLUMN IF NOT EXISTS total numeric(10, 2);
ALTER TABLE pedido      ADD COLUMN IF NOT EXISTS criado_em timestamptz DEFAULT now();
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS id_pedido integer REFERENCES pedido (id_pedido) ON DELETE CASCADE;
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS id_produto integer REFERENCES produto (id_produto);
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS quantidade integer;
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS preco_unitario numeric(10, 2);
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS subtotal numeric(10, 2);
ALTER TABLE pagamento   ADD COLUMN IF NOT EXISTS id_pedido integer REFERENCES pedido (id_pedido) ON DELETE CASCADE;
ALTER TABLE pagamento   ADD COLUMN IF NOT EXISTS metodo varchar(20);
ALTER TABLE pagamento   ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'pendente';
ALTER TABLE pagamento   ADD COLUMN IF NOT EXISTS valor numeric(10, 2);
ALTER TABLE pagamento   ADD COLUMN IF NOT EXISTS criado_em timestamptz DEFAULT now();
ALTER TABLE pagamento   ADD COLUMN IF NOT EXISTS data_pagamento timestamptz;

-- O estoque nunca pode ficar negativo (protege contra duas compras ao mesmo tempo).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_produto_estoque') THEN
    ALTER TABLE produto ADD CONSTRAINT ck_produto_estoque CHECK (estoque >= 0);
  END IF;
END $$;

-- Regras de unicidade e índices.
CREATE UNIQUE INDEX IF NOT EXISTS ux_cliente_email   ON cliente (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_produto_slug    ON produto (slug);
CREATE UNIQUE INDEX IF NOT EXISTS ux_categoria_nome  ON categoria (lower(nome));
CREATE UNIQUE INDEX IF NOT EXISTS ux_marca_nome      ON marca (lower(nome));
CREATE UNIQUE INDEX IF NOT EXISTS ux_pagamento_pedido ON pagamento (id_pedido);   -- pedido 1 : 0..1 pagamento
CREATE INDEX IF NOT EXISTS ix_pedido_cliente   ON pedido (id_cliente, criado_em DESC);
CREATE INDEX IF NOT EXISTS ix_item_pedido      ON item_pedido (id_pedido);
CREATE INDEX IF NOT EXISTS ix_endereco_cliente ON endereco (id_cliente);
CREATE INDEX IF NOT EXISTS ix_sessao_expira    ON sessao (expira_em);
CREATE INDEX IF NOT EXISTS ix_tentativa_chave  ON tentativa_login (chave, criada_em);

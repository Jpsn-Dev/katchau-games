-- KaTchau Games — dados de exemplo (INSERT)
--
-- Rode depois de db/schema.sql e db/seed.sql (o seed cadastra categorias, marcas e produtos).
-- Os clientes abaixo são FICTÍCIOS. A senha_hash é um valor de mentira só para preencher a coluna;
-- esses usuários não conseguem entrar no site (contas reais são criadas pela tela de cadastro).
-- Pode ser executado mais de uma vez: não repete clientes (pelo e-mail).

INSERT INTO cliente (nome, email, senha_hash, telefone, cpf)
SELECT v.nome, v.email, 'exemplo-nao-use-para-login', v.telefone, v.cpf
FROM (VALUES
  ('Ana Souza',    'ana.exemplo@katchau.test',    '(11) 90000-0001', '000.000.000-01'),
  ('Bruno Lima',   'bruno.exemplo@katchau.test',  '(11) 90000-0002', '000.000.000-02'),
  ('Carla Mendes', 'carla.exemplo@katchau.test',  '(21) 90000-0003', '000.000.000-03'),
  ('Diego Rocha',  'diego.exemplo@katchau.test',  '(31) 90000-0004', '000.000.000-04')
) AS v (nome, email, telefone, cpf)
WHERE NOT EXISTS (SELECT 1 FROM cliente c WHERE c.email = v.email);

INSERT INTO endereco (id_cliente, cep, logradouro, numero, complemento, bairro, cidade, uf)
SELECT c.id_cliente, v.cep, v.logradouro, v.numero, v.complemento, v.bairro, v.cidade, v.uf
FROM (VALUES
  ('ana.exemplo@katchau.test',   '01001-000', 'Praça da Sé',          '100', NULL,      'Sé',        'São Paulo',      'SP'),
  ('bruno.exemplo@katchau.test', '20040-020', 'Rua da Assembleia',    '10',  'Sala 5',  'Centro',    'Rio de Janeiro', 'RJ'),
  ('carla.exemplo@katchau.test', '30130-010', 'Avenida Afonso Pena',  '1500','Apto 12', 'Centro',    'Belo Horizonte', 'MG')
) AS v (email, cep, logradouro, numero, complemento, bairro, cidade, uf)
JOIN cliente c ON c.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM endereco e WHERE e.id_cliente = c.id_cliente);

-- Três pedidos de exemplo. Os preços vêm da tabela produto, como na API.
-- Só são criados se ainda não existir nenhum pedido dos clientes de exemplo.
DO $$
DECLARE
  v_pedido integer;
  v_total  numeric(10, 2);
  r        record;
BEGIN
  IF EXISTS (SELECT 1 FROM pedido p JOIN cliente c USING (id_cliente) WHERE c.email LIKE '%.exemplo@katchau.test') THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT * FROM (VALUES
      ('ana.exemplo@katchau.test',   'pix',    'pago',      1, 1, 2, 2),
      ('bruno.exemplo@katchau.test', 'cartao', 'pago',      3, 1, 20, 2),
      ('carla.exemplo@katchau.test', 'boleto', 'pendente',  5, 1, 30, 1)
    ) AS x (email, metodo, status_pg, prod_a, qtd_a, prod_b, qtd_b)
  LOOP
    INSERT INTO pedido (id_cliente, id_endereco, status)
    SELECT c.id_cliente, (SELECT min(e.id_endereco) FROM endereco e WHERE e.id_cliente = c.id_cliente),
           CASE WHEN r.status_pg = 'pago' THEN 'pago' ELSE 'aguardando_pagamento' END
    FROM cliente c WHERE c.email = r.email
    RETURNING id_pedido INTO v_pedido;

    INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
    SELECT v_pedido, p.id_produto, q.qtd, p.preco, p.preco * q.qtd
    FROM (VALUES (r.prod_a, r.qtd_a), (r.prod_b, r.qtd_b)) AS q (id_produto, qtd)
    JOIN produto p ON p.id_produto = q.id_produto;

    SELECT sum(subtotal) INTO v_total FROM item_pedido WHERE id_pedido = v_pedido;
    UPDATE pedido SET total = v_total WHERE id_pedido = v_pedido;

    INSERT INTO pagamento (id_pedido, metodo, status, valor, data_pagamento)
    VALUES (v_pedido, r.metodo, r.status_pg, v_total,
            CASE WHEN r.status_pg = 'pago' THEN now() END);
  END LOOP;
END $$;

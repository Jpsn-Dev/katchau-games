-- KaTchau Games — consultas (SELECT)
-- Use depois de db/schema.sql, db/seed.sql e db/exemplos.sql.

-- 1) Listagem de clientes, com a cidade do endereço cadastrado
SELECT c.id_cliente, c.nome, c.email, e.cidade, e.uf
FROM cliente c
LEFT JOIN endereco e ON e.id_cliente = c.id_cliente
ORDER BY c.nome;

-- 2) Consulta de produtos: categoria, marca e preço (os 8 mais caros)
SELECT p.id_produto, p.nome, ca.nome AS categoria, m.nome AS marca, p.preco, p.estoque
FROM produto p
JOIN categoria ca ON ca.id_categoria = p.id_categoria
JOIN marca m      ON m.id_marca = p.id_marca
ORDER BY p.preco DESC
LIMIT 8;

-- 3) Pedidos com cliente, forma de pagamento e situação
SELECT pe.id_pedido, c.nome AS cliente, pe.total,
       pg.metodo, pg.status AS situacao_pagamento
FROM pedido pe
JOIN cliente c    ON c.id_cliente = pe.id_cliente
JOIN pagamento pg ON pg.id_pedido = pe.id_pedido
ORDER BY pe.id_pedido;

-- 4) Itens de cada pedido (relaciona pedido, item e produto)
SELECT pe.id_pedido, p.nome AS produto, i.quantidade, i.preco_unitario, i.subtotal
FROM item_pedido i
JOIN pedido pe ON pe.id_pedido = i.id_pedido
JOIN produto p ON p.id_produto = i.id_produto
ORDER BY pe.id_pedido, p.nome;

-- 5) Faturamento por categoria (somente pedidos pagos)
SELECT ca.nome AS categoria, sum(i.subtotal) AS faturamento, sum(i.quantidade) AS unidades
FROM item_pedido i
JOIN pedido pe     ON pe.id_pedido = i.id_pedido AND pe.status = 'pago'
JOIN produto p     ON p.id_produto = i.id_produto
JOIN categoria ca  ON ca.id_categoria = p.id_categoria
GROUP BY ca.nome
ORDER BY faturamento DESC;

-- =============================================================================
-- Seed Inicial Determinística — Black Amber Coffee
-- Idempotente: utiliza ON CONFLICT DO NOTHING / verificações WHERE NOT EXISTS
-- Senha padrão das contas de demonstração: 123456
-- =============================================================================

-- 1. Funcionários (Workers)
INSERT INTO public.workers (email, password, full_name, phone, role, salary, is_admin, is_active)
VALUES
  ('admin@blackamber.com', crypt('123456', gen_salt('bf', 10)), 'Gerente Black Amber', '11999999999', 'gerente', 5500.00, TRUE, TRUE),
  ('barista@blackamber.com', crypt('123456', gen_salt('bf', 10)), 'João Barista', '11988888888', 'barista', 2800.00, FALSE, TRUE),
  ('caixa@blackamber.com', crypt('123456', gen_salt('bf', 10)), 'Carlos Caixa', '11977777777', 'caixa', 2500.00, FALSE, TRUE),
  ('atendente@blackamber.com', crypt('123456', gen_salt('bf', 10)), 'Maria Atendente', '11966666666', 'atendente', 2400.00, FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 2. Clientes
INSERT INTO public.clients (email, password, full_name, phone, is_active)
VALUES
  ('cliente@teste.com', crypt('123456', gen_salt('bf', 10)), 'Cliente Teste', '11955555555', TRUE),
  ('maria@email.com', crypt('123456', gen_salt('bf', 10)), 'Maria Silva', '11911111111', TRUE),
  ('joao@email.com', crypt('123456', gen_salt('bf', 10)), 'João Pereira', '11922222222', TRUE),
  ('ana@email.com', crypt('123456', gen_salt('bf', 10)), 'Ana Costa', '11933333333', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Produtos e Estoques
INSERT INTO public.products (name, description, category, price, is_active)
SELECT v.name, v.description, v.category::public.product_category, v.price, TRUE
FROM (
  VALUES
    ('Café Expresso', 'Café puro e encorpado', 'cafe', 5.00),
    ('Café Latte', 'Café com leite vaporizado', 'cafe', 8.00),
    ('Cappuccino', 'Café com leite e espuma cremosa', 'cafe', 10.00),
    ('Mocha', 'Café com chocolate e leite', 'cafe', 12.00),
    ('Suco de Laranja', 'Suco natural de laranja', 'suco', 7.00),
    ('Água Mineral', 'Água sem gás 500ml', 'outro', 3.00),
    ('Croissant', 'Croissant artesanal de manteiga', 'lanche', 6.00),
    ('Bolo de Cenoura', 'Fatia de bolo de cenoura com cobertura de chocolate', 'sobremesa', 8.00),
    ('Sanduíche Natural', 'Sanduíche integral com frango e salada', 'lanche', 15.00)
) AS v(name, description, category, price)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.name = v.name
);

INSERT INTO public.stocks (product_id, quantity, min_quantity)
SELECT p.id, 30, 5
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.stocks s WHERE s.product_id = p.id
);

-- 4. Itens de Inventário (Insumos)
INSERT INTO public.inventory_items (code, name, description, category, quantity, unit, min_quantity)
VALUES
  ('INV-001', 'Grãos de Café Arábica', 'Torra média especial para espresso', 'Matéria-Prima', 25.00, 'kg', 10.00),
  ('INV-002', 'Leite Integral', 'Leite UHT para vaporização', 'Laticínios', 8.00, 'L', 10.00),
  ('INV-003', 'Copo Térmico 300ml', 'Copo descartável com tampa', 'Embalagens', 120.00, 'un', 30.00),
  ('INV-004', 'Calda de Chocolate Belga', 'Calda para Mocha e sobremesas', 'Insumos', 0.00, 'L', 5.00),
  ('INV-005', 'Açúcar Demerara', 'Pacote 1kg para balcão e cozinha', 'Insumos', 14.00, 'kg', 5.00)
ON CONFLICT (code) DO NOTHING;

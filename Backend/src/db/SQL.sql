-- ============================================================
--  BLACK AMBER COFFEE — Schema do Banco de Dados (do zero)
--  Gerado para PostgreSQL / Supabase
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE worker_role AS ENUM (
  'barista',
  'caixa',
  'gerente',
  'atendente'
);

CREATE TYPE order_status AS ENUM (
  'criado',
  'em_preparo',
  'pronto',
  'finalizado',
  'cancelado'
);

CREATE TYPE payment_method AS ENUM (
  'pix',
  'cartao_credito',
  'cartao_debito',
  'dinheiro'
);

CREATE TYPE payment_status AS ENUM (
  'pendente',
  'confirmado',
  'recusado',
  'estornado'
);

CREATE TYPE product_category AS ENUM (
  'cafe',
  'cha',
  'suco',
  'smoothie',
  'lanche',
  'sobremesa',
  'outro'
);

CREATE TYPE attendance_status AS ENUM (
  'presente',
  'falta',
  'falta_justificada',
  'folga'
);

-- ============================================================
-- 2. WORKERS (colaboradores) — sem tabela de perfil separada
-- ============================================================

CREATE TABLE workers (
  id          SERIAL PRIMARY KEY,
  public_id   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,           -- bcrypt/argon2
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  role        worker_role NOT NULL,
  salary      NUMERIC(10, 2) NOT NULL,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. CLIENTS (clientes)
-- ============================================================

CREATE TABLE clients (
  id          SERIAL PRIMARY KEY,
  public_id   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,           -- bcrypt/argon2
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. RESET DE SENHA
-- ============================================================

CREATE TABLE password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. PRODUTOS
-- ============================================================

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  public_id   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    product_category NOT NULL,
  price       NUMERIC(10, 2) NOT NULL,
  img_url     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ESTOQUE
-- ============================================================

CREATE TABLE stocks (
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (product_id)
);

-- ============================================================
-- 7. INVENTÁRIO DE INSUMOS (ingredientes / materiais internos)
--    Separado de products pois não é vendável ao cliente
-- ============================================================

CREATE TABLE inventory_items (
  id            SERIAL PRIMARY KEY,
  public_id     UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  code          TEXT UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  quantity      NUMERIC(10, 3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit          TEXT NOT NULL,            -- ex: 'kg', 'litros', 'unidades'
  min_quantity  NUMERIC(10, 3) NOT NULL DEFAULT 0,
  img_url       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. CARRINHO
-- ============================================================

CREATE TABLE carts (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- cada cliente tem no máximo 1 carrinho ativo
  UNIQUE (client_id)
);

CREATE TABLE cart_items (
  cart_id     INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  observation TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (cart_id, product_id)
);

-- ============================================================
-- 9. PEDIDOS
-- ============================================================

CREATE TABLE orders (
  id            SERIAL PRIMARY KEY,
  public_id     UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,     -- código amigável, ex: "BAC-0042"
  client_id     INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status        order_status NOT NULL DEFAULT 'criado',
  total_amount  NUMERIC(10, 2) NOT NULL,
  observation   TEXT,
  updated_by    INTEGER REFERENCES workers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  NUMERIC(10, 2) NOT NULL,   -- preço no momento do pedido
  observation TEXT,

  PRIMARY KEY (order_id, product_id)
);

-- ============================================================
-- 10. PAGAMENTOS
-- ============================================================

CREATE TABLE payments (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  amount      NUMERIC(10, 2) NOT NULL,
  method      payment_method NOT NULL,
  status      payment_status NOT NULL DEFAULT 'pendente',
  paid_at     TIMESTAMPTZ,              -- preenchido quando confirmado
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- um pedido tem apenas um pagamento ativo
  UNIQUE (order_id)
);

-- ============================================================
-- 11. HISTÓRICO DE STATUS DO PEDIDO
-- ============================================================

CREATE TABLE order_status_history (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status order_status NOT NULL,
  new_status      order_status NOT NULL,
  changed_by_worker INTEGER REFERENCES workers(id) ON DELETE SET NULL,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. FOLHA DE PONTO
-- ============================================================

CREATE TABLE attendance (
  worker_id   INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  work_date   DATE NOT NULL,
  status      attendance_status NOT NULL DEFAULT 'presente',
  notes       TEXT,
  recorded_by INTEGER REFERENCES workers(id) ON DELETE SET NULL, -- admin que registrou
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (worker_id, work_date)
);

-- ============================================================
-- 13. ÍNDICES ÚTEIS
-- ============================================================

-- Busca de pedidos por cliente
CREATE INDEX idx_orders_client_id     ON orders(client_id);
-- Fila de pedidos no painel (status + tempo de espera)
CREATE INDEX idx_orders_status        ON orders(status, created_at);
-- Histórico de pedidos
CREATE INDEX idx_order_history_order  ON order_status_history(order_id);
-- Produtos ativos por categoria
CREATE INDEX idx_products_category    ON products(category) WHERE is_active = TRUE;
-- Reset de senha por email
CREATE INDEX idx_pwd_reset_email      ON password_reset_tokens(email);
-- Ponto por data
CREATE INDEX idx_attendance_date      ON attendance(work_date);

-- ============================================================
-- 14. TRIGGER: atualiza updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger nas tabelas que têm updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'workers', 'clients', 'products', 'stocks',
    'inventory_items', 'carts', 'orders', 'payments', 'attendance'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;
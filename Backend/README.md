# Black Amber Coffee API

API RESTful em Node.js + Express 5 + TypeScript ESM (`NodeNext`) estruturada sob **Clean MVC Feature-Driven** com **PostgreSQL 16 (`pg.Pool`)**.

---

## Tecnologias Principais

- **Runtime & Framework:** Node.js, Express 5, TypeScript (`strict: true`, zero `any`)
- **Banco de Dados:** PostgreSQL 16 via `pg` (`Pool`, transações explícitas `BEGIN/COMMIT/ROLLBACK`, sem Drizzle/Supabase)
- **Segurança & Validação:** JWT (`jsonwebtoken`), Refresh Tokens rotativos, `bcryptjs`, `zod`, Helmet-style headers, Rate Limiting
- **Mídia & E-mails:** Multer (memoryStorage), Sharp (WebP optimization), Cloudflare R2 (`@aws-sdk/client-s3`), Resend + React Email
- **Documentação & Testes:** Swagger (`/v1/docs`), Vitest + Supertest

---

## Estrutura Clean MVC (`Backend/`)

```text
Backend/
├── api/
│   ├── index.ts                # Agregador de rotas (/v1/api/* e /api/*)
│   ├── __tests__/              # Suíte de integração Vitest + Supertest
│   ├── health/                 # Health Check (ping real no PostgreSQL) + métricas
│   ├── auth/                   # Cadastro, login unificado, refresh, logout e reset de senha
│   ├── worker/                 # Gestão de equipe e ativação/bloqueio (/status)
│   ├── user/                   # Perfil e moderação administrativa de clientes (/status)
│   ├── product/                # Catálogo e upload WebP para R2
│   ├── inventory/              # Gestão e entradas de estoque
│   ├── order/                  # Pedidos e transições (criado <-> em_preparo -> pronto -> finalizado)
│   ├── cart/                   # Carrinho persistido em banco
│   ├── payment/                # Checkout transacional atômico
│   └── analytics/              # Métricas e indicadores do dashboard administrativo
├── core/
│   ├── config/env.ts
│   ├── database/               # postgres.client.ts, migrator.ts, seeder.ts
│   ├── enums/
│   ├── errors/                 # AppError, globalErrorHandler, logger
│   ├── jwt/
│   ├── mail/                   # Provider Resend + templates tipados React Email
│   ├── middlewares/            # AuthMiddleware (valida is_active), RBAC, Zod, Security, Upload
│   ├── security/
│   ├── storage/                # Cloudflare R2 + Sharp WebP
│   └── swagger/
└── src/server.ts               # Bootstrap HTTP + AUTO_MIGRATE + AUTO_SEED
```

---

## Execução Local e Testes

```bash
# 1. Instalar dependências
npm install

# 2. Subir PostgreSQL local via Database/ ou configurar .env (veja .env.example)
# 3. Validar tipos, testes e build
npm run typecheck
npm test
npm run build

# 4. Iniciar em desenvolvimento ou produção
npm run dev
npm run start
```

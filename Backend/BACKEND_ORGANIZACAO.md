# 🏗️ Backend - Black Amber Coffee

## 📁 Estrutura de Pastas

``` Estrutura
src/
├── config/           # Configurações (DB, env)
├── core/             # Core (enums, JWT, security, ID generator)
├── db/               # Schema do banco (Drizzle ORM)
├── infra/            # Infraestrutura (mail, storage)
├── modules/          # Módulos da aplicação
│   ├── admin/        # Admin (worker management)
│   ├── analytics/    # Analytics / Dashboard
│   ├── auth/         # Autenticação (clientes + workers)
│   ├── health/       # Health check
│   ├── order/        # Pedidos
│   ├── product/      # Produtos
│   ├── user/         # Usuários (clientes)
│   └── worker/       # Funcionários
├── routes/           # Router principal (v1.route.ts)
├── seed/             # Seed do banco
├── shared/           # Compartilhados (errors, handlers, middlewares, helpers, swagger)
│   ├── errors/       # Logger
│   ├── handlers/     # Error handler
│   ├── helpers/      # Map de erros HTTP
│   ├── middlewares/   # Auth, Admin, Permission, Upload, Validation
│   ├── utils/        # Utilitários (code generator)
│   └── swagger.ts    # Config Swagger
└── server.ts         # Entry point
```

---

## 🧠 Sistema de Permissões

### Três níveis de usuário

| Tipo | Role | Descrição |
| ------ | ------ | ----------- |
| `user` | — | Cliente (consumidor final) |
| `worker` | `BARISTA`, `BARMAN`, `WAITER` | Funcionário padrão |
| `admin` | `ADMIN` | Gerente |

### Middleware de Permissão (`src/shared/middlewares/permission.middleware.ts`)

```typescript
requireRole("admin")           // Apenas admin
requireRole("worker", "admin") // Worker ou admin (requireWorker())
requireAdmin()                 // Atalho para requireRole("admin")
requireWorker()                // Atalho para requireRole("worker", "admin")
```

**Como funciona:** O JWT do worker contém `role` e `isAdmin` no payload. O middleware verifica esses campos para determinar o nível de acesso.

---

## 🗺️ Rotas da API (v1)

Todas as rotas são prefixadas com `/v1/api/...`

### 🔐 Autenticação

| Método | Rota | Acesso | Descrição |
| ------ | ------ | ------ | ----------- |
| POST | `/auth/register` | Público | Registrar cliente |
| POST | `/auth/login` | Público | Login cliente |
| POST | `/auth/jwt/refresh-token` | Público | Renovar tokens |
| POST | `/auth/logout` | Autenticado | Logout |
| POST | `/auth/forgotpassword/send` | Público | Enviar código reset |
| POST | `/auth/forgotpassword/check` | Público | Validar código |
| POST | `/auth/forgotpassword/reset` | Público | Resetar senha |

### 👤 Clientes (`/users`)

| Método | Rota | Acesso | Descrição |
| ------ | ------ | ------ | ----------- |
| GET | `/users/me` | Cliente autenticado | Meu perfil |
| PUT | `/users/me` | Cliente autenticado | Atualizar meu perfil |
| DELETE | `/users/me` | Cliente autenticado | Deletar minha conta |
| GET | `/users` | **Admin** | Listar clientes |
| GET | `/users/:publicId` | **Admin** | Buscar cliente |
| PUT | `/users/:publicId` | **Admin** | Atualizar cliente |
| DELETE | `/users/:publicId` | **Admin** | Deletar cliente |

### 👨‍🍳 Funcionários (`/workers`)

| Método | Rota | Acesso | Descrição |
| ------ | ------ | ------ | ----------- |
| POST | `/workers/login` | Público | Login worker |
| GET | `/workers/me` | Worker/Admin | Meu perfil |
| PATCH | `/workers/me` | Worker/Admin | Atualizar meu perfil |
| GET | `/workers` | **Admin** | Listar funcionários |
| POST | `/workers` | **Admin** | Cadastrar funcionário |
| GET | `/workers/:publicId` | **Admin** | Buscar funcionário |
| PUT | `/workers/:publicId` | **Admin** | Atualizar funcionário |
| DELETE | `/workers/:publicId` | **Admin** | Deletar funcionário |

### 📦 Pedidos (`/orders`)

| Método | Rota | Acesso | Descrição |
| ------ | ------ | ------ | ----------- |
| GET | `/orders` | Worker/Admin | Listar todos pedidos |
| POST | `/orders` | Worker/Admin | Criar pedido |
| GET | `/orders/:publicId` | Worker/Admin | Buscar pedido |
| PATCH | `/orders/:publicId/status` | Worker/Admin | Atualizar status |
| POST | `/orders/:publicId/cancel` | Worker/Admin | Cancelar pedido |

> **Nota:** As rotas de pedidos são **unificadas** — tanto worker quanto admin usam os mesmos endpoints. A diferença de permissão é controlada internamente pelo middleware.

### ☕ Produtos (`/products`)

| Método | Rota | Acesso | Descrição |
| ------ | ------ | ------ | ----------- |
| GET | `/products` | Autenticado | Listar produtos |
| GET | `/products/categories` | Autenticado | Listar categorias |
| GET | `/products/:publicId` | Autenticado | Buscar produto |
| GET | `/products/:publicId/stock` | Autenticado | Ver estoque |
| POST | `/products` | **Admin** | Criar produto |
| PUT | `/products/:publicId` | **Admin** | Atualizar produto |
| DELETE | `/products/:publicId` | **Admin** | Deletar produto |
| POST | `/products/:publicId/image` | **Admin** | Upload imagem |
| PATCH | `/products/:publicId/activate` | **Admin** | Ativar produto |
| PATCH | `/products/:publicId/deactivate` | **Admin** | Desativar produto |
| PATCH | `/products/:publicId/stock` | **Admin** | Atualizar estoque |

> **Nota:** GET são acessíveis por qualquer autenticado. POST/PUT/DELETE/PATCH (ações de escrita) exigem admin.

### 📊 Analytics (`/analytics`)

| Método | Rota | Acesso | Descrição |
| ------ | ------ | ------ | ----------- |
| GET | `/analytics/dashboard` | **Admin** | Dashboard completo |

**Dados retornados:**

- `totalOrdersToday` — Total de pedidos hoje
- `totalRevenueToday` — Faturamento do dia
- `revenueChange` — Variação % em relação a ontem
- `ordersByStatus` — Contagem por status
- `topProducts` — Top 5 produtos mais vendidos
- `totalProducts` — Total de produtos cadastrados
- `totalClients` — Total de clientes
- `totalWorkers` — Total de funcionários
- `lowStockItems` — Itens com estoque baixo
- `pendingOrders` — Pedidos pendentes
- `inProgressOrders` — Pedidos em preparo

### 🔄 Compatibilidade Retroativa

As rotas antigas **continuam funcionando** para não quebrar o frontend existente:

| Rota Antiga | Equivalente Nova |
| ----------- | ----------------- |
| `POST /worker/login` | `POST /workers/login` |
| `GET /worker/get/me` | `GET /workers/me` |
| `PATCH /worker/update/me` | `PATCH /workers/me` |
| `GET /worker/orders` | `GET /orders` |
| `POST /worker/orders` | `POST /orders` |
| `GET /worker/orders/:id` | `GET /orders/:id` |
| `PATCH /worker/orders/:id/status` | `PATCH /orders/:id/status` |
| `POST /worker/orders/:id/cancel` | `POST /orders/:id/cancel` |
| `GET /admin/workers` | `GET /workers` |
| `POST /admin/workers` | `POST /workers` |
| `PUT /admin/workers/:id` | `PUT /workers/:id` |
| `DELETE /admin/workers/:id` | `DELETE /workers/:id` |
| `POST /admin/products` | `POST /products` |
| `PUT /admin/products/:id` | `PUT /products/:id` |
| `DELETE /admin/products/:id` | `DELETE /products/:id` |
| `POST /user/orders` | (cliente) |
| `GET /user/orders` | (cliente) |
| `GET /user/me` | `GET /users/me` |
| `PUT /user/me` | `PUT /users/me` |
| `DELETE /user/me` | `DELETE /users/me` |

---

## 🔄 Fluxo de Autenticação

### Cliente

``` Cliente
POST /auth/register → POST /auth/login → Recebe JWT → Usa nas requisições
```

### Worker / Admin

``` Worker / Admin
POST /workers/login → Recebe JWT (com role + isAdmin) → Usa nas requisições
```

O JWT do worker inclui `role` e `isAdmin` no payload, permitindo que o middleware `requireWorker()` e `requireAdmin()` funcionem corretamente.

---

## 🧱 Organização por Módulo

Cada módulo segue o padrão:

``` Arquitetura do Módulo
module/
├── module.controller.ts   # Handlers HTTP (req/res)
├── module.service.ts      # Lógica de negócio
├── module.repository.ts   # Acesso ao banco
├── module.model.ts        # Modelo de dados
├── module.schema.ts       # Schemas Zod
├── module.routes.ts       # Definição de rotas
└── routes/                # (opcional) Sub-rotas separadas
    ├── module.routes.ts   # Rota unificada
    ├── module.user.routes.ts
    └── module.admin.routes.ts
```

### Módulo Admin

Gerencia funcionários e clientes via `AdminService`. Usa os repositórios de `Worker`, `Order`, `Product`, `User` e `Auth`.

### Módulo Analytics

Novo módulo que consulta o banco diretamente com queries agregadas para alimentar o dashboard do admin.

### Módulo de Pedidos (Order)

Suporta criação por cliente (`createForUser`) e por worker (`createForWorker`). O worker pode criar pedidos para clientes de balcão (sem precisar de um `clientPublicId`).

---

## 🔑 Variáveis de Ambiente

```env
NODE_ENV=development|production|test
PORT=8080
DATABASE_URL=postgres://...
RESEND_API_KEY=...
SYSTEM_MAIL_ADDR=...
JWT_SECRET=...
JWT_EXPIRATION=15m
JWT_SECRET_REFRESH=...
BUCKET_NAME=...
BUCKET_ACCESS_KEY=...
BUCKET_SECRET_KEY=...
BUCKET_URL=...
BUCKET_REGION=...
```

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar migrations
npm run drizzle:migrate

# Iniciar servidor (desenvolvimento)
npm run dev

# Build
npm run build
npm start
```

Documentação Swagger disponível em: `http://localhost:PORT/v1/docs`

# 🗺️ Mapa Completo de Rotas — Black Amber Coffee API

> Base URL: `http://localhost:3000/v1`
> Docs (Swagger): `http://localhost:3000/v1/docs`

---

## 🔐 Autenticação (Auth) — `/api/auth/*`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/api/auth/register` | Registrar novo cliente | Público |
| POST | `/api/auth/login` | Login unificado (cliente OU worker) | Público |
| POST | `/api/auth/jwt/refresh-token` | Renovar tokens | Autenticado |
| POST | `/api/auth/logout` | Logout / revogar tokens | Autenticado |
| POST | `/api/auth/forgotpassword/send` | Enviar código de reset | Público |
| POST | `/api/auth/forgotpassword/check` | Validar código de reset | Público |
| POST | `/api/auth/forgotpassword/reset` | Resetar senha | Público |

---

## 🥤 Pedidos (Orders) — `/api/orders/*`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/api/orders` | Listar todos os pedidos | Worker / Admin |
| POST | `/api/orders` | Criar novo pedido | Worker / Admin |
| GET | `/api/orders/:publicId` | Buscar pedido por ID | Worker / Admin |
| PATCH | `/api/orders/:publicId/status` | Atualizar status | Worker / Admin |
| POST | `/api/orders/:publicId/cancel` | Cancelar pedido | Worker / Admin |

---

## ☕ Produtos (Products) — `/api/products/*`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/api/products` | Listar produtos | Autenticado |
| GET | `/api/products/categories` | Listar categorias | Autenticado |
| GET | `/api/products/:publicId` | Buscar produto | Autenticado |
| GET | `/api/products/:publicId/stock` | Ver estoque | Autenticado |
| POST | `/api/products` | Criar produto | **Admin** |
| PUT | `/api/products/:publicId` | Atualizar produto | **Admin** |
| DELETE | `/api/products/:publicId` | Deletar produto | **Admin** |
| POST | `/api/products/:publicId/image` | Upload imagem | **Admin** |
| PATCH | `/api/products/:publicId/activate` | Ativar produto | **Admin** |
| PATCH | `/api/products/:publicId/deactivate` | Desativar produto | **Admin** |
| PATCH | `/api/products/:publicId/stock` | Atualizar estoque | **Admin** |

---

## 👷 Workers — `/api/workers/*`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/api/workers/me` | Perfil próprio | Worker / Admin |
| PATCH | `/api/workers/me` | Atualizar próprio perfil | Worker / Admin |
| GET | `/api/workers` | Listar todos workers | **Admin** |
| POST | `/api/workers` | Registrar novo worker | **Admin** |
| GET | `/api/workers/:publicId` | Buscar worker | **Admin** |
| PUT | `/api/workers/:publicId` | Atualizar worker | **Admin** |
| DELETE | `/api/workers/:publicId` | Deletar worker | **Admin** |

> **Login de worker é feito via `POST /api/auth/login`** (unificado)

---

## 👤 Clientes (Users) — `/api/users/*`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/api/users/me` | Perfil próprio | Cliente autenticado |
| PUT | `/api/users/me` | Atualizar próprio perfil | Cliente autenticado |
| DELETE | `/api/users/me` | Deletar própria conta | Cliente autenticado |
| GET | `/api/users` | Listar todos clientes | **Admin** |
| GET | `/api/users/:publicId` | Buscar cliente | **Admin** |
| PUT | `/api/users/:publicId` | Atualizar cliente | **Admin** |
| DELETE | `/api/users/:publicId` | Deletar cliente | **Admin** |

---

## 📊 Analytics — `/api/analytics/*`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/api/analytics/dashboard` | Dashboard com métricas | **Admin** |

---

## 🩺 Health — `/api/health`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/api/health` | Health check | Público |

---

## 🔄 Rotas de Compatibilidade Retroativa

> Essas rotas existem para o frontend antigo continuar funcionando.
> **Preferência:** Use as rotas unificadas acima.

### Worker (estilo antigo)
| Método | Rota | Equivalente novo |
|--------|------|-----------------|
| GET | `/api/worker/get/me` | `GET /api/workers/me` |
| PATCH | `/api/worker/update/me` | `PATCH /api/workers/me` |
| POST | `/api/worker/orders` | `POST /api/orders` |
| GET | `/api/worker/orders` | `GET /api/orders` |
| GET | `/api/worker/orders/:publicId` | `GET /api/orders/:publicId` |
| PATCH | `/api/worker/orders/:publicId/status` | `PATCH /api/orders/:publicId/status` |
| POST | `/api/worker/orders/:publicId/cancel` | `POST /api/orders/:publicId/cancel` |

### User/Cliente (estilo antigo)
| Método | Rota | Equivalente novo |
|--------|------|-----------------|
| GET | `/api/user/me` | `GET /api/users/me` |
| PUT | `/api/user/me` | `PUT /api/users/me` |
| DELETE | `/api/user/me` | `DELETE /api/users/me` |
| POST | `/api/user/orders` | --- (específica do cliente) |
| GET | `/api/user/orders` | --- (específica do cliente) |
| POST | `/api/user/orders/:publicId/cancel` | `POST /api/orders/:publicId/cancel` |

### Admin (estilo antigo)
| Método | Rota | Equivalente novo |
|--------|------|-----------------|
| POST | `/api/admin/workers` | `POST /api/workers` |
| GET | `/api/admin/workers` | `GET /api/workers` |
| GET | `/api/admin/workers/:publicId` | `GET /api/workers/:publicId` |
| PUT | `/api/admin/workers/:publicId` | `PUT /api/workers/:publicId` |
| DELETE | `/api/admin/workers/:publicId` | `DELETE /api/workers/:publicId` |
| POST | `/api/admin/products` | `POST /api/products` |
| PUT | `/api/admin/products/:publicId` | `PUT /api/products/:publicId` |
| DELETE | `/api/admin/products/:publicId` | `DELETE /api/products/:publicId` |
| POST | `/api/admin/products/:publicId/image` | `POST /api/products/:publicId/image` |
| PATCH | `/api/admin/products/:publicId/activate` | `PATCH /api/products/:publicId/activate` |
| PATCH | `/api/admin/products/:publicId/deactivate` | `PATCH /api/products/:publicId/deactivate` |
| GET | `/api/admin/products/:publicId/stock` | `GET /api/products/:publicId/stock` |
| PATCH | `/api/admin/products/:publicId/stock` | `PATCH /api/products/:publicId/stock` |

---

## 📋 Resumo de Permissões

| Role | Pode acessar |
|------|-------------|
| **Público** | Health, Auth (register, login, forgot password) |
| **Cliente (`user`)** | Próprio perfil (`/users/me`), próprios pedidos (`/user/orders`) |
| **Worker** | Pedidos, Produtos (visualizar), próprio perfil (`/workers/me`) |
| **Admin** | TUDO (CRUD workers, users, products, analytics, orders) |

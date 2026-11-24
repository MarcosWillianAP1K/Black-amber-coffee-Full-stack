# Mapa Completo de Rotas — Black Amber Coffee API

> Prefixo principal: `/v1/api/*` (com alias `/api/*`)  
> Health Check raiz e versionado: `GET /health` e `GET /v1/api/health`  
> Documentação Swagger UI: `GET /v1/docs`

---

## Health & Observabilidade (`/v1/api`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| GET | `/v1/api/health` | Status da API e latência real no PostgreSQL (`200` ou `503`) | Público |
| GET | `/v1/api/metrics` | Uptime e consumo de memória do processo | Admin |

---

## Autenticação (`/v1/api/auth`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| POST | `/v1/api/auth/register` | Registrar novo cliente (`201` ou `409`) | Público |
| POST | `/v1/api/auth/login` | Login unificado para clientes e workers (`403` se bloqueado) | Público |
| POST | `/v1/api/auth/jwt/refresh-token` | Renovar par Access/Refresh Token | Público |
| POST | `/v1/api/auth/logout` | Revogar sessão atual ou todas as sessões | Público |
| POST | `/v1/api/auth/forgotpassword/send` | Enviar código de redefinição de senha | Público |
| POST | `/v1/api/auth/forgotpassword/check` | Validar código de redefinição | Público |
| POST | `/v1/api/auth/forgotpassword/reset` | Redefinir senha com código válido | Público |

---

## Funcionários / Workers (`/v1/api/workers`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| GET | `/v1/api/workers/me` | Dados do worker autenticado | Worker |
| PATCH | `/v1/api/workers/me` | Atualizar perfil próprio e avatar (WebP) | Worker |
| GET | `/v1/api/workers` | Listar todos os funcionários | Admin |
| POST | `/v1/api/workers` | Cadastrar funcionário | Admin |
| GET | `/v1/api/workers/:publicId` | Detalhar funcionário | Admin |
| PUT | `/v1/api/workers/:publicId` | Atualizar dados/salário/cargo/status do funcionário | Admin |
| PATCH | `/v1/api/workers/:publicId/status` | Ativar ou bloquear funcionário (`isActive`) | Admin |
| DELETE | `/v1/api/workers/:publicId` | Remover funcionário | Admin |

---

## Clientes / Users (`/v1/api/users`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| GET | `/v1/api/users/me` | Perfil do cliente autenticado | Cliente |
| PUT | `/v1/api/users/me` | Atualizar perfil próprio e avatar | Cliente |
| DELETE | `/v1/api/users/me` | Excluir própria conta | Cliente |
| GET | `/v1/api/users` | Listar todos os clientes | Admin |
| GET | `/v1/api/users/:publicId` | Detalhar cliente | Admin |
| PUT | `/v1/api/users/:publicId` | Atualizar dados administrativos do cliente | Admin |
| PATCH | `/v1/api/users/:publicId/status` | Ativar ou bloquear cliente (`isActive`) | Admin |
| DELETE | `/v1/api/users/:publicId` | Remover cliente | Admin |

---

## Cardápio / Products (`/v1/api/products`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| GET | `/v1/api/products` | Listar produtos | Autenticado |
| GET | `/v1/api/products/categories` | Listar categorias | Autenticado |
| GET | `/v1/api/products/:publicId` | Buscar produto por `publicId` | Autenticado |
| GET | `/v1/api/products/:publicId/stock` | Consultar estoque vinculado | Autenticado |
| POST | `/v1/api/products` | Cadastrar produto | Admin |
| PUT | `/v1/api/products/:publicId` | Atualizar produto | Admin |
| DELETE | `/v1/api/products/:publicId` | Remover produto (soft-delete se vinculado a pedidos) | Admin |
| POST | `/v1/api/products/:publicId/image` | Upload de imagem (`multipart/form-data` -> WebP) | Admin |
| PATCH | `/v1/api/products/:publicId/activate` | Ativar produto | Admin |
| PATCH | `/v1/api/products/:publicId/deactivate` | Desativar produto | Admin |
| PATCH | `/v1/api/products/:publicId/stock` | Ajustar estoque do produto | Admin |

---

## Estoque / Inventory (`/v1/api/inventory`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| GET | `/v1/api/inventory` | Listar itens de estoque | Autenticado |
| GET | `/v1/api/inventory/:publicId` | Buscar item de estoque | Autenticado |
| POST | `/v1/api/inventory/create` | Criar novo item de estoque | Admin |
| POST | `/v1/api/inventory/add-stock` | Adicionar quantidade por código | Admin |
| PUT | `/v1/api/inventory/:publicId` | Atualizar item de estoque | Admin |
| DELETE | `/v1/api/inventory/:publicId` | Excluir item de estoque | Admin |

---

## Pedidos, Carrinho, Checkout e Analytics

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| GET | `/v1/api/orders` | Listar pedidos (cliente vê os próprios; worker vê fila completa) | Autenticado |
| POST | `/v1/api/orders` | Criar pedido | Autenticado |
| GET | `/v1/api/orders/:publicId` | Buscar detalhes do pedido | Worker |
| PATCH | `/v1/api/orders/:publicId/status` | Atualizar status (`criado <-> em_preparo -> pronto -> finalizado`) | Worker |
| POST | `/v1/api/orders/:publicId/cancel` | Cancelar pedido | Autenticado |
| DELETE | `/v1/api/orders/:publicId` | Excluir pedido | Admin |
| GET | `/v1/api/cart` | Consultar carrinho ativo | Cliente |
| POST | `/v1/api/cart/items` | Adicionar item ao carrinho | Cliente |
| PATCH | `/v1/api/cart/items/:productId` | Atualizar quantidade no carrinho | Cliente |
| DELETE | `/v1/api/cart/items/:productId` | Remover item do carrinho | Cliente |
| DELETE | `/v1/api/cart` | Esvaziar carrinho | Cliente |
| POST | `/v1/api/payments/simulate` | Executar checkout transacional atômico a partir do carrinho | Cliente |
| GET | `/v1/api/analytics/dashboard` | Indicadores financeiros e métricas do painel | Admin |

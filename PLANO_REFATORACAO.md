# Plano Mestre de Refatoração — Black Amber Coffee Full-Stack

> **Status:** Revisado (2ª Passagem de Auditoria Técnica) — Pronto para aprovação e execução  
> **Destino de Hospedagem:** Render (`render.yaml` Blueprint: PostgreSQL + Backend Web Service + Admin Static Site + Client Static Site)  
> **Template Base Backend / BD:** `C:\Users\MWSS\OneDrive\Desktop\Teamplate-projetos\React vite tailwind typescript, typescript restFul, postgreeSQL, Clean MVC Feature-Driven, docker`  
> **Template Base Docs / Governança:** `C:\Users\MWSS\OneDrive\Desktop\Teamplate-projetos\Template Board de Tasks, Gestao de Sprints, Documentacao Docs, AGENTS.md`

---

## 1. Decisões Arquiteturais Consolidadas

1. **Banco de Dados & Camada de Persistência (PostgreSQL puro com `pg.Pool`):**
   - Remoção completa do **Drizzle ORM** e de qualquer dependência ou configuração ligada ao **Supabase** / **Vercel**.
   - Adoção do **PostgreSQL 16** com o driver nativo `pg` (`Pool` centralizado em `Backend/core/database/postgres.client.ts`), seguindo o padrão do template selecionado.
   - Criação da pasta `Database/` isolada na raiz contendo `database.sql` (schema mestre), `migrations/001_initial_schema.sql`, `seeds/01_seed_black_amber.sql`, `Dockerfile` e `docker-compose.yml` (PostgreSQL 16 + painel Adminer na porta `8080`).
2. **Auto-Migrate & Auto-Seed Idempotente no Boot:**
   - O Backend executará automaticamente no startup (`Backend/src/server.ts`) o `migrator.ts` (`CREATE TABLE IF NOT EXISTS` / `DO $$ ...`) e o `seeder.ts` idempotente (criando usuários de demonstração, produtos, estoques e pedidos apenas se ainda não existirem).
   - **Por que isso é crucial na Render:** Como bancos gratuitos na Render podem expirar após 30–90 dias, caso uma nova instância PostgreSQL seja provisionada, basta apontar a nova `DATABASE_URL` e iniciar o Backend para todo o schema e dados de demonstração subirem prontos automaticamente em segundos.
3. **Arquitetura do Backend (Clean MVC Feature-Driven):**
   - Reestruturação completa de `Backend/src/modules/` para o padrão do template: `Backend/api/{feature}/{controllers,services,models,routes,dtos,validators}` + camada compartilhada em `Backend/core/`.
   - Preservação dos endpoints em `/v1/api/*` (com alias `/api/*` opcional e documentação Swagger em `/v1/docs` e `/api/docs`) para manter 100% de compatibilidade com o Frontend atual durante e após a refatoração.
4. **Armazenamento de Imagens (S3 / Cloudflare R2) e E-mail (Resend):**
   - Manutenção do upload de imagens via bucket S3/Cloudflare R2 (`@aws-sdk/client-s3`) com processamento/otimização para **WebP 512×512** via `sharp`, e envio de e-mails de redefinição de senha via `Resend`, todos configuráveis por variáveis de ambiente.
5. **Arquitetura do Frontend (Manutenção Estrutural + Zustand + Warmup `/health` + Loading UX):**
   - Manutenção da estrutura atual do monorepo (`Frontend/app/admin`, `Frontend/app/client`, `Frontend/packages/ui-shared`, `Frontend/packages/utils`), **sem forçar migração para Feature-Driven no Frontend**.
   - **Remoção de todos os 9 arquivos de React Context** (`6` no `admin-app` e `3` no `client-app`), substituindo-os por **9 Zustand Stores** (`stores/use*Store.ts`), mantendo os custom hooks (`hooks/use*.ts`) como fachada limpa para minimizar impacto nos componentes.
   - Implementação do componente **`ServerWarmupGate.tsx`** na raiz de ambos os apps para consultar `GET /v1/api/health` antes de liberar o sistema, exibindo tela de aquecimento amigável caso o servidor na Render esteja hibernando (cold start).
   - Adição de **ícones de carregamento (`LoadingSpinner`)** e bloqueio contra duplo clique em todos os botões de mutação, cards, formulários, tabelas e carrinho.
6. **Documentação & Deploy IaC na Render:**
   - Inclusão integral do template de documentação e governança na raiz (`docs/`, `AGENTS.md`, `mkdocs.yml`, `scripts/`).
   - Criação do Blueprint `render.yaml` na raiz declarando: `1` banco PostgreSQL gerenciado, `1` Web Service (Backend) e `2` Static Sites (`admin-app` e `client-app`).

---

## 2. Revisão Profunda (2ª Passagem de Auditoria) — 11 Bugs Críticos Mapeados

A auditoria linha a linha do código atual identificou **11 problemas reais** (7 levantados na 1ª análise e **4 novos bugs estruturais** descobertos na 2ª passagem pelos repositórios, schema e roteador):

| # | Severidade | Localização Atual | Diagnóstico Técnico do Bug | Correção Planejada na Refatoração |
| :- | :--- | :--- | :--- | :--- |
| **01** | 🔴 Crítico | `Frontend/app/admin/src/services/httpClient.ts` e `Frontend/app/client/src/services/httpClient.ts` | `if (init.body && !headers.has("Content-Type"))` força `application/json` mesmo quando `init.body` é uma instância de `FormData`, corrompendo o header `multipart/form-data; boundary=...` e quebrando o `multer` no upload de imagens. | Validar `!(init.body instanceof FormData)` antes de injetar `Content-Type: application/json`, tanto na chamada inicial quanto no retry pós-refresh `401`. |
| **02** | 🔴 Crítico | `Backend/src/modules/product/product.service.ts`, `user.service.ts` e `worker.service.ts` | O upload para o bucket S3/R2 salva apenas a `key` relativa (`products/{id}/123-lg.webp` ou `images/{id}/...`) no banco em vez da URL pública completa, fazendo a tag `<img src={...} />` quebrar no navegador. | Construir e retornar a URL pública completa no `bucket.provider.ts` usando `BUCKET_PUBLIC_URL` (com fallback para `${BUCKET_URL}/${BUCKET_NAME}`) e persistir a URL completa no PostgreSQL. |
| **03** | 🔴 Crítico *(Novo — 2ª Revisão)* | `Backend/src/db/schema.ts` + repositórios `order`, `product`, `user` e `worker` | **Crash `500 Foreign Key Constraint Violation` ao excluir registros:** Nenhuma FK possuía `ON DELETE CASCADE` ou `ON DELETE SET NULL`. Deletar um produto (que tem linha em `stocks`), deletar um pedido (que tem `order_items`, `payments`, `order_status_history`), ou deletar um cliente/funcionário causava erro fatal `23503 foreign_key_violation` no PostgreSQL. | No `Database/database.sql`, aplicar `ON DELETE CASCADE` nas tabelas filhas dependentes (`stocks`, `carts`, `cart_items`, `order_items`, `payments`, `order_status_history`, `attendance`) e `ON DELETE SET NULL` nas referências históricas (`orders.client_id`, `orders.updated_by`, `order_status_history.changed_by_worker`, `attendance.recorded_by`). Em `ProductModel`, se o produto já tiver vendas em `order_items`, realizar soft-delete (`is_active = false`) automaticamente com mensagem informativa. |
| **04** | 🔴 Crítico *(Novo — 2ª Revisão)* | `Backend/src/modules/order/order.repository.ts` (`getAll`, `getByClientId`, `enrichOrder`) | **Gargalo grave de N+1 Queries:** Para listar `N` pedidos, o backend disparava `1 + 2N` queries sequenciais no PostgreSQL (`1` para `orders`, `N` para `order_items` e `N` para `payments`). Em produção na Render, 50 pedidos geravam 101 queries pela rede. | Substituir no `OrderModel` por **1 única query SQL** usando `LEFT JOIN payments` e agregação `COALESCE(json_agg(...) FILTER (WHERE ...), '[]')`. |
| **05** | 🔴 Crítico | `Frontend/app/admin/src/App.tsx` | Os 5 Context Providers de dados envolviam a raiz do `<App />`, disparando chamadas autenticadas (`GET /orders`, `/products`, `/workers`, `/users`, `/inventory`) e pollings mesmo na tela `/login` sem token, gerando cascata de erros `401 Unauthorized`. | Com Zustand, remover todos os Providers do `App.tsx`. Iniciar o carregamento inicial e os intervalos de polling exclusivamente dentro do layout autenticado (`Template.tsx`), limpando todos os timers no `logout()`. |
| **06** | 🔴 Crítico | `Backend/src/modules/admin/admin.shemas.ts`, `admin.service.ts`, `Frontend/app/admin/src/services/employeeService.ts` e `CardEmployee.tsx` | O backend não aceitava `isActive` na atualização de funcionário, `toggleEmployeeStatus` lançava erro fixo no frontend e o menu do card exibia sempre `"Bloquear Funcionário"` mesmo quando o funcionário já estava bloqueado (`isActive === false`). | Aceitar `isActive?: boolean` em `PUT /v1/api/workers/:publicId` (e expor `PATCH /v1/api/workers/:publicId/status`), implementar `toggleEmployeeStatus` real na API e exibir dinamicamente `"Bloquear Funcionário"` ou `"Desbloquear Funcionário"`. |
| **07** | 🔴 Crítico *(Novo — 2ª Revisão)* | `Backend/src/modules/user/user.repository.ts`, `Frontend/app/admin/src/pages/content/Staff.tsx` e `CardCustomer.tsx` | `UserRepository.update` ignorava `isActive` no `SET`, descartando qualquer mudança de status. No frontend, `onBlockCustomer` em `Staff.tsx` executava apenas `console.log("Block customer:")`, e `CardCustomer` não tinha `ConfirmDialog` de confirmação ao excluir nem badge visual de Ativo/Bloqueado. | Persistir `is_active` no `UserModel` (`PUT /v1/api/users/:publicId` e `PATCH /v1/api/users/:publicId/status`), implementar `toggleCustomerStatus` em `customerService` + `useCustomerStore`, e adicionar badge de status + `ConfirmDialog` + loading em `CardCustomer.tsx`. |
| **08** | 🔴 Crítico | `Backend/src/modules/auth/auth.service.ts` e `auth.middleware.ts` | Funcionários ou clientes bloqueados (`is_active = false`) ainda conseguiam efetuar login, renovar tokens JWT e continuar autenticados. | Validar `is_active === true` no login, no refresh token e no `AuthMiddleware`, retornando `403 ACCOUNT_DEACTIVATED`. |
| **09** | 🟡 Médio | `Backend/src/modules/health/health.controller.ts` | O endpoint `/v1/api/health` retornava `200 OK` estático sem testar se o PostgreSQL estava online e pronto para receber queries. | Executar `SELECT 1` via `pool.query` dentro de `HealthService`, retornando status `online`, status do banco (`connected`), latência em `ms` e `timestamp` (ou `503` se o banco falhar). |
| **10** | 🟡 Médio | `Frontend/packages/utils/core/APIroutes.ts` | `API.Analytics.Dashboard` apontava para `${API_BASE}/dashboard` enquanto o backend expõe `${API_BASE}/analytics/dashboard`, além de não registrar `API.Health`. | Corrigir `API.Analytics.Dashboard = "${API_BASE}/analytics/dashboard"` e adicionar `API.Health = "${API_BASE}/health"`. |
| **11** | 🟡 Médio *(Novo — 2ª Revisão)* | `Frontend/app/admin/src/Router.tsx` (`LogoutRoute`) | Ao navegar para `/logout`, `LogoutRoute` chamava apenas `logoutService()` (removendo chaves do `localStorage`), sem limpar o estado em memória do app, mantendo o usuário autenticado na interface até recarregar a página. | Fazer `LogoutRoute` executar `useAuthStore.getState().logout()`, revogando token na API, limpando `localStorage`, parando pollings e resetando todas as stores Zustand em memória. |

---

## 3. Inventário Completo de Arquivos: Deletar, Criar e Modificar

### 3.1. O Que Será DELETADO 🗑️

#### Backend (Remoção do Drizzle ORM, Vercel e Arquitetura Antiga)
- `Backend/drizzle/` *(pasta inteira com migrations e snapshots SQL do Drizzle)*
- `Backend/drizzle.config.ts`
- `Backend/vercel.json`
- `Backend/api/tsconfig.json`
- `Backend/src/db/schema.ts`
- `Backend/src/db/SQL.sql`
- `Backend/src/config/database.ts`
- `Backend/src/config/env.ts` *(migrado para `Backend/core/config/env.ts`)*
- `Backend/src/core/` *(migrado e reorganizado em `Backend/core/`)*
- `Backend/src/infra/` *(migrado para `Backend/core/mail/` e `Backend/core/storage/`)*
- `Backend/src/shared/` *(migrado para `Backend/core/errors/`, `Backend/core/middlewares/`, `Backend/core/swagger/`)*
- `Backend/src/seed/` *(migrado para `Backend/core/database/seeder.ts` e `Database/seeds/`)*
- `Backend/src/routes/v1.route.ts` *(substituído pelo roteador central `Backend/api/index.ts`)*
- `Backend/src/modules/` *(pasta inteira com os 10 módulos antigos — reescritos em `Backend/api/{feature}/`)*
- `Backend/doc/` *(arquivos `.dio`/`.png` serão referenciados/documentados em `docs/`)*

#### Frontend (Remoção de todos os React Contexts e Doc Obsoleto)
- `Frontend/BACKEND-BLOCKERS.md` *(todos os bloqueios listados serão resolvidos)*
- `Frontend/app/admin/src/context/AuthContext.tsx`
- `Frontend/app/admin/src/context/OrderContext.tsx`
- `Frontend/app/admin/src/context/MenuContext.tsx`
- `Frontend/app/admin/src/context/EmployeeContext.tsx`
- `Frontend/app/admin/src/context/CustomerContext.tsx`
- `Frontend/app/admin/src/context/InventoryContext.tsx`
- `Frontend/app/client/src/context/AuthContext.tsx`
- `Frontend/app/client/src/context/CartContext.tsx`
- `Frontend/app/client/src/context/MenuContext.tsx`

---

### 3.2. O Que Será CRIADO ✨

#### A. Camada `Database/` (Baseada no Template PostgreSQL Docker)
- `Database/.env.example`
- `Database/Dockerfile` *(PostgreSQL 16 Alpine com scripts de inicialização automática)*
- `Database/docker-compose.yml` *(PostgreSQL 16 na porta `5432` + Adminer na porta `8080`)*
- `Database/package.json` *(Scripts `up`, `down`, `reset`)*
- `Database/README.md`
- `Database/database.sql` *(Schema completo: `pgcrypto`, 6 tipos `ENUM`, 13 tabelas em 3FN com `ON DELETE CASCADE` / `SET NULL`, índices compostos e triggers `atualizar_updated_at()`)*
- `Database/migrations/001_initial_schema.sql`
- `Database/seeds/01_seed_black_amber.sql`

#### B. Camada `Backend/` (Clean MVC Feature-Driven + `pg.Pool`)
- **Núcleo (`Backend/core/`):**
  - `Backend/core/config/env.ts`
  - `Backend/core/database/postgres.client.ts` *(Pool `pg`, SSL automático em produção/Render, `withTransaction`, `checkDatabaseHealth`)*
  - `Backend/core/database/migrator.ts` *(Executa DDL idempotente no boot)*
  - `Backend/core/database/seeder.ts` *(Executa seed idempotente no boot)*
  - `Backend/core/enums/index.ts` *(`WorkerRoles`, `OrderStatus`, `ProductCategory`, `PaymentMethod`, `PaymentStatus`, `AttendanceStatus`)*
  - `Backend/core/errors/index.ts` *(Mapeamento de erros de domínio para status HTTP + Global Error Handler + Logger Pino)*
  - `Backend/core/jwt/jwt.service.ts`
  - `Backend/core/security/security.utils.ts` *(Bcrypt + gerador de UUID e códigos `BAC-XXXX`)*
  - `Backend/core/mail/mail.service.ts` + `Backend/core/mail/templates/reset-password.tsx` *(Resend + React Email)*
  - `Backend/core/storage/bucket.provider.ts` *(S3/R2 retornando URL pública completa)*
  - `Backend/core/storage/image.service.ts` *(Otimização WebP via `sharp`)*
  - `Backend/core/middlewares/auth.middleware.ts` *(Valida JWT e verifica se o usuário permanece `is_active = true`)*
  - `Backend/core/middlewares/permission.middleware.ts` *(`requireAdmin`, `requireWorker`)*
  - `Backend/core/middlewares/security.middleware.ts` *(Headers ASVS, Rate Limit diferenciado para rotas de Auth vs API, Body Size Limit, Security Logger com mascaramento de segredos)*
  - `Backend/core/middlewares/upload.middleware.ts` *(Multer `memoryStorage`, limite 5 MB, MIME types permitidos)*
  - `Backend/core/middlewares/validation.middleware.ts` *(Middleware Zod tipado sem `any`)*
  - `Backend/core/swagger/swagger.ts`
- **Features Clean MVC (`Backend/api/`):**
  - `Backend/api/index.ts` *(Roteador central registrando todas as features)*
  - `Backend/api/health/` (`controllers/health.controller.ts`, `services/health.service.ts`, `routes/health.routes.ts`)
  - `Backend/api/auth/` (`controllers/auth.controller.ts`, `services/auth.service.ts`, `models/auth.model.ts`, `routes/auth.routes.ts`, `dtos/auth.dto.ts`, `validators/auth.validator.ts`)
  - `Backend/api/worker/` (`controllers/worker.controller.ts`, `services/worker.service.ts`, `models/worker.model.ts`, `routes/worker.routes.ts`, `dtos/worker.dto.ts`, `validators/worker.validator.ts`)
  - `Backend/api/user/` (`controllers/user.controller.ts`, `services/user.service.ts`, `models/user.model.ts`, `routes/user.routes.ts`, `dtos/user.dto.ts`, `validators/user.validator.ts`)
  - `Backend/api/product/` (`controllers/product.controller.ts`, `services/product.service.ts`, `models/product.model.ts`, `routes/product.routes.ts`, `dtos/product.dto.ts`, `validators/product.validator.ts`)
  - `Backend/api/inventory/` (`controllers/inventory.controller.ts`, `services/inventory.service.ts`, `models/inventory.model.ts`, `routes/inventory.routes.ts`, `dtos/inventory.dto.ts`, `validators/inventory.validator.ts`)
  - `Backend/api/order/` (`controllers/order.controller.ts`, `services/order.service.ts`, `models/order.model.ts`, `routes/order.routes.ts`, `dtos/order.dto.ts`, `validators/order.validator.ts`)
  - `Backend/api/cart/` (`controllers/cart.controller.ts`, `services/cart.service.ts`, `models/cart.model.ts`, `routes/cart.routes.ts`, `dtos/cart.dto.ts`, `validators/cart.validator.ts`)
  - `Backend/api/payment/` (`controllers/payment.controller.ts`, `services/payment.service.ts`, `models/payment.model.ts`, `routes/payment.routes.ts`, `dtos/payment.dto.ts`, `validators/payment.validator.ts`)
  - `Backend/api/analytics/` (`controllers/analytics.controller.ts`, `services/analytics.service.ts`, `models/analytics.model.ts`, `routes/analytics.routes.ts`, `dtos/analytics.dto.ts`)

#### C. Camada `Frontend/` (Zustand Stores + Health Gate + Spinners)
- **Em `Frontend/packages/ui-shared/components/`:**
  - `ServerWarmupGate.tsx`: Componente de barreira inicial que faz ping em `/v1/api/health`. Se responder imediatamente, libera a aplicação sem fricção; se falhar ou demorar (Render acordando o servidor), exibe tela temática com spinner, contador de tentativas, cronômetro e retry automático até receber `200 OK` (também oferece botão manual de tentar agora).
  - `ui/LoadingSpinner.tsx`: Spinner reutilizável (`Loader2` do `lucide-react`) com tamanhos `sm`, `md`, `lg`.
- **Em `Frontend/app/admin/src/stores/`:**
  - `useAuthStore.ts`
  - `useOrderStore.ts` *(com `pendingOrderIds` por pedido e controle de ciclo de vida do polling)*
  - `useMenuStore.ts` *(com `isCreating`, `updatingPublicId`, `deletingPublicId`, `togglingPublicId`)*
  - `useEmployeeStore.ts` *(com `isCreating`, `updatingPublicId`, `togglingPublicId`, `deletingPublicId`)*
  - `useCustomerStore.ts` *(com `updatingPublicId`, `togglingPublicId`, `deletingPublicId`)*
  - `useInventoryStore.ts` *(com `isSubmitting`, `updatingId`, `deletingId`)*
- **Em `Frontend/app/client/src/stores/`:**
  - `useAuthStore.ts`
  - `useCartStore.ts` *(com `pendingProductIds` por item e `isClearing`)*
  - `useMenuStore.ts`

#### D. Documentação (`docs/`, `AGENTS.md`, `mkdocs.yml`) e Deploy Render (`render.yaml`)
- `AGENTS.md` *(Raiz — diretrizes arquiteturais, invariantes, protocolo de tasks e deploy)*
- `mkdocs.yml` *(Raiz — configuração MkDocs Material)*
- `render.yaml` *(Raiz — Blueprint IaC completo para Render)*
- `docs/README.md`
- `docs/architecture.md`
- `docs/roteiro-testes.md`
- `docs/DocsProjeto/01-visao-geral/README.md`
- `docs/DocsProjeto/02-engenharia-requisitos/README.md`
- `docs/DocsProjeto/03-diagramas-arquiteturais/README.md`
- `docs/DocsProjeto/04-arquitetura-e-contratos/README.md`
- `docs/DocsProjeto/05-sprints-e-evolucao/README.md`
- `docs/DocsProjeto/06-qualidade-e-testes/README.md`
- `docs/DocsSprints/visao_geral.md`
- `docs/DocsSprints/sprints/sprint-refatoracao.md`
- `docs/DocsSprints/tasks/task_sprint_refatoracao.md`
- `docs/ModelosDeContratos/exemploContrato.json`

---

### 3.3. O Que Será MODIFICADO 🔧

- **Backend:**
  - `Backend/package.json` *(remover `drizzle-orm`, `drizzle-kit`, `postgres`; manter `pg`, `@types/pg`, `express`, `zod`, `bcrypt`, `jsonwebtoken`, `@aws-sdk/client-s3`, `sharp`, `resend`, `swagger-jsdoc`, `swagger-ui-express`; adicionar script `typecheck`)*
  - `Backend/tsconfig.json` *(incluir `src/**/*`, `api/**/*`, `core/**/*` com `strict: true`)*
  - `Backend/.env.exemple` -> `Backend/.env.example` *(atualizado com `BUCKET_PUBLIC_URL`, `CORS_ORIGIN`, `DATABASE_URL`, `DB_SSL`)*
  - `Backend/src/server.ts` *(CORS configurável por ambiente, Middlewares ASVS, rotas `/health`, `/v1/api/*`, `/api/*`, `/v1/docs`, `/api/docs`, execução de `migrator` + `seeder` no boot)*
  - `Backend/dockerfile` *(ajustado para build TypeScript e `node dist/src/server.js` sem Drizzle)*
  - `Backend/src/__tests__/test-app.ts` e `Backend/src/__tests__/integration.test.ts` *(atualizados para a nova estrutura `api/` e `core/`)*
- **Frontend — Configuração e Serviços:**
  - `Frontend/package.json`, `Frontend/app/admin/package.json`, `Frontend/app/client/package.json` *(adicionar `zustand`)*
  - `Frontend/.env.example` *(documentando `VITE_API_BASE_URL`)*
  - `Frontend/packages/utils/core/APIroutes.ts` *(adicionar `API.Health` e corrigir `API.Analytics.Dashboard`)*
  - `Frontend/app/admin/src/services/httpClient.ts` e `Frontend/app/client/src/services/httpClient.ts` *(correção de `FormData` + integração com stores)*
  - `Frontend/app/admin/src/services/employeeService.ts` e `customerService.ts` *(implementação real de `toggleEmployeeStatus` e `toggleCustomerStatus`)*
- **Frontend — Apps, Hooks e UI Loading:**
  - `Frontend/app/admin/src/App.tsx` e `Frontend/app/client/src/App.tsx` *(remoção dos Providers e envolvimento com `<ServerWarmupGate>`)*
  - `Frontend/app/admin/src/pages/Template.tsx` e `Frontend/app/client/src/pages/Template.tsx` *(início/parada do carregamento inicial e polling autenticado)*
  - `Frontend/app/admin/src/Router.tsx` *(ajustar `RequireAuth` e `LogoutRoute` para usar `useAuthStore`)*
  - `Frontend/app/admin/src/components/RouteProtector.tsx` e `Frontend/app/client/src/components/RouteProtector.tsx`
  - Todos os hooks em `Frontend/app/admin/src/hooks/*.ts` e `Frontend/app/client/src/hooks/*.ts` *(conectados às stores Zustand)*
  - Componentes de UI com feedback de carregamento (`LoadingSpinner` + disable): `ButtonPrimary.tsx`, `CardOrder.tsx`, `ButtonOrder.tsx`, `CardEmployee.tsx`, `CardCustomer.tsx`, `Staff.tsx`, `TableMenuRow.tsx`, `MenuItemFormPanel.tsx`, `TableInventoryRow.tsx`, `InventoryItemFormPanel.tsx`, `RegisterWorkerOverlay.tsx`, `RegisterClientOverlay.tsx`, `ProductCard.tsx`, `ProductCart.tsx`, `SummaryCart.tsx`, `Login.tsx`, `SignUp.tsx`.
  - Testes do Frontend (`Frontend/app/admin/src/__tests__/admin.test.tsx` e `Frontend/app/client/src/__tests__/client.test.tsx`).

---

## 4. Boas Práticas de Segurança, Implementação e UX

### 🔒 4.1. Segurança (Backend & Auth)
1. **Queries SQL 100% Parametrizadas (`$1, $2, ...`):** Zero interpolação de variáveis em strings SQL nos Models.
2. **Bloqueio Efetivo de Contas Inativas (`is_active = false`):** Validado no login, refresh token e requests autenticadas (`403 Forbidden`).
3. **Sanitização Estrita de Respostas:** Hashes de senha nunca saem dos Models/Services.
4. **Rate Limiting por Perfil de Rota:** Limite estrito em `/auth/login`, `/auth/register` e `/auth/forgotpassword/*` contra brute-force, e limite adequado nas rotas operacionais e `/health` (sem bloquear o warmup polling).
5. **CORS Configurável para Produção (Render):** Leitura de `CORS_ORIGIN` aceitando múltiplas origens separadas por vírgula (Admin Web + Client Web).
6. **Upload Seguro:** Validação de MIME type (`jpeg`, `png`, `webp`), limite de `5 MB` e re-encoding obrigatório via `sharp` para `.webp` (descartando payloads ocultos em metadados EXIF).

### ⚙️ 4.2. Implementação & Engenharia
1. **TypeScript Estrito (Zero `any`):** Tanto `Backend` quanto `Frontend` com `tsc --noEmit` limpo.
2. **Transações ACID Reais (`withTransaction`):** Criação de pedidos e simulação de checkout no carrinho executados atomicamente com `BEGIN ... COMMIT / ROLLBACK`.
3. **Eliminação de N+1 Queries:** Listagem de pedidos e carrinhos consolidada em queries com `JOIN` e `json_agg`.
4. **Soft Delete + Integridade Referencial:** Exclusão segura em cascata ou preservação histórica sem erro `23503`.

### 🎨 4.3. Experiência do Usuário no Frontend (UX) & Cold Start
1. **Gate de Aquecimento `/health` (`ServerWarmupGate.tsx`):**
   - Ao abrir Admin ou Client, dispara `GET /v1/api/health` imediatamente (com timeout de 5s por tentativa).
   - Enquanto o servidor na Render estiver acordando, exibe uma interface limpa com a identidade visual do Black Amber Coffee, ícone animado de café/carregamento, status atual (`"Acordando servidor e verificando banco de dados..."`), contador de tentativas e timer automático de reconexão a cada 3s.
   - Assim que `/health` retorna `200 OK` (com banco conectado), libera a tela de Login ou o Dashboard normalmente.
2. **Spinners Granulares por Ação (Anti Double-Click):**
   - Cada botão de ação (`START`, `READY`, `COMPLETE`, `DELETE`, `Adicionar ao Carrinho`, `+`/`-`, `Finalizar Compra`, `Cadastrar`, `Bloquear/Desbloquear`) mostra seu próprio `LoadingSpinner` apenas no item/botão clicado e desabilita cliques repetidos até a resposta da API.
3. **Estados de Erro e Recuperação:**
   - Mensagens claras em português com opção de "Tentar novamente" e `ConfirmDialog` antes de ações destrutivas (como excluir cliente, funcionário, produto ou pedido).

---

## 5. Ordem de Execução em 6 Fases

1. **Fase 1 — Infraestrutura de Banco (`Database/`):** Criar pasta `Database/` completa com `database.sql`, migrations, seeds, `Dockerfile` e `docker-compose.yml`.
2. **Fase 2 — Core do Backend (`Backend/core/` & remoção do Drizzle/Vercel):** Configurar `pg.Pool`, `migrator`, `seeder`, `env`, `jwt`, `security`, `mail`, `storage` (com URL pública completa), `middlewares` e `errors`.
3. **Fase 3 — Features do Backend em Clean MVC (`Backend/api/`):** Implementar todas as 10 features (`health`, `auth`, `worker`, `user`, `product`, `inventory`, `order`, `cart`, `payment`, `analytics`) + `server.ts` + atualizar testes.
4. **Fase 4 — Frontend Zustand + `/health` Gate + Loading UX:** Instalar `zustand`, criar `ServerWarmupGate` e `LoadingSpinner`, criar as 9 stores Zustand, remover pastas `context/`, corrigir `httpClient.ts` (`FormData`) e `APIroutes.ts`, atualizar hooks, rotas e todos os botões/cards/modais com loading.
5. **Fase 5 — Documentação (`docs/`, `AGENTS.md`, `mkdocs.yml`) e `render.yaml`:** Implantar e preencher o template completo de documentação + Blueprint da Render.
6. **Fase 6 — Verificação e Validação Completa (Quality Gate & Homologação):** Executar toda a bateria de auditorias, testes automatizados, validações de banco/UX e builds descritos na **Seção 6** abaixo antes de declarar a entrega concluída.

---

## 6. Fase de Verificação e Validação Completa (Quality Gate & Homologação End-to-End)

Após concluir as Fases 1 a 5, o sistema passará obrigatoriamente pelas **6 sub-etapas de verificação** abaixo, exigindo evidência real de saída (exit code `0`) para cada item:

### 6.1. Auditoria de Limpeza Arquitetural (Zero Resíduos Antigos)
- Varredura automatizada (`rg -n`) garantindo **zero referências** a `drizzle-orm`, `drizzle-kit`, `supabase`, `vercel.json`, `createContext` ou `useContext` nos diretórios `Backend/` e `Frontend/`.
- Confirmação em disco de que as pastas/arquivos legados (`Backend/drizzle/`, `Backend/drizzle.config.ts`, `Backend/vercel.json`, `Backend/src/modules/`, `Frontend/BACKEND-BLOCKERS.md`, `Frontend/app/admin/src/context/`, `Frontend/app/client/src/context/`) foram completamente removidos.
- Conferência de conformidade do Backend com a árvore Clean MVC do template (`Backend/api/{feature}/{controllers,services,models,routes,dtos,validators}`).

### 6.2. Validação Estática de Tipos e Qualidade de Código (`TypeScript Estrito`)
- **Backend:** Executar `npm run typecheck` (`tsc --noEmit`) dentro de `Backend/` — deve concluir com **0 erros** e **zero ocorrências de `any`**.
- **Frontend Admin:** Executar `npm run build:admin` (inclui `tsc -b`) e `npm run lint -w admin-app` — **0 erros**.
- **Frontend Client:** Executar `npm run build:client` (inclui `tsc -b`) e `npm run lint -w client-app` — **0 erros**.

### 6.3. Validação de Banco de Dados, Auto-Migrate, Auto-Seed e Integridade Referencial
- Validar o `migrator.ts` (`Database/database.sql`) e o `seeder.ts` em execução real/idempotente contra o PostgreSQL, confirmando:
  - Criação dos 6 tipos `ENUM`, 13 tabelas em 3FN, índices de performance e triggers `atualizar_updated_at()`.
  - Re-execução do boot sem duplicar registros ou falhar em constraints `UNIQUE`.
- Validar as constraints `ON DELETE CASCADE` e `ON DELETE SET NULL`: excluir produto, pedido, funcionário e cliente sem gerar erro `23503 foreign_key_violation` (com fallback automático para soft-delete quando um produto possuir histórico em `order_items`).
- Confirmar no `OrderModel` que a listagem de pedidos executa **1 única query SQL** (`LEFT JOIN payments` + `json_agg`), eliminando o problema de `1 + 2N` queries.

### 6.4. Bateria de Testes Automatizados (Backend & Frontend)
- **Backend (`npm test`):** Testes unitários e de integração cobrindo:
  - `GET /v1/api/health` (validando `SELECT 1` e resposta estruturada do PostgreSQL).
  - Fluxo `Auth` (`register`, `login`, `refresh-token`, `logout`, `forgotpassword/*` e bloqueio `403 ACCOUNT_DEACTIVATED` para conta com `is_active = false`).
  - CRUDs e fluxos completos de `Workers`, `Users`, `Products` (incluindo upload de imagem mockado/S3 e `stock`), `Inventory`, `Orders` (transições de status e histórico), `Cart` e `Payments/simulate` (transação atômica).
- **Frontend Admin (`npm test -w admin-app`):** Testes Vitest validando as stores Zustand (`useAuthStore`, `useOrderStore`, `useMenuStore`, `useEmployeeStore`, `useCustomerStore`, `useInventoryStore`), o componente `ServerWarmupGate` e a renderização das páginas principais.
- **Frontend Client (`npm test -w client-app`):** Testes Vitest validando `useAuthStore`, `useCartStore`, `useMenuStore`, `ServerWarmupGate` e o fluxo do cliente.

### 6.5. Validação End-to-End dos 11 Bugs Corrigidos e UX (Checklist Funcional)
- [ ] **Health Check & Cold Start Gate (`/v1/api/health`):** O Backend testa o PostgreSQL (`SELECT 1`) e retorna status + latência em `ms`; o `ServerWarmupGate` exibe a tela de aquecimento enquanto a API estiver indisponível/hibernando e libera automaticamente o acesso quando retornar `200 OK`.
- [ ] **Zero Requisições `401` na Tela de Login:** Abrir `/login` no Admin App não dispara chamadas prematuras para `/orders`, `/products`, `/workers`, `/users` ou `/inventory`.
- [ ] **Upload de Imagens (`FormData` + S3/R2):** `httpClient.ts` preserva o `multipart/form-data` ao enviar `FormData`, e o Backend persiste e retorna a URL pública completa da imagem WebP otimizada.
- [ ] **Bloqueio/Desbloqueio Real de Funcionários e Clientes:** Alternar `isActive` no Admin persiste no PostgreSQL, atualiza os cards/badges na hora (incluindo `ConfirmDialog` ao excluir cliente) e bloqueia o login da conta desativada com erro `403`.
- [ ] **Spinners de Carregamento (`LoadingSpinner`) e Anti Double-Click:** Todos os botões de mutação (`Sign In`, `START/READY/COMPLETE/DELETE`, `+`/`-` no carrinho, `Finalizar Compra`, formulários de cadastro/edição) exibem spinner individual e ficam desabilitados enquanto aguardam a API.
- [ ] **Logout Limpo (`/logout`):** Navegar para `/logout` ou clicar em Sair revoga a sessão, limpa `localStorage`, encerra os timers de polling e reseta todas as stores Zustand imediatamente.

### 6.6. Validação de Build de Produção e Prontidão para Deploy na Render
- Executar `npm run build` no `Backend` e validar o artefato compilado em `Backend/dist/src/server.js`.
- Executar `npm run build:admin` e `npm run build:client` no `Frontend`, validando a geração limpa dos bundles estáticos em `dist/`.
- Revisar `render.yaml` (serviços, build commands, start commands, healthCheckPath `/v1/api/health` e variáveis de ambiente) e verificar a consistência da documentação gerada em `docs/`, `AGENTS.md` e `mkdocs.yml`.

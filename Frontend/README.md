# Black Amber Coffee — Frontend Monorepo

> **Stack:** React 19 · TypeScript · Vite · React Router v7 · Tailwind CSS v4 · Lucide React · npm Workspaces

Este repositório contém o código-fonte completo do ecossistema frontend do **Black Amber Coffee**. O projeto foi estruturado como um **Monorepo** com npm Workspaces, onde múltiplas aplicações (`admin` e `client`) coexistem no mesmo repositório e compartilham código através de pacotes internos.

---

## 🏗️ Arquitetura do Projeto

```
black-amber-coffe-Front/
├── app/
│   ├── admin/          # Painel Administrativo (gerentes, caixas, baristas)
│   └── client/         # Aplicação do Consumidor (totem / web do cliente)
├── packages/
│   ├── ui-shared/      # Design System compartilhado (componentes visuais)
│   └── utils/          # Tipos globais, MockBD, helpers e rotas da API
├── docker-compose.yml
├── Dockerfile / Dockerfile.dev
└── package.json        # Raiz do workspace
```

---

## 📦 `packages/` — Módulos Compartilhados

### `packages/ui-shared/`

O **Design System** do projeto. Contém todos os componentes visuais genéricos e reutilizáveis, sem lógica de negócio.

**Componentes principais (`components/`):**

| Componente | Descrição |
|---|---|
| `CardAnalytics.tsx` | Card de métricas para dashboards/analytics |
| `CategoryCarousel.tsx` | Carrossel horizontal de categorias |
| `ChartAnalytics.tsx` | Gráfico de barras/linha para análises |
| `CompTIme.tsx` | Relógio/exibição de tempo em tempo real |
| `ConfirmDialog.tsx` | Modal de confirmação reutilizável |
| `FilterButton.tsx` | Botão de filtro com dropdown |
| `InfosUser.tsx` | Exibição de dados do usuário logado |
| `NotificationBell.tsx` | Ícone de notificação com badge |
| `OptionConfig.tsx` | Painel de opções de configuração |
| `OptionElipisses.tsx` | Menu de contexto (três pontos) |

**Primitivos (`components/ui/`):**

| Componente | Descrição |
|---|---|
| `AddAndRemove.tsx` | Botão ± para controle de quantidade (carrinho) |
| `ButtonAddProduct.tsx` | Botão de adicionar produto |
| `ButtonPrimary.tsx` | Botão primário padrão |
| `DestakTitle.tsx` | Título de destaque com estilo |
| `FormBoxText.tsx` | Campo de formulário estilizado |
| `LinkTextLogin.tsx` | Link de texto para telas de login |
| `NavItem.tsx` | Item de navegação lateral/horizontal |
| `PerfilCard.tsx` | Card de perfil do usuário/funcionário |
| `PerfilNav.tsx` | Barra de navegação de perfil |
| `SearchBar.tsx` | Barra de pesquisa |
| `StatusBadge.tsx` | Badge de status de pedidos (`PENDING`, `LATE`, etc.) |

> **Alias:** ambas as apps definem um alias Vite `'ui-shared'` no `vite.config.ts` que aponta direto para esta pasta.

---

### `packages/utils/`

Contém as **tipagens globais de domínio**, o **banco de dados em memória (MockBD)**, helpers e as rotas centralizadas da API.

```
packages/utils/
├── MockBD.ts           # Banco de dados em memória (seed de dados de teste)
├── core/
│   └── APIroutes.ts    # Todas as rotas da API centralizadas em um único arquivo
├── helpers/
│   └── currency.ts     # Formatação de moeda (BRL)
├── hooks/
│   └── useDragScroll.ts # Hook de drag-to-scroll para carrosseis
├── types/
│   ├── index.ts        # Barrel de exportação de todas as interfaces
│   ├── auth.ts         # AuthToken, LoginPayload, RefreshResponse
│   ├── inventory.ts    # InventoryItem, InventoryStatus
│   ├── order.ts        # Order, OrderItem, OrderStatus
│   ├── product.ts      # Product, ProductCategory
│   ├── user.ts         # User, UserProfile
│   ├── worker.ts       # Worker, WorkerProfile, WorkerRole
│   └── index.ts        # Reexporta todos os tipos (barrel)
└── index.ts            # Ponto de entrada do pacote
```

> **Nota de alinhamento 1:1 com o Backend:** As interfaces em `types/` refletem exatamente o schema do banco de dados de produção — incluindo `publicId` (UUID mascarado), dados aninhados como `profile.fullName` / `profile.avatarImage`, e status de pedido em uppercase (`PENDING`, `LATE`, `DONE`).

---

## 🖥️ `app/` — Aplicações

### `app/admin/` — Painel Administrativo

Aplicação **Vite + React** voltada para gerentes, caixas e baristas.

#### Páginas (`src/pages/`)

| Arquivo | Rota | Descrição |
|---|---|---|
| `Login.tsx` | `/login` | Tela de login com autenticação via API |
| `SignUp.tsx` | `/signup` | Criação de conta de funcionário |
| `Template.tsx` | `/` | Layout principal com sidebar |
| `Perfil.tsx` | `/perfil` | Página de perfil do funcionário logado |
| `Settings.tsx` | `/settings` | Configurações do sistema |
| `Support.tsx` | `/support` | Suporte técnico |
| `content/Dashboard.tsx` | `/dashboard` | Visão geral com widgets e analytics |
| `content/Analytics.tsx` | `/analytics` | Página dedicada a gráficos e métricas |
| `content/Menu.tsx` | `/menu` | Gerenciamento do cardápio (CRUD) |
| `content/LiveOrders.tsx` | `/orders` | Pedidos em tempo real (Kanban) |
| `content/Staff.tsx` | `/staff` | Gestão de funcionários e clientes |
| `content/Inventory.tsx` | `/inventory` | Controle de estoque *(mock — aguarda API)* |

#### Componentes com Lógica de Negócio (`src/components/`)

| Componente | Descrição |
|---|---|
| `tableMenu/TableMenu.tsx` | Tabela completa de produtos com filtros e categorias |
| `tableMenu/MenuItemFormPanel.tsx` | Painel lateral de criação/edição de produto |
| `tableMenu/TableMenuRow.tsx` | Linha individual da tabela de menu |
| `cardOrder/` | Cards Kanban de pedidos por status |
| `tableInventory/` | Tabela de inventário |
| `RegisterWorkerOverlay.tsx` | Modal de cadastro de funcionário |
| `RegisterClientOverlay.tsx` | Modal de cadastro de cliente |
| `SectionEmployee.tsx` | Seção de listagem de funcionários |
| `SectionCustomers.tsx` | Seção de listagem de clientes |
| `WidgetActiveStaff.tsx` | Widget de funcionários ativos no Dashboard |
| `WidgetInventoryAlerts.tsx` | Widget de alertas de estoque |
| `RouteProtector.tsx` | HOC de proteção de rotas autenticadas |

#### Services (`src/services/`)

A camada de comunicação com a API. Cada service já usa `authFetch` (com JWT Bearer + refresh automático).

| Service | Cobertura |
|---|---|
| `httpClient.ts` | `authFetch` — wrapper de `fetch` com JWT, refresh automático em 401 |
| `authService.ts` | Login, logout, refresh token, cadastro |
| `menuService.ts` | CRUD de produtos, upload de imagem |
| `orderService.ts` | Listar, criar, atualizar status de pedidos |
| `employeeService.ts` | Listar, criar, editar, toggle status de funcionários |
| `customerService.ts` | Listar clientes *(mock — aguarda API)* |
| `inventoryService.ts` | CRUD de estoque *(mock — aguarda API)* |
| `analyticsService.ts` | Métricas do dashboard *(mock — aguarda API)* |

#### Hooks (`src/hooks/`)

| Hook | Descrição |
|---|---|
| `useAuth.ts` | Acessa o contexto de autenticação |
| `useMenuItems.ts` | Estado e ações do cardápio |
| `useOrders.ts` | Estado e ações dos pedidos |
| `useEmployee.ts` | Estado e ações de funcionários |
| `useCustomers.ts` | Estado e ações de clientes *(mock)* |
| `useInventoryItems.ts` | Estado e ações de inventário *(mock)* |
| `useAnalytics.ts` | Dados de analytics *(mock)* |

#### Contextos (`src/context/`)

| Contexto | Descrição |
|---|---|
| `AuthContext.tsx` | Sessão do usuário logado (token, refresh, perfil) |
| `MenuContext.tsx` | Estado global do cardápio (produtos, categorias) |
| `OrderContext.tsx` | Estado global dos pedidos em tempo real |
| `EmployeeContext.tsx` | Estado global dos funcionários |

---

### `app/client/` — Aplicação do Consumidor

Aplicação **Vite + React** voltada para o cliente final (totem / web do pedido).

#### Páginas (`src/pages/`)

| Arquivo | Rota | Descrição |
|---|---|---|
| `Login.tsx` | `/login` | Login do cliente |
| `Template.tsx` | `/` | Layout base da experiência do cliente |
| `content/Home.tsx` | `/home` | Tela inicial com produtos e carrinho |

#### Componentes (`src/components/`)

| Componente | Descrição |
|---|---|
| `ProductCard.tsx` | Card de produto no catálogo |
| `DestakCard.tsx` | Card de produto em destaque |
| `ProductCart.tsx` | Item individual no carrinho |
| `SummaryCart.tsx` | Resumo do pedido / checkout |

#### Contextos e Hooks

| Item | Descrição |
|---|---|
| `context/AuthContext.tsx` | Sessão do cliente logado |
| `hooks/useAuth.ts` | Acessa o contexto de autenticação do cliente |

> **Services:** A pasta `src/services/` existe e está pronta para receber os services de pedido do cliente assim que a API estiver disponível.

---

## 📋 Estado Atual do Projeto

| Status | Item |
|---|---|
| ✅ | Interfaces 100% alinhadas com o schema do Backend de produção |
| ✅ | Autenticação JWT com refresh automático via `httpClient.ts` |
| ✅ | CRUD completo de Menu, Pedidos e Funcionários conectado à API real |
| ✅ | Upload de imagem de produto implementado (`menuService.ts`) |
| ✅ | Sistema de proteção de rotas (`RouteProtector.tsx`) |
| ✅ | Aplicação do cliente (`app/client`) com catálogo e carrinho funcionais |
| ✅ | Design System compartilhado (`ui-shared`) utilizado por ambas as apps |
| ✅ | Tipos e rotas de API centralizados em `packages/utils` |
| ⚠️ | `isActive` no update de worker — bloqueado pelo backend |
| ⚠️ | Inventário, Clientes e Analytics — endpoints inexistentes no backend (usando mock) |

> 📄 Para a lista completa de pendências do backend, consulte [BACKEND-BLOCKERS.md](./BACKEND-BLOCKERS.md).

---

## 🐳 Docker

O projeto possui suporte a Docker para facilitar o ambiente de desenvolvimento e produção.

```bash
# Subir ambiente de desenvolvimento via Docker Compose:
docker-compose up

# Build de produção via Dockerfile:
docker build -t black-amber-front .
```

Os arquivos disponíveis são:
- `Dockerfile` — imagem de produção
- `Dockerfile.dev` — imagem de desenvolvimento com hot-reload
- `docker-compose.yml` — orquestração dos containers
- `.env.example` — template das variáveis de ambiente necessárias

---

## 🚀 Como Executar (Local)

O projeto usa **npm Workspaces** para resolver as dependências entre pacotes internos automaticamente.

```bash
# 1. Instalar todas as dependências de todos os apps e packages:
npm install

# 2. Rodar o Painel Administrativo (http://localhost:5173):
npm run dev:admin

# 3. Rodar a Aplicação do Cliente (http://localhost:5174):
npm run dev:client

# 4. Rodar ambas ao mesmo tempo:
npm run dev:all
```

### Variáveis de Ambiente

Copie o `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

> **Aviso:** Após trocar de branch ou fazer grandes refatorações, caso encontre erros inesperados, limpe o cache do navegador na aba **Application → Clear Storage** do DevTools do Chrome. O projeto possui proteção automática contra conflitos de schema no `localStorage`, mas um clear manual é sempre recomendado em mudanças estruturais grandes.

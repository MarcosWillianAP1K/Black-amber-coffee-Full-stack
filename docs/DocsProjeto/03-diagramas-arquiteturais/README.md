# 03. Diagramas Arquiteturais — Black Amber Coffee

## 1. Visão de Contêineres (Render Cloud)

```mermaid
flowchart LR
    U_ADMIN["Gerente / Barista"] --> ADMIN_SITE["Static Site: black-amber-admin"]
    U_CLIENT["Cliente Web"] --> CLIENT_SITE["Static Site: black-amber-client"]

    ADMIN_SITE -->|"HTTPS REST + Bearer JWT"| API["Web Service: black-amber-api (Express 5 Clean MVC)"]
    CLIENT_SITE -->|"HTTPS REST + Bearer JWT"| API

    API -->|"pg.Pool SSL / SQL Parametrizado"| PG["PostgreSQL 16: black-amber-db"]
    API -->|"S3 PutObject / DeleteObject"| R2["Cloudflare R2 Storage"]
    API -->|"HTTP API + React Email"| RESEND["Resend Email Service"]
```

---

## 2. Fluxo de Inicialização (`/health` Warmup Gate) e Checkout Atômico

```mermaid
sequenceDiagram
    actor Client as Cliente (SPA React)
    participant Gate as ServerWarmupGate
    participant CartStore as useCartStore (Zustand)
    participant API as Backend Express Clean MVC
    participant DB as PostgreSQL 16 (pg.Pool)

    Client->>Gate: Abre aplicação Frontend
    loop Até HTTP 200 OK (a cada 3s)
        Gate->>API: GET /v1/api/health
        API->>DB: SELECT 1 (checkDatabaseHealth)
        alt Cold Start / 503
            API-->>Gate: HTTP 503 ou Timeout
            Gate-->>Client: Exibe tela de aquecimento (cronômetro + tentativas)
        else Servidor Pronto
            DB-->>API: Conexão saudavel
            API-->>Gate: HTTP 200 OK
        end
    end
    Gate-->>Client: Libera rotas e interface SPA

    Client->>CartStore: Clica em Complete Purchase
    CartStore->>API: POST /v1/api/payments/simulate (JWT Bearer)
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT orders + order_items + payments
    API->>DB: DELETE FROM cart_items
    API->>DB: COMMIT
    API-->>CartStore: HTTP 201 Pedido Confirmado
```

---

## 3. Diagrama Entidade-Relacionamento (DER Resumido)

```mermaid
erDiagram
    USERS ||--o| CARTS : possui
    USERS ||--o{ ORDERS : realiza
    CARTS ||--o{ CART_ITEMS : contem
    PRODUCTS ||--o{ CART_ITEMS : referencia
    PRODUCTS ||--o| INVENTORY : controla_estoque
    ORDERS ||--o{ ORDER_ITEMS : compoe
    PRODUCTS ||--o{ ORDER_ITEMS : item_pedido
    ORDERS ||--o| PAYMENTS : liquida
    WORKERS ||--o{ PASSWORD_RESETS : solicita
    USERS ||--o{ REFRESH_TOKENS : autentica
    WORKERS ||--o{ REFRESH_TOKENS : autentica
```

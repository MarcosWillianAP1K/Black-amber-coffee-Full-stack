# Relatório da Sprint — Refatoração Arquitetural Full-Stack

> **Sprint:** Refatoração Full-Stack  
> **Status:** Implementada (Pronta para Homologação Manual)  
> **Hub:** [visao_geral.md](../visao_geral.md)  
> **Cards:** [task_sprint_refatoracao.md](../tasks/task_sprint_refatoracao.md)  

---

## 1. Resumo das Entregas

1. **Banco de Dados (`Database/`):**
   - Remoção completa de Drizzle ORM e Supabase.
   - Criação de schema mestre PostgreSQL 16 (`Database/database.sql`, `migrations/001_initial_schema.sql`, `seeds/01_seed_black_amber.sql`) + Docker Compose com PostgreSQL 16 e Adminer.
2. **Back-end (`Backend/`):**
   - Migração completa para **Clean MVC Feature-Driven** (`Backend/api/{feature}` + `Backend/core/`) usando `pg.Pool`.
   - Adição de auto-migrate e auto-seed idempotentes para ambiente Render.
   - Correção de bugs críticos: rota `PATCH /:publicId/status` para bloqueio/desbloqueio de funcionários e clientes, validação contínua de `is_active` no `AuthMiddleware`, montagem de URL pública completa no `bucket.provider.ts`, agregação `json_agg` sem N+1 no `OrderModel`, transição `hold` (`em_preparo -> criado`) e soft-delete seguro para produtos em pedidos históricos.
3. **Front-end (`Frontend/`):**
   - Substituição de todos os 9 `React.Context` por stores **Zustand** (`admin/src/stores/*` e `client/src/stores/*`), preservando a estrutura modular existente.
   - Adição do componente `ServerWarmupGate` garantindo verificação de `GET /v1/api/health` antes da entrada (cold start Render).
   - Adição de `LoadingSpinner` granular em botões de pedidos, cardápio, carrinho, checkout, inventário, login/cadastro e moderação de equipe/clientes.
   - Correção do bug de `Content-Type` ao enviar `FormData` nos `httpClient.ts` e integração das rotas `/workers/:id/status`, `/users/:id/status` e `/analytics/dashboard`.
4. **Infraestrutura & Documentação:**
   - Adição de `render.yaml` para provisionamento completo na Render e criação da documentação padronizada em `docs/`, `AGENTS.md` e `mkdocs.yml`.

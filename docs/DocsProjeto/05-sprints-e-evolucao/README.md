# 05. Sprints, Evolução e Decisões Arquiteturais (ADRs)

## 1. Histórico Evolutivo
- **Fase Legada (Pré-Refatoração):** API monolítica em `Backend/src` acoplada ao Drizzle ORM, config de serverless para Vercel (`vercel.json`), credenciais orientadas ao Supabase, bug de N+1 em pedidos, `httpClient` corrompendo `multipart/form-data` e 9 Context Providers encadeados no Frontend.
- **Sprint de Refatoração Completa:** Reestruturação integral para portfólio profissional e deploy unificado na Render.

## 2. Decisões Arquiteturais Registradas (ADRs)
- **ADR-01 — PostgreSQL 16 + `pg.Pool` + SQL Migrations vs Drizzle/Prisma:**
  - *Decisão:* Adoção do driver oficial `pg` sobre migrações SQL declarativas em `Database/`.
  - *Motivo:* Alinhamento estrito ao template corporativo Clean MVC Feature-Driven, zero overhead de geração/runtime de ORM e controle explícito sobre transações (`withTransaction`), joins com `json_agg` e triggers PostgreSQL.
- **ADR-02 — Zustand Stores mantendo estrutura original do Frontend:**
  - *Decisão:* Remover 100% dos arquivos `context/` substituindo-os por stores Zustand em `Frontend/app/{admin,client}/src/stores/`, preservando `pages/`, `components/`, `hooks/` e `services/`.
  - *Motivo:* Reduzir complexidade de migração mantendo interfaces dos hooks compatíveis, eliminar *provider hell* e habilitar estados granulares por item sem re-renderização em árvore.
- **ADR-03 — Auto-Migrate e Auto-Seed Idempotentes no Startup (`Render Blueprint`):**
  - *Decisão:* Habilitar `AUTO_MIGRATE=true` e `AUTO_SEED=true` no `render.yaml` com scripts DDL/DML idempotentes e fallback embutido.
  - *Motivo:* Permitir que o plano gratuito na Render suba o PostgreSQL + API + Frontends de forma autônoma em qualquer novo provisionamento.

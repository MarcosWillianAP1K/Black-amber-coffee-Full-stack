# Cards de Tarefas — Sprint de Refatoração Full-Stack (PostgreSQL 16 + Clean MVC + Zustand + Render)

> **Diretrizes e Quality Gate:** [AGENTS.md](../../../AGENTS.md)  
> **Hub de Sprints:** [visao_geral.md](../visao_geral.md)  
> **Nota de Homologação:** Todas as caixas `[ ]` permanecem desmarcadas para validação final do usuário.

---

### BD: Schema Mestre PostgreSQL 16, Migrações e Seed Inicial (Tipo: Feature)

* **Tipo:** Feature
* **Responsável:** Equipe Backend/BD
* **Fronteira de Arquivos:** `Database/database.sql`, `Database/migrations/001_initial_schema.sql`, `Database/seeds/01_seed_black_amber.sql`, `Database/docker-compose.yml`, `Database/Dockerfile`
* **Ordem de Execução / Dependência:** DEVE FAZER PRIMEIRO. Define a estrutura relacional antes da implementação dos Models do Backend.
* **Requisitos:** RNF-01, RNF-04
* **Referência Documentação:** [docs/architecture.md](../../architecture.md) (Seção 2)
* **Descrição:** Remover qualquer dependência de Supabase/Drizzle criando schema relacional PostgreSQL 16 com 6 ENUMs, 13 tabelas normalizadas, triggers `atualizar_updated_at()`, índices e carga inicial determinística para administrador, barista, cliente, cardápio e inventário.
* **Critérios de Aceite:**
  * [ ] Script SQL executa de forma idempotente sem erros em PostgreSQL 16.
  * [ ] Docker Compose sobe PostgreSQL na porta `5432` e Adminer na porta `8080`.
  * [ ] Seed cria credenciais padrão sem duplicar registros em reexecuções.

---

### Back: Refatoração para Clean MVC Feature-Driven com pg.Pool (Tipo: Feature)

* **Tipo:** Feature
* **Responsável:** Equipe Backend
* **Fronteira de Arquivos:** `Backend/core/**`, `Backend/api/{health,auth,worker,user,product,inventory,order,cart,payment,analytics}/**`, `Backend/src/server.ts`, `Backend/package.json`
* **Ordem de Execução / Dependência:** Após criação do schema `Database/`.
* **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RNF-01, RNF-02
* **Referência Documentação:** [docs/architecture.md](../../architecture.md) (Seção 3)
* **Descrição:** Reestruturar toda a API em ESM TypeScript estrito (`NodeNext`) usando `pg.Pool` diretamente, `withTransaction` no checkout, auto-migrate/auto-seed na inicialização, Swagger atualizado e zero `any`.
* **Critérios de Aceite:**
  * [ ] Nenhum arquivo ou dependência de Drizzle ou Vercel permanece no Backend.
  * [ ] `GET /v1/api/health` valida conexão real ao banco retornando HTTP `200` ou `503`.
  * [ ] `npm run typecheck`, `npm test` e `npm run build` passam com código de saída `0`.

---

### Back: (Fix) Bloqueio de Contas, URL R2 Completa, Hold de Pedidos e Anti-N+1 (Tipo: Fix)

* **Tipo:** Fix
* **Responsável:** Equipe Backend
* **Fronteira de Arquivos:** `Backend/core/middlewares/auth.middleware.ts`, `Backend/core/storage/bucket.provider.ts`, `Backend/api/worker/**`, `Backend/api/user/**`, `Backend/api/order/**`, `Backend/api/product/**`
* **Ordem de Execução / Dependência:** Integrado à refatoração Clean MVC.
* **Requisitos:** RN-01, RN-02, RN-03
* **Referência Documentação:** [docs/DocsProjeto/04-arquitetura-e-contratos/README.md](../../DocsProjeto/04-arquitetura-e-contratos/README.md)
* **Descrição:** Implementar rotas `PATCH /workers/:publicId/status` e `PATCH /users/:publicId/status`, verificar `is_active` em tempo real no `AuthMiddleware` (`403 ACCOUNT_DEACTIVATED`), corrigir URL pública R2 via `buildPublicAssetUrl`, permitir transição `em_preparo -> criado` (`hold`), agregar itens de pedidos via `json_agg` e aplicar soft-delete seguro para produtos vinculados a pedidos.
* **Critérios de Aceite:**
  * [ ] Usuário bloqueado recebe `403` no login e em rotas autenticadas.
  * [ ] Imagens enviadas retornam URL pública completa e exibível nos frontends.
  * [ ] Listagem de pedidos executa consulta agregada sem loop N+1.

---

### Front: Migração Context para Zustand, ServerWarmupGate e Loading UX (Tipo: Feature)

* **Tipo:** Feature
* **Responsável:** Equipe Frontend
* **Fronteira de Arquivos:** `Frontend/packages/ui-shared/components/ServerWarmupGate.tsx`, `Frontend/packages/ui-shared/components/ui/LoadingSpinner.tsx`, `Frontend/app/admin/src/stores/**`, `Frontend/app/client/src/stores/**`, `Frontend/app/{admin,client}/src/hooks/**`, `Frontend/app/{admin,client}/src/services/httpClient.ts`
* **Ordem de Execução / Dependência:** Após definição dos contratos `/v1/api/*`.
* **Requisitos:** RF-02, RF-05, RF-07, RNF-01, RNF-03
* **Referência Documentação:** [docs/architecture.md](../../architecture.md) (Seção 4)
* **Descrição:** Remover pastas `context/` preservando a árvore atual do Frontend, criar 9 stores Zustand com flags granulares (`pendingOrderIds`, `pendingProductIds`, `pendingEmployeeIds`, `pendingCustomerIds`), corrigir envio de `FormData` em ambos os `httpClient.ts`, ativar bloqueio de clientes/funcionários na UI e proteger `App.tsx` com `ServerWarmupGate` consumindo `GET /v1/api/health`.
* **Critérios de Aceite:**
  * [ ] Nenhum uso de `createContext` ou `useContext` permanece no código Frontend.
  * [ ] Apps exibem tela de aquecimento até `/v1/api/health` retornar HTTP `200`.
  * [ ] Botões exibem `LoadingSpinner` e ficam bloqueados durante requisições em andamento.

---

### Back/Front: Validação Automatizada, Documentação Técnica e Blueprint Render (Tipo: Docs)

* **Tipo:** Docs
* **Responsável:** Equipe Full-Stack
* **Fronteira de Arquivos:** `render.yaml`, `AGENTS.md`, `mkdocs.yml`, `README.md`, `Backend/README.md`, `Backend/ROUTE_MAP.md`, `docs/**`
* **Ordem de Execução / Dependência:** Etapa final de consolidação e entrega.
* **Requisitos:** RNF-01, RNF-04
* **Referência Documentação:** [docs/roteiro-testes.md](../../roteiro-testes.md)
* **Descrição:** Criar `render.yaml` contemplando PostgreSQL 16 + API Web Service + Static Sites (Admin e Client), configurar governança em `AGENTS.md` e `docs/`, e executar o Quality Gate completo de tipos, lint, testes e builds.
* **Critérios de Aceite:**
  * [ ] Todos os builds (`Backend`, `admin-app`, `client-app`), lints e testes Vitest executam com exit code `0`.
  * [ ] Blueprint `render.yaml` declara corretamente banco, variáveis de ambiente e rotas SPA.
  * [ ] Documentação descreve fielmente a arquitetura PostgreSQL + Clean MVC + Zustand implementada.

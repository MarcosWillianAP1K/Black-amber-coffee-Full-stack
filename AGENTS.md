# Diretrizes e Contexto do Projeto — Black Amber Coffee

> **Documento Mestre do Projeto:** [01-visao-geral](./docs/DocsProjeto/01-visao-geral/README.md)  
> **Regras Arquiteturais:** [docs/architecture.md](./docs/architecture.md)  
> **Hub de Sprints e Cards de Tarefas:** [docs/DocsSprints/visao_geral.md](./docs/DocsSprints/visao_geral.md)  
> **Roteiro de Testes e Homologação:** [docs/roteiro-testes.md](./docs/roteiro-testes.md)  

---

## 1. Visão Arquitetural Macro (3 Camadas)

1. **Banco de Dados (`Database/`):** PostgreSQL 16 puro com `database.sql` consolidado, migrações SQL idempotentes sequenciais (`Database/migrations/001_*.sql`) e seed determinística (`Database/seeds/01_seed_black_amber.sql`). Suporte completo via Docker + Adminer e `AUTO_MIGRATE` / `AUTO_SEED` no startup do Backend.
2. **Back-end (`Backend/`):** API RESTful desenvolvida sob o padrão **Clean MVC + Fat Service Feature-Driven** (`Backend/api/{feature}/{routes,controllers,services,models,validators,dtos}` + `Backend/core/`), usando **`pg.Pool`** diretamente (sem Drizzle e sem Supabase), TypeScript ESM estrito (`NodeNext`, zero `any`), documentação OpenAPI/Swagger, Helmet, Rate Limiter, upload WebP via Sharp + Cloudflare R2 e respostas padronizadas no **Envelope Pattern** (`{ data, message }`).
3. **Front-end (`Frontend/`):** Monorepo Vite + React 19 + Tailwind CSS v4 mantendo a organização modular existente (`app/admin`, `app/client`, `packages/ui-shared`, `packages/utils`), com **Zustand** em `src/stores/` (zero React `Context`), **`ServerWarmupGate`** realizando verificação obrigatória em `/v1/api/health` ao abrir o app (tolerante a cold start da Render) e **feedback visual de carregamento** (`LoadingSpinner`) em ações assíncronas.

---

## 2. Regras Invioláveis do Ecossistema

- **RN01 — TypeScript Estrito:** Proibido o uso de `any` ou casts inseguros em qualquer camada (`Backend` e `Frontend`).
- **RN02 — Validação de Entrada (Zod):** Todo payload recebido na API passa por `validateSchemaMiddleware` nas rotas. Dados inválidos retornam `400 Bad Request` ou `422 Unprocessable Entity`.
- **RN03 — Segurança & Controle de Acesso:** Autenticação via JWT Bearer + Refresh Token rotativo, validação de `is_active` diretamente no banco (`403 ACCOUNT_DEACTIVATED` para contas bloqueadas) e proteção de rotas administrativas com `requireAdmin()` / `requireWorker()`.
- **RN04 — Integridade Transacional:** Operações críticas multi-etapas (como checkout de pagamento + criação de pedido + itens + limpeza do carrinho) executam dentro de `withTransaction()` com `BEGIN / COMMIT / ROLLBACK`.
- **RN05 — Exclusão Segura:** Produtos referenciados em pedidos históricos preservam integridade referencial via fallback de soft-delete (`is_active = false`), evitando quebra de histórico financeiro.
- **RN06 — Comandos Não-Bloqueantes & Evidência Antes de Afirmações:** Sempre executar testes e builds com saída limpa antes de declarar entregas concluídas.

---

## 3. Padrões Técnicos e Nomenclatura

- **Backend:** Métodos e propriedades em `camelCase`; queries SQL parametrizadas (`$1`, `$2`, ...) no `model`; regras de negócio isoladas no `service`; extração/resposta HTTP no `controller`. Rotas sob `/v1/api/*` (com alias `/api/*`).
- **Frontend:** Stores em `src/stores/` consumidas pelos hooks em `src/hooks/`. Botões de mutação exibem `LoadingSpinner` e ficam desabilitados durante requisições em voo (`pendingOrderIds`, `pendingProductIds`, `pendingEmployeeIds`, `pendingCustomerIds`, `isSubmitting`).
- **Testes Automatizados:** **Vitest** (+ **Supertest** no Backend e **Testing Library** no Frontend).

---

## 4. Homologação Soberana do Usuário

- **Critérios de Aceite Sempre Desmarcados (`[ ]`):** É terminantemente **proibido** marcar caixas `[x]` nos cards em `docs/DocsSprints/`. Todos os critérios de aceite permanecem `[ ]` para conferência e homologação manual do usuário.

---

## 5. Padrão de Engenharia de Cards e Tasks (GitHub Projects & Sprints)

### 5.1. Nomenclatura e Tipagem Canônica
`Área: [Título Claro e Conciso da Tarefa] (Tipo: [Feature | Validação | Docs | Fix])`

- **Prefixos:** `BD:`, `Back:`, `BD/Back:`, `Front:`, `Infra:`, `Docs:`.
- **Para correções:** `Área: (Fix) [Título Claro] (Tipo: Fix)`.

### 5.2. Template Obrigatório de Card (8 Campos)
1. `Tipo`
2. `Responsável`
3. `Fronteira de Arquivos`
4. `Ordem de Execução / Dependência`
5. `Requisitos`
6. `Referência Documentação`
7. `Descrição`
8. `Critérios de Aceite` (sempre `[ ]`)

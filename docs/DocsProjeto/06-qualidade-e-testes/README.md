# 06. Qualidade, Testes e Conformidade — Black Amber Coffee

## 1. Estratégia de Testes Automatizados
- **Backend (`Backend/api/__tests__/integration.test.ts`):**
  - Testes de integração com **Vitest + Supertest** validando health check (conectado vs degradado), segurança (`401`/`403 ACCOUNT_DEACTIVATED`), registro/login, bloqueio administrativo (`PATCH /status`), criação de pedidos, upload WebP (`FormData`), checkout transacional e analytics.
- **Frontend Admin (`Frontend/app/admin/src/__tests__/admin.test.tsx`):**
  - Testes unitários de rotas, store Zustand de autenticação/equipe/clientes (`useAuthStore`, `useEmployeeStore`, `useCustomerStore`) e comportamento do `ServerWarmupGate` com mock de HTTP `503 -> 200`.
- **Frontend Client (`Frontend/app/client/src/__tests__/client.test.tsx`):**
  - Testes de rotas, `useAuthStore`, rastreamento granular de carregamento em `useCartStore` (`pendingProductIds`) e `ServerWarmupGate`.

## 2. Quality Gates de Entrega
Nenhuma alteração é aceita sem aprovação integral:
1. Auditoria zero resíduos legados (`drizzle`, `supabase`, `createContext`, `useContext`) e zero `any`.
2. `Backend`: `npm run typecheck`, `npm test`, `npm run build`.
3. `Frontend`: `npm run lint`, `npm test`, `npm run build` em ambos os workspaces (`admin-app` e `client-app`).

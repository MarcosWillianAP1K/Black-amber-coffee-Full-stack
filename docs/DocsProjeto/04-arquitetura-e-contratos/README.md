# 04. Arquitetura e Contratos de Integração — Black Amber Coffee

## 1. Padrões Arquiteturais Adotados
- **Backend Clean MVC Feature-Driven (`Backend/api/<feature>/`):**
  - `routes/` -> aplica rate-limit, autenticação, RBAC e validação Zod.
  - `controllers/` -> lê dados da requisição HTTP e retorna o envelope JSON padronizado.
  - `services/` -> concentra regras de negócio, invariantes, orquestração transacional e conversão de DTOs.
  - `models/` -> executa exclusivamente SQL parametrizado via `pg.Pool`.
- **Frontend Monorepo + Zustand (`Frontend/app/{admin,client}`):**
  - Mantém as pastas de UI, hooks, pages e services da aplicação original.
  - Substitui todos os React Contexts por stores **Zustand** (`src/stores/`) consumidas pelos hooks em `src/hooks/`.

## 2. Envelope Pattern e Contratos REST
As respostas da API seguem formato previsível com mensagem e payload tipado:

```json
{
  "data": {
    "publicId": "8f12a94c-7f12-4c8d-9311-000000000001",
    "status": "em_preparo"
  },
  "message": "Status atualizado com sucesso."
}
```

Erros seguem estrutura uniforme via `globalErrorHandler`:
```json
{
  "error": "ACCOUNT_DEACTIVATED",
  "message": "Sua conta está desativada. Entre em contato com o administrador."
}
```

## 3. Lista de Boas Práticas Aplicadas

### Segurança
1. Queries 100% parametrizadas com `pg` (`$1`, `$2`).
2. `helmet()` + `cors()` restrito a `CORS_ORIGIN` configurado.
3. Bloqueio de contas (`is_active = false`) validado diretamente no banco em cada chamada autenticada.
4. Upload seguro em memória (limite 5MB, MIME validado) com reprocessamento obrigatório via `sharp` para WebP (removendo metadados EXIF e cargas maliciosas).
5. Rotação de Refresh Tokens e invalidação no logout.

### Experiência do Usuário (Frontend)
1. **Health Warmup Gate:** Previne falhas e telas de erro no primeiro acesso quando o serviço na Render está hibernando.
2. **Loading Granular:** Operações por item (`pendingOrderIds`, `pendingProductIds`, `pendingEmployeeIds`, `pendingCustomerIds`) mostram spinner apenas no elemento clicado.
3. **Diálogos de Confirmação:** Exclusões de clientes, funcionários e itens passam por `ConfirmDialog`.
4. **Reset Limpo de Sessão:** Ao deslogar ou expirar sessão (`401`), todas as stores param o polling e zeram caches locais.

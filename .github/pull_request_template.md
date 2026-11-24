## 📌 Descrição da Entrega
<!-- Resumo claro do que foi implementado, corrigido ou validado neste PR -->

## 🔗 Cards Relacionados
- Closes # <!-- número da issue ou título do card -->

## 🛠️ Alterações por Camada
- [ ] **Database (`Database/`):** Migrações SQL DDL/DML, seeds ou triggers PostgreSQL 16
- [ ] **Backend (`Backend/`):** Rotas, Controllers, Services, Models (`pg.Pool`) ou Middlewares
- [ ] **Frontend (`Frontend/`):** Páginas, Componentes, Hooks, Stores Zustand ou UI compartilhada
- [ ] **Docs & Infra (`docs/`, `.github/`, `render.yaml`):** Documentação técnica, pipelines ou contratos

## 🧪 Quality Gate (Checklist Obrigatório)
- [ ] Backend: `npm run typecheck`, `npm test` e `npm run build` passando sem erros (zero `any`)
- [ ] Frontend: `npm run lint`, `npm run test` e `npm run build` verdes em `admin-app` e `client-app`
- [ ] Respostas da API padronizadas no **Envelope Pattern** (`{ data, message }`)
- [ ] Sem vazamento de credenciais ou arquivos `.env` nos commits
- [ ] Critérios de aceite em `docs/DocsSprints/` preservados desmarcados (`[ ]`) para homologação do usuário

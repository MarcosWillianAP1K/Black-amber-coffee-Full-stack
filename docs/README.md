# Documentação Técnica — Black Amber Coffee

Central de documentação de engenharia, contratos REST, modelagem PostgreSQL, diagramas arquiteturais, planejamento de sprints e roteiro de testes do sistema **Black Amber Coffee**.

---

## Estrutura da Pasta `docs/`

```text
docs/
├── architecture.md           # Arquitetura Clean MVC (Back), Zustand + WarmupGate (Front) e PostgreSQL 16
├── roteiro-testes.md         # Quality Gate automatizado e casos de teste manuais E2E
│
├── DocsSprints/              # Gestão de Sprints e Cards de Tarefas
│   ├── visao_geral.md        # Hub de navegação das sprints
│   ├── tasks/                # Cards detalhados por sprint (checklists preservados para homologação)
│   └── sprints/              # Relatórios e retrospectivas de entrega
│
├── DocsProjeto/              # Documentação modular por disciplina
│   ├── 01-visao-geral/       # Contexto, objetivos, personas e escopo
│   ├── 02-engenharia-requisitos/ # RF, RNF, RN e critérios DoD
│   ├── 03-diagramas-arquiteturais/ # Diagramas Mermaid (C4, Sequência, DER)
│   ├── 04-arquitetura-e-contratos/ # Envelope Pattern, segurança e padrões UX
│   ├── 05-sprints-e-evolucao/ # Histórico evolutivo e ADRs (PostgreSQL, Clean MVC, Zustand, Render)
│   └── 06-qualidade-e-testes/ # Estratégia de QA e Quality Gates
│
└── ModelosDeContratos/       # Modelos JSON canônicos da API
```

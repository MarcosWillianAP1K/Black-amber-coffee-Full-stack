---
name: Card de Feature
about: Nova funcionalidade de negócio, endpoint REST, tabela ou componente visual
title: "Área: [Título da Feature] (Tipo: Feature)"
labels: ["feature"]
---

### Área: [Título da Feature] (Tipo: Feature)

* **Tipo:** Feature
* **Responsável:** @usuario <!-- ou: Não atribuído (Backlog Arquitetural) -->
* **Fronteira de Arquivos:** `Database/...`, `Backend/api/...`, `Frontend/app/...`
* **Ordem de Execução / Dependência:** Independente <!-- ou: DEVE FAZER PRIMEIRO | FAZ DEPOIS DE (Tarefa X) -->
* **Requisitos:** RFxx, RNxx, RNFxx
* **Referência Documentação:** docs/architecture.md
* **Descrição:** [Explicação técnica detalhada da mecânica real do que será construído e em qual camada]
* **Critérios de Aceite:**
  * [ ] [Critério 1 mensurável e testável]
  * [ ] [Critério 2 com códigos HTTP, regras de validação Zod ou feedback de carregamento esperado]
  * [ ] [Critério 3 de conformidade estrita com TypeScript sem `any` e testes Vitest verdes]

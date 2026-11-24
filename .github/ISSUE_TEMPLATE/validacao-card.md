---
name: Card de Validação e Testes
about: Criação ou expansão de testes automatizados e auditorias de qualidade/segurança
title: "Área: [Título da Validação] (Tipo: Validação)"
labels: ["tests"]
---

### Área: [Título da Validação] (Tipo: Validação)

* **Tipo:** Validação
* **Responsável:** @usuario
* **Fronteira de Arquivos:** `Backend/api/__tests__/...`, `Frontend/app/.../src/__tests__/...`
* **Ordem de Execução / Dependência:** Após entrega dos endpoints ou componentes alvo
* **Requisitos:** RNFxx
* **Referência Documentação:** docs/roteiro-testes.md
* **Descrição:** [Especificação dos cenários positivos, erros esperados (400/401/403/404) e mocks controlados a validar no Vitest]
* **Critérios de Aceite:**
  * [ ] [Todos os cenários críticos cobertos no Vitest]
  * [ ] [Execução limpa em modo single-run (`vitest run`) com código de saída 0]

# 01. Visão Geral do Produto — Black Amber Coffee

## 1. Contexto e Problema
O **Black Amber Coffee** é uma plataforma full-stack para operação completa de uma cafeteria digital moderna, integrando o autoatendimento dos clientes (cardápio, carrinho e checkout) e a gestão operacional em tempo real da equipe (fila de preparo, estoque, equipe e indicadores financeiros).

O código legado apresentava gargalos críticos para uso em produção e demonstração de portfólio: dependência acoplada ao Supabase/Drizzle ORM, scripts de infraestrutura quebrados para deploy serverless na Vercel, múltiplos `React.Context` encadeados causando re-renderizações e ausência de proteção contra *cold start* em servidores gratuitos como a Render.

## 2. Proposta de Valor e Objetivos
- **Independência de Infraestrutura:** Banco PostgreSQL 16 gerenciado via SQL puro e `pg.Pool`, pronto para Docker local e PostgreSQL gerenciado na Render.
- **Arquitetura de Nível Corporativo:** Backend refatorado para **Clean MVC + Fat Service Feature-Driven** com tipagem TypeScript estrita (zero `any`).
- **Experiência do Usuário Resiliente:** **ServerWarmupGate** validando `GET /v1/api/health` antes da entrada, spinners granulares por operação e gerenciamento reativo com **Zustand**.

## 3. Público-Alvo e Personas
| Persona | Aplicativo | Principais Responsabilidades |
| :--- | :--- | :--- |
| **Cliente** | `Frontend/app/client` | Navegar pelo cardápio, filtrar categorias, montar carrinho, informar observações e concluir pedidos. |
| **Barista / Atendente** | `Frontend/app/admin` | Acompanhar pedidos em tempo real (`criado` -> `em_preparo` -> `pronto` -> `finalizado`). |
| **Gerente / Admin** | `Frontend/app/admin` | Gerir equipe (`workers`), bloquear/desbloquear clientes e funcionários, controlar cardápio (upload WebP), estoque e métricas financeiras. |

## 4. Escopo da Entrega Atual
- **In-Scope:** Autenticação JWT + Refresh Token rotativo, gestão completa de usuários/funcionários (`PATCH /:publicId/status`), catálogo com otimização WebP para Cloudflare R2, estoque com movimentações, carrinho persistente, checkout transacional atômico, analytics e Blueprint Render (`render.yaml`).
- **Out-of-Scope:** Integração com adquirentes bancários reais (o módulo de pagamentos simula aprovação em fluxo atômico rastreado) e aplicativo mobile nativo.

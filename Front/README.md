# Black Amber Coffee - Frontend Monorepo

Este repositório contém o código fonte do ecossistema do **Black Amber Coffee**. O projeto foi estruturado seguindo os princípios de um **Monorepo**, o que significa que múltiplas aplicações (admin e cliente) coexistem no mesmo repositório e compartilham código entre si de forma organizada.

## 🏗️ Arquitetura do Projeto

A arquitetura foi pensada para ser **Modular, Escalável e Pronta para API (API-Ready)**. O código está dividido em duas grandes áreas na raiz do projeto: `app/` (onde ficam as aplicações reais) e `packages/` (onde ficam os módulos compartilhados).

### `packages/` (Módulos Compartilhados)

Aqui ficam as peças base que podem ser usadas por qualquer aplicação dentro do monorepo.

* **`packages/ui-shared/`**:
  * **O que é**: O "Design System" do projeto. Contém apenas os componentes visuais genéricos (botões, badges, barras de navegação e títulos).
  * **Por que está aqui**: Para que tanto o `admin` quanto o `client` tenham a mesma identidade visual sem precisar duplicar o código dos botões ou estilos CSS base. Note que no `vite.config.ts`, a aplicação principal cria um *alias* (`'ui-shared'`) apontando direto para cá.

* **`packages/utils/`**:
  * **O que é**: Tipagens globais de domínio (interfaces como `Worker`, `User`, `Order`, `Product`, `InventoryItem`), o Banco de Dados em memória (MockBD.ts) e helpers.
  * **Por que está aqui**: O "Menu" e o "Pedido" são conceitos globais. Compartilhando os `types`, garantimos que todas as aplicações falem a mesma língua. **Nota:** As tipagens aqui refletem um espelho exato (1:1) do que a nossa API / Backend final espera receber (incluindo campos como `publicId`, `profile.fullName`, `totalAmount` e status em uppercase `PENDING/LATE`).

### `app/` (Aplicações)

Aqui ficam os sistemas front-end que rodam de forma independente e consomem os pacotes.

#### `app/admin/` (Painel Administrativo)

A aplicação (Vite + React) para gerentes, caixas e baristas do Black Amber gerenciarem as operações. Toda a lógica de negócio administrativa fica fechada aqui.

* **`src/components/`**: Diferente do `ui-shared`, os componentes que ficam aqui possuem **lógica de negócio** atrelada a eles. Ex: `TableMenu` sabe como renderizar uma tabela complexa com categorias, `CardOrder` sabe puxar os status dos pedidos via API.
* **`src/services/`**: A camada de comunicação. É aqui que moram os métodos genéricos (ex: `authService.ts`, `orderService.ts`) de chamadas externas. Atualmente essas funções resolvem Promises e manipulam os "Mocks" do `MockBD.ts`, mas a assinatura de cada função já está pronta para a troca simples e indolor para requisições `fetch`/`axios` reais ao Backend final, bastando tirar o mock.
* **`src/hooks/`**: Onde criamos os *Custom Hooks* de abstração de UI (ex: `useMenuItems`, `useEmployee`). Eles orquestram os dados da camada de serviço (`services/`), controlam os estados de *loading*, *error* e manipulam a lista para que a página foque só no layout.
* **`src/pages/`**: As telas finais montadas (ex: `Dashboard.tsx`, `LiveOrders.tsx`). Graças aos hooks e aos services, as páginas não sabem *como* buscar os dados, apenas dizem *quais* dados precisam renderizar.
* **`src/layout/`**: O esqueleto (navbars verticais e horizontais, template base).

#### `app/client/` (Aplicação do Consumidor - Em breve)

* Possuirá a exata mesma estrutura arquitetural do admin (`components`, `hooks`, `services`, `pages`), mas voltada para a interface mobile/web do consumidor final (quem faz os pedidos pelo celular/totem).

---

## 🛠️ Estado Atual do Projeto

* ✅ A estrutura das interfaces no front-end foi 100% alinhada com as entidades do Backend de Produção.
* ✅ O sistema usa UUIDs mascarados como `publicId`, e extrai dados aninhados (como `profile.email` e `profile.avatarImage`) corretamente para funcionários e usuários.
* ✅ Os dados de teste e fluxo em tela utilizam o armazenamento local do navegador (`localStorage`) por intermédio dos Services para salvar a persistência durante a navegação.
* ✅ Há um sistema automático (`main.tsx`) que detecta conflitos ou versões velhas do localStorage e realiza uma migração silenciosa para previnir crashes.

---

## 🚀 Como Executar

O projeto utiliza **Vite** no front-end e **npm workspaces** para resolução automática de pacotes (os imports do `ui-shared` caem direto na pasta correta).

```bash
# 1. Instalar todas as dependências de todos os apps e packages da workspace:
npm install

# 2. Rodar o servidor de desenvolvimento do Painel Administrativo (Vite):
npm run dev:admin

# 3. Rodar a Aplicação do Cliente (Vite):
npm run dev:client
```

> **Aviso:** Ao acessar o painel (provavelmente em `http://localhost:5173`), caso perceba erros após atualizar branches do Git, o problema normalmente está atrelado ao cache salvo no navegador. O projeto já tem uma proteção que limpa o cache automaticamente caso o schema mude, mas um "Clear Storage" na aba "Application" do inspecionar do Google Chrome é sempre recomendado em grandes refatorações!

# 02. Engenharia de Requisitos — Black Amber Coffee

## 1. Requisitos Funcionais (RF)
- **RF-01 (Autenticação Unificada e Rotação de Tokens):** Cadastro público de clientes (`POST /v1/api/auth/register`), login unificado de clientes e funcionários (`POST /v1/api/auth/login`), refresh token rotativo, revogação de sessões (`logout`) e recuperação de senha por código enviado via Resend.
- **RF-02 (Health Check e Portão de Inicialização):** Endpoint `GET /v1/api/health` verificando latência real no PostgreSQL (`checkDatabaseHealth`) consumido na inicialização de ambos os apps frontend via `ServerWarmupGate`.
- **RF-03 (Gestão de Cardápio e Mídia):** CRUD de produtos com categorias (`cafe`, `cha`, `lanche`, `salgado`, `doce`, `bebida`, `sobremesa`, `combo`), ativação/desativação e upload `multipart/form-data` convertido para WebP via Sharp.
- **RF-04 (Controle de Estoque):** Listagem, entrada de estoque, ajuste manual e classificação automática de status (`In Stock`, `Low Stock`, `Out of Stock`).
- **RF-05 (Carrinho e Checkout Atômico):** Adição/remoção por produto e pagamento transacional (`simulatePayment`) que cria o pedido, calcula preços no servidor, registra o pagamento e limpa o carrinho na mesma transação PostgreSQL.
- **RF-06 (Gestão de Pedidos ao Vivo):** Criação manual pelo admin/barista, transição bidirecional de status (`criado <-> em_preparo -> pronto -> finalizado`) e cancelamento/exclusão.
- **RF-07 (Gestão de Equipe e Clientes):** Listagem, edição, bloqueio/desbloqueio imediato (`PATCH /v1/api/workers/:publicId/status` e `PATCH /v1/api/users/:publicId/status`) e exclusão administrativa.

## 2. Requisitos Não-Funcionais (RNF)
- **RNF-01 (Tipagem Estrita):** Compilação sem erros e zero uso de `any` em Backend e Frontend.
- **RNF-02 (Segurança de Transporte e Sessão):** Headers Helmet, CORS restrito por lista de origens, Rate Limiting (com bypass controlado em `/health`), senhas com bcrypt, JWT Bearer verificado contra `is_active` em banco e queries SQL 100% parametrizadas.
- **RNF-03 (Feedback Visual de Carregamento):** Botões de mutação exibem `LoadingSpinner` e previnem duplo envio.
- **RNF-04 (Portabilidade Cloud):** Deploy declarativo completo na Render via `render.yaml` com `AUTO_MIGRATE` e `AUTO_SEED`.

## 3. Regras de Negócio (RN)
- **RN-01:** Contas com `is_active = false` têm login e requisições autenticadas imediatamente recusados com HTTP `403 ACCOUNT_DEACTIVATED`.
- **RN-02:** O valor total de pedidos no checkout é sempre calculado a partir dos preços vigentes no banco, nunca confiando em totais enviados pelo cliente.
- **RN-03:** Produtos presentes em pedidos históricos são preservados via soft-delete (`is_active = false`) caso possuam vínculo em `order_items`.

# Roteiro de Testes e Homologação — Black Amber Coffee

> Protocolo oficial de validação automatizada e testes ponta a ponta antes de publicação em produção na Render.

---

## 1. Quality Gate Automatizado

Execute os comandos abaixo em sequência sem flags interativas:

### 1.1. Backend (`Backend/`)
```bash
npm run typecheck
npm test
npm run build
```

### 1.2. Frontend (`Frontend/`)
```bash
npm run lint -w admin-app
npm run lint -w client-app
npm test -w admin-app
npm test -w client-app
npm run build:admin
npm run build:client
```

---

## 2. Roteiro de Testes Manuais Ponta a Ponta (E2E)

### CT01: Portão de Aquecimento (`/v1/api/health` — Render Cold Start)
* **Pré-condição:** Backend parado ou iniciando; Frontend Admin ou Client aberto no navegador.
* **Passos:**
  1. Acesse o Frontend sem o Backend ativo.
  2. Observe a tela exibida pelo `ServerWarmupGate`.
  3. Inicie o Backend (`npm run dev` ou acorde o serviço na Render).
  4. Aguarde a reconexão automática ou clique em **"Tentar novamente agora"**.
* **Resultado Esperado:** Enquanto `/v1/api/health` falhar ou retornar `503`, a tela exibe contador de segundos, número de tentativa e spinner sem quebrar o app. Assim que o Backend responder `200`, o aplicativo libera a tela de Login/Home automaticamente.

### CT02: Autenticação, Bloqueio de Conta e Logout
* **Pré-condição:** Seed inicial aplicada (`admin@blackamber.com` e `cliente@blackamber.com`).
* **Passos:**
  1. Acesse `/login`, informe senha incorreta e observe o erro + spinner no botão durante a requisição.
  2. Faça login com usuário ativo.
  3. No painel Admin (`/staff`), bloqueie um cliente ou funcionário via menu de opções (`PATCH /status`).
  4. Tente usar uma sessão existente ou logar novamente com a conta bloqueada.
* **Resultado Esperado:** Contas bloqueadas recebem HTTP `403 ACCOUNT_DEACTIVATED` tanto no login quanto em requisições autenticadas subsequentes.

### CT03: Gestão de Cardápio + Upload WebP (`multipart/form-data`)
* **Passos:**
  1. No Admin (`/menu`), crie ou edite um produto anexando uma imagem `.png` ou `.jpg`.
  2. Observe o botão mostrar `<LoadingSpinner />` e desabilitar durante o salvamento.
* **Resultado Esperado:** O `httpClient` não sobrescreve `Content-Type` em `FormData`, o Backend processa via Multer + Sharp WebP e retorna URL pública completa renderizável nos dois apps.

### CT04: Carrinho e Checkout Transacional no Cliente
* **Passos:**
  1. No App Cliente (`/home` ou `/menu`), clique em `+` para adicionar itens e observe o spinner individual por produto (`pendingProductIds`).
  2. Acesse `/cart`, ajuste quantidades (`+/-`), adicione observação e clique em **"Complete Purchase"**.
* **Resultado Esperado:** O pedido é criado atomicamente no PostgreSQL, o carrinho é esvaziado na mesma transação e o novo pedido aparece imediatamente no Live Orders do Admin.

### CT05: Ciclo de Pedidos em Tempo Real (`/live-orders` & `/dashboard`)
* **Passos:**
  1. Em um pedido com status `criado`, clique em `START` (`em_preparo`).
  2. Teste `HOLD` (`criado`) para devolver o pedido à fila inicial e depois `START` -> `READY` (`pronto`) -> `COMPLETE` (`finalizado`).
* **Resultado Esperado:** Cada botão exibe spinner e bloqueia clique duplo durante a chamada, persistindo o status corretamente no PostgreSQL.

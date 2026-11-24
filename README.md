# Black Amber Coffee — Full-Stack Monorepo

Plataforma full-stack para operação de cafeteria digital (aplicativo do cliente + painel administrativo em tempo real), construída com **PostgreSQL 16**, **Express 5 Clean MVC (TypeScript ESM)**, **React 19 + Vite + Tailwind CSS v4 + Zustand** e deploy automatizado na **Render**.

---

## Arquitetura em Camadas

| Camada | Diretório | Stack Principal | Responsabilidade |
| :--- | :--- | :--- | :--- |
| **Database** | [`Database/`](./Database) | PostgreSQL 16, SQL DDL/DML, Docker + Adminer | Schema mestre, migrações SQL e carga inicial |
| **Backend** | [`Backend/`](./Backend) | Node.js, Express 5, `pg.Pool`, Zod, JWT, Sharp, R2, Resend | API Clean MVC Feature-Driven, Swagger e transações SQL |
| **Frontend** | [`Frontend/`](./Frontend) | React 19, Vite, Tailwind v4, **Zustand**, Lucide | Apps `admin` e `client`, `ServerWarmupGate` (`/health`) e componentes compartilhados |
| **Docs** | [`docs/`](./docs) | Markdown, Mermaid, MkDocs Material | Governança (`AGENTS.md`), arquitetura, requisitos, sprints e testes |
| **Cloud Deploy** | [`render.yaml`](./render.yaml) | Render Blueprint | Provisionamento unificado (PostgreSQL + Web Service + 2 Static Sites) |

---

## Início Rápido (Ambiente Local)

### 1. Subir PostgreSQL via Docker (`Database/`)
```bash
cd Database
cp .env.example .env
docker compose up -d
```
Adminer fica disponível em `http://localhost:8080`.

### 2. Iniciar Backend (`Backend/`)
```bash
cd Backend
cp .env.example .env
npm install
npm run typecheck
npm test
npm run build
npm run dev
```
- API: `http://localhost:3001/v1/api`
- Health Check: `http://localhost:3001/v1/api/health`
- Swagger UI: `http://localhost:3001/v1/docs`

### 3. Iniciar Frontends (`Frontend/`)
```bash
cd Frontend
npm install --no-audit --no-fund
npm run dev:admin    # Painel Administrativo
npm run dev:client   # App Cliente (porta 5174)
```

---

## Credenciais de Seed Inicial (`Database/seeds/01_seed_black_amber.sql`)

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| Admin / Gerente | `admin@blackamber.com` | `Admin@123` |
| Barista / Worker | `barista@blackamber.com` | `Barista@123` |
| Cliente | `cliente@blackamber.com` | `Cliente@123` |

---

## Quality Gate & Testes Automatizados

```bash
# Backend
cd Backend && npm run typecheck && npm test && npm run build

# Frontend
cd Frontend
npm run lint -w admin-app && npm run lint -w client-app
npm test -w admin-app && npm test -w client-app
npm run build:admin && npm run build:client
```

Mais detalhes técnicos em [docs/README.md](./docs/README.md) e [AGENTS.md](./AGENTS.md).

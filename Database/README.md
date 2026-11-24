# Guia do Banco de Dados PostgreSQL (Docker Isolado & Render)

Toda a infraestrutura de modelagem e inicialização local do PostgreSQL está **isolada nesta pasta `Database/`**. Você não precisa instalar o PostgreSQL diretamente no Windows para desenvolver: o Docker sobe o PostgreSQL 16 + o painel visual Adminer com um comando.

---

## 1. Arquivos da Pasta

- `Dockerfile`: Cria a imagem `postgres:16-alpine` e executa `database.sql` e `seeds/01_seed_black_amber.sql` na criação do container.
- `docker-compose.yml`: Sobe o PostgreSQL (porta `5432`) e o painel web Adminer (porta `8080`).
- `database.sql`: Schema mestre idempotente com 6 `ENUM`s, 13 tabelas, ações referenciais seguras (`ON DELETE CASCADE` / `SET NULL`), índices e triggers `atualizar_updated_at()`.
- `migrations/001_initial_schema.sql`: Cópia versionada da migração inicial para histórico.
- `seeds/01_seed_black_amber.sql`: Seed determinística de funcionários, clientes, cardápio, estoques e insumos.
- `.env.example`: Variáveis de configuração do container local.

---

## 2. Como Subir e Visualizar Localmente

Entre na pasta `Database/` (`cd Database`):

```bash
# Subir PostgreSQL + Adminer
npm run up

# Desligar preservando dados
npm run down

# Resetar do zero (recria volume, schema e seed)
npm run reset
```

### Acessar o Adminer no Navegador
1. Abra `http://localhost:8080`.
2. Sistema: `PostgreSQL` | Servidor: `postgres` | Usuário: `postgres` | Senha: `postgres` | Banco: `black_amber_db`.

---

## 3. Como Funciona na Render (Auto-Migrate + Auto-Seed)

Em produção na **Render**, o próprio Backend (`Backend/core/database/migrator.ts` e `seeder.ts`) aplica automaticamente o `database.sql` e a seed idempotente no boot caso o banco esteja vazio — eliminando a necessidade de rodar migrações manuais no shell.

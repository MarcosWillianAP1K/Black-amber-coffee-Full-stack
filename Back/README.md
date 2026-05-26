# Black Amber Coffee

Black Amber Coffee é uma API em Node.js para apoiar a operação de uma cafeteria focada em produtividade, com base para autenticação, saúde da aplicação, documentação automática e acesso ao banco de dados.

## Visão Geral

O projeto usa TypeScript, Express e Drizzle ORM, com documentação via Swagger. A estrutura foi organizada de forma modular para facilitar a evolução de novas regras de negócio, como usuários, pedidos, pagamentos e gestão interna.

## Tecnologias

- Node.js
- Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT
- Bcrypt
- Zod
- Swagger

## Arquitetura

```text
src/
	config/    Configurações de ambiente e banco de dados
	core/      Regras centrais e utilitários compartilhados
	db/        Schema e integração com o banco
	modules/   Módulos de domínio por funcionalidade
	routes/    Definição das rotas da API
	shared/    Enums e utilitários comuns
```

### Módulos atuais

- `health`: endpoint para verificar se a API está online
- `auth`: base preparada para autenticação e autorização

## Rotas

- `GET /health` - verifica se a API está online
- `GET /docs` - documentação Swagger

## Scripts

- `npm run start` - inicia a API
- `npm run build` - compila o TypeScript
- `npm run migrate-new` - gera nova migration do Drizzle
- `npm run migrate-up` - aplica migrations
- `npm run db:delete` - legado de SQLite (nao usado com PostgreSQL)
- `npm run db:reset` - legado de SQLite (nao usado com PostgreSQL)

## Banco de Dados

O projeto já possui a base de schema em Drizzle para a tabela de clientes, com foco em manter a modelagem centralizada no código.

## Documentação

A documentação interativa da API fica disponível em `/docs` quando a aplicação está em execução.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](/home/hermeson/Projetos/black-amber-coffe/LICENSE) para os termos completos.

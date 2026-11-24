FROM postgres:16-alpine

# Executa automaticamente o schema mestre e a seed inicial na inicialização do container
COPY ./database.sql /docker-entrypoint-initdb.d/01-database.sql
COPY ./seeds/01_seed_black_amber.sql /docker-entrypoint-initdb.d/02-seed.sql

EXPOSE 5432

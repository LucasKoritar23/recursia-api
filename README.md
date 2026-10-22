# RecursIA API

API REST para cadastro, consulta, atualização e remoção de funcionários, com PostgreSQL e documentação OpenAPI.

## Objetivo

Disponibilizar operações de gerenciamento de funcionários, com validações, paginação e respostas padronizadas.

## Tecnologias

Node.js, TypeScript, Fastify, Zod 4, `fastify-type-provider-zod`, PostgreSQL 17, `pg`, Swagger e Swagger UI.

## Estrutura

```text
src/
├── aplicacao.ts
├── servidor.ts
├── configs/                 # Banco e Swagger
└── modules/funcionarios/    # Rotas, controladores, serviços, schemas e repositório
db/migrations/               # SQL da tabela funcionarios
```

## Pré-requisitos

Node.js com npm, Docker com Docker Compose e acesso local à porta 5432.

## Instalação e configuração

```bash
npm install
copy .env.example .env       # Windows; no Linux/macOS: cp .env.example .env
```

Configure no `.env` `BANCO_HOST`, `BANCO_PORTA`, `BANCO_USUARIO`, `BANCO_SENHA` e `BANCO_NOME`. Não versione credenciais reais.

## Banco de dados e migrations

```bash
docker compose up -d postgres
```

Execute o SQL de [`001_criar_tabela_funcionarios.sql`](db/migrations/001_criar_tabela_funcionarios.sql) no banco `recursia` usando sua ferramenta PostgreSQL. O repositório não possui script npm de migrations.

## Execução

```bash
npm run dev        # desenvolvimento com recarga
npm run build      # compilação TypeScript
npm run typecheck  # verificação de tipos
npm start          # execução da versão compilada
```

A API escuta em `http://127.0.0.1:3000`. A documentação está em [`http://127.0.0.1:3000/documentacao`](http://127.0.0.1:3000/documentacao).

## Endpoints

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/saude` | Verifica a saúde da API. |
| GET | `/funcionarios` | Lista com `pagina` (padrão 1) e `limite` (padrão 10; máximo 100). |
| GET | `/funcionarios/busca` | Busca por `id`, `nome_completo`, `matricula` e/ou `tipo_contrato`, com paginação. |
| POST | `/funcionarios` | Cria um funcionário. |
| PATCH | `/funcionarios/:id` | Atualiza parcialmente um funcionário. |
| PUT | `/funcionarios/:id` | Substitui integralmente um funcionário. |
| DELETE | `/funcionarios/:id` | Exclui um funcionário. |

Exemplos:

```bash
curl "http://127.0.0.1:3000/funcionarios?pagina=1&limite=10"
curl "http://127.0.0.1:3000/funcionarios/busca?nome_completo=Ana&matricula=REC-123456"
```

```json
{
  "nome_completo": "Ana Souza",
  "email_corporativo": "ana.souza@empresa.com",
  "matricula": "REC-123456",
  "data_admissao": "2025-01-15",
  "tipo_contrato": "CLT",
  "modelo_trabalho": "HIBRIDO",
  "situacao": "ATIVO",
  "departamento_id": null,
  "cargo_id": null,
  "gestor_id": null
}
```

## Status

Projeto em desenvolvimento, com o módulo de funcionários implementado e documentação Swagger disponível.

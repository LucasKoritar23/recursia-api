// src/configuracoes/banco.ts

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

/**
 * Pool compartilhado de conexões PostgreSQL.
 *
 * As credenciais vêm de variáveis de ambiente carregadas por dotenv. Um pool
 * reaproveita conexões, limita concorrência (`max`) e evita abrir uma conexão
 * nova para cada requisição. Os módulos de repository usam `banco.query()`.
 */
export const banco = new Pool({
    host: process.env.BANCO_HOST,
    port: Number(process.env.BANCO_PORTA),
    user: process.env.BANCO_USUARIO,
    password: process.env.BANCO_SENHA,
    database: process.env.BANCO_NOME,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

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
    ...(process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
              host: process.env.BANCO_HOST,
              port: process.env.BANCO_PORTA
                  ? Number(process.env.BANCO_PORTA)
                  : undefined,
              user: process.env.BANCO_USUARIO,
              password: process.env.BANCO_SENHA,
              database: process.env.BANCO_NOME,
          }),
    // Serverless instances should keep a small per-instance connection pool.
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// src/configuracoes/banco.ts

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

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
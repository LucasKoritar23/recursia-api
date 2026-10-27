import { criarAplicacao } from "./aplicacao.js";

// Vercel detects this Fastify entrypoint and serves it as a Function.
const aplicacao = await criarAplicacao();

export default aplicacao;

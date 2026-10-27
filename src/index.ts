import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { z } from "zod";

import { configurarSwagger } from "./configs/swagger.js";
import { rotasFuncionarios } from "./modules/funcionarios/funcionarios.route.js";

// Keep the Fastify instance explicit so Vercel's framework detector recognizes it.
const aplicacao = Fastify({ logger: true });
aplicacao.setValidatorCompiler(validatorCompiler);
aplicacao.setSerializerCompiler(serializerCompiler);

await configurarSwagger(aplicacao);

aplicacao.get(
    "/saude",
    {
        schema: {
            tags: ["Saude"],
            summary: "Verificar a saude da API",
            description: "Verifica se a API esta em funcionamento.",
            response: { 200: z.object({ status: z.string() }) },
        },
    },
    async () => ({ status: "ok" }),
);

await aplicacao.register(rotasFuncionarios, { prefix: "/funcionarios" });

export default aplicacao;

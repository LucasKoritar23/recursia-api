import Fastify from "fastify";
import { z } from "zod";
import {
    validatorCompiler,
    serializerCompiler
} from "fastify-type-provider-zod";

import { configurarSwagger } from "./configs/swagger.js";
import { rotasFuncionarios } from "./modules/funcionarios/funcionarios.route.js";

export async function criarAplicacao() {
    const aplicacao = Fastify({
        logger: true
    });

    // Configura a validacao dos schemas Zod
    aplicacao.setValidatorCompiler(validatorCompiler);
    aplicacao.setSerializerCompiler(serializerCompiler);

    // Registra o Swagger
    await configurarSwagger(aplicacao);

    // Endpoint de saude da API
    aplicacao.get(
        "/saude",
        {
            schema: {
                tags: ["Saude"],
                summary: "Verificar a saude da API",
                description: "Verifica se a API esta em funcionamento.",
                response: {
                    200: z.object({
                        status: z.string()
                    })
                }
            }
        },
        async () => {
            return {
                status: "ok"
            };
        }
    );

    // Registra as rotas de funcionarios
    await aplicacao.register(rotasFuncionarios, {
        prefix: "/funcionarios"
    });

    return aplicacao;
}
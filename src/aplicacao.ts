import Fastify from "fastify";
import { z } from "zod";
import {
    validatorCompiler,
    serializerCompiler
} from "fastify-type-provider-zod";

import { configurarSwagger } from "./configs/swagger.js";
import { rotasFuncionarios } from "./modules/funcionarios/funcionarios.route.js";

/**
 * Cria e configura a instância do Fastify.
 *
 * Esta função representa a composição da aplicação: registra os compiladores
 * do Zod, o Swagger e as rotas HTTP. Ela não inicia o servidor nem abre uma
 * conexão com o banco; essas responsabilidades ficam em `servidor.ts` e no
 * módulo de banco, respectivamente.
 *
 * @returns Uma Promise com a aplicação Fastify pronta para testes ou listen().
 */
export async function criarAplicacao() {
    const aplicacao = Fastify({
        logger: true
    });

    // O validatorCompiler transforma schemas Zod em validadores de entrada.
    // O serializerCompiler transforma respostas Zod em schemas de serialização.
    aplicacao.setValidatorCompiler(validatorCompiler);
    aplicacao.setSerializerCompiler(serializerCompiler);

    // O Swagger precisa ser registrado antes das rotas para capturá-las.
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

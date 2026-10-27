import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
// import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

/**
 * Registra o contrato OpenAPI e a interface Swagger UI na aplicação.
 *
 * `jsonSchemaTransform` converte schemas Zod das rotas em JSON Schema,
 * permitindo que validação e documentação partam da mesma fonte.
 *
 * @param aplicacao Instância Fastify que receberá os plugins.
 * @returns Promise concluída após o registro dos plugins.
 */
export async function configurarSwagger(
    aplicacao: FastifyInstance
) {
    /**
     * Registra o contrato OpenAPI e a interface Swagger UI na aplicação.
     *
     * O `jsonSchemaTransform` converte schemas Zod declarados nas rotas em
     * JSON Schema, permitindo que a validação e a documentação partam da
     * mesma definição.
     *
     * @param aplicacao Instância Fastify que receberá os plugins.
     * @returns Promise concluída após o registro dos plugins.
     */
    await aplicacao.register(fastifySwagger, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "RecursIA API",
                description:
                    "API para gerenciamento de funcionarios, departamentos, cargos e estrutura organizacional.",
                version: "1.0.0"
            },
            // An empty URL uses the current origin in Swagger UI, including production.
            servers: [{ url: "" }],
            tags: [
                {
                    name: "Funcionarios",
                    description: "Operacoes de gerenciamento de funcionarios"
                },
                {
                    name: "Saude",
                    description: "Monitoramento da API"
                }
            ]
        },
        transform: jsonSchemaTransform
    });

    // await aplicacao.register(fastifySwaggerUI, {
    //     routePrefix: "/documentacao",
    //     uiConfig: {
    //         docExpansion: "list",
    //         deepLinking: true
    //     }
    // });
}

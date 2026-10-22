import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export async function configurarSwagger(
    aplicacao: FastifyInstance
) {
    await aplicacao.register(fastifySwagger, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "RecursIA API",
                description:
                    "API para gerenciamento de funcionarios, departamentos, cargos e estrutura organizacional.",
                version: "1.0.0"
            },
            servers: [
                {
                    url: "http://127.0.0.1:3000",
                    description: "Ambiente local"
                }
            ],
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

    await aplicacao.register(fastifySwaggerUI, {
        routePrefix: "/documentacao",
        uiConfig: {
            docExpansion: "list",
            deepLinking: true
        }
    });
}
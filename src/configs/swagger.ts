import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

/**
 * Registra a especificação OpenAPI e, opcionalmente,
 * a interface Swagger UI.
 *
 * O Swagger UI pode ser desabilitado por variável de
 * ambiente para diagnosticar problemas no runtime.
 */
export async function configurarSwagger(
    aplicacao: FastifyInstance
): Promise<void> {
    await aplicacao.register(fastifySwagger, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "RecursIA API",
                description:
                    "API para gerenciamento de funcionarios, departamentos, cargos e estrutura organizacional.",
                version: "1.0.0"
            },
            servers: [{ url: "/" }],
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

    // Evita carregar @fastify/swagger-ui quando desabilitado.
    if (process.env.SWAGGER_UI_HABILITADO === "false") {
        aplicacao.log.info("Swagger UI desabilitado para diagnostico.");
        return;
    }

    // Importação dinâmica: carrega o plugin somente quando necessário.
    const { default: fastifySwaggerUI } =
        await import("@fastify/swagger-ui");

    await aplicacao.register(fastifySwaggerUI, {
        routePrefix: "/documentacao",
        uiConfig: {
            docExpansion: "list",
            deepLinking: true
        }
    });
}
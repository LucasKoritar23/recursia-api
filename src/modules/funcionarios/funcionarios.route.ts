import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
    listarFuncionariosControlador,
    criarFuncionarioControlador,
    excluirFuncionarioControlador,
    buscarFuncionariosControlador,
    atualizarFuncionarioControlador,
    substituirFuncionarioControlador
} from "./funcionarios.controller.js";
import {
    esquemaAtualizarFuncionario,
    esquemaBuscarFuncionarios,
    esquemaCriarFuncionario,
    esquemaIdentificadorFuncionario,
    esquemaPaginacao,
    esquemaSubstituirFuncionario
} from "./funcionarios.schema.js";

const respostaErro = z.object({
    mensagem: z.string(),
    erros: z.array(z.object({ campo: z.string(), mensagem: z.string() })).optional()
});

/**
 * Registra as rotas do módulo sob o prefixo `/funcionarios`.
 * Os schemas Zod validam a entrada antes do controller e alimentam o OpenAPI.
 *
 * @param aplicacao Instância Fastify onde as rotas serão registradas.
 * @returns Promise concluída após o registro das rotas.
 */
export async function rotasFuncionarios(
    aplicacao: FastifyInstance
) {
    // As respostas paginadas vêm do PostgreSQL e podem conter objetos Date;
    // sem response schema, o Fastify preserva a serialização real.
    aplicacao.get("/", { schema: { tags: ["Funcionarios"], summary: "Listar funcionários", description: "Lista funcionários com paginação.", querystring: esquemaPaginacao, response: { 400: respostaErro } } }, listarFuncionariosControlador);
    aplicacao.get("/busca", { schema: { tags: ["Funcionarios"], summary: "Buscar funcionários", description: "Busca por um ou mais filtros combináveis. É obrigatório informar ao menos um filtro.", querystring: esquemaBuscarFuncionarios, response: { 400: respostaErro } } }, buscarFuncionariosControlador);
    aplicacao.post("/", { schema: { tags: ["Funcionarios"], summary: "Criar funcionário", description: "Cadastra um funcionário.", body: esquemaCriarFuncionario, response: { 400: respostaErro, 409: respostaErro } } }, criarFuncionarioControlador);
    aplicacao.delete("/:id", { schema: { tags: ["Funcionarios"], summary: "Excluir funcionário", description: "Exclui um funcionário pelo UUID.", params: esquemaIdentificadorFuncionario, response: { 400: respostaErro, 404: respostaErro, 409: respostaErro } } }, excluirFuncionarioControlador);
    aplicacao.patch("/:id", { schema: { tags: ["Funcionarios"], summary: "Atualizar parcialmente funcionário", description: "Atualiza um ou mais campos. Diferentemente de PUT, aceita corpo parcial.", params: esquemaIdentificadorFuncionario, body: esquemaAtualizarFuncionario, response: { 400: respostaErro, 404: respostaErro, 409: respostaErro } } }, atualizarFuncionarioControlador);
    aplicacao.put("/:id", { schema: { tags: ["Funcionarios"], summary: "Substituir funcionário", description: "Substitui integralmente o recurso; todos os campos obrigatórios devem ser enviados.", params: esquemaIdentificadorFuncionario, body: esquemaSubstituirFuncionario, response: { 400: respostaErro, 404: respostaErro, 409: respostaErro } } }, substituirFuncionarioControlador);
}

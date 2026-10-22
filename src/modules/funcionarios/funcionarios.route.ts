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

const respostaFuncionario = z.object({
    id: z.uuid(), nome_completo: z.string(), email_corporativo: z.string(),
    matricula: z.string(), data_admissao: z.string(), tipo_contrato: z.string(),
    modelo_trabalho: z.string().nullable(), situacao: z.string(),
    departamento_id: z.uuid().nullable(), cargo_id: z.uuid().nullable(),
    gestor_id: z.uuid().nullable(), criado_em: z.string(), atualizado_em: z.string()
});
const respostaPaginada = z.object({
    dados: z.array(respostaFuncionario),
    paginacao: z.object({
        pagina: z.number(), limite: z.number(), total_registros: z.number(),
        total_paginas: z.number(), tem_proxima_pagina: z.boolean(),
        tem_pagina_anterior: z.boolean()
    })
});
const respostaErro = z.object({
    mensagem: z.string(),
    erros: z.array(z.object({ campo: z.string(), mensagem: z.string() })).optional()
});

export async function rotasFuncionarios(
    aplicacao: FastifyInstance
) {
    aplicacao.get("/", { schema: { tags: ["Funcionarios"], summary: "Listar funcionários", description: "Lista funcionários com paginação.", querystring: esquemaPaginacao, response: { 200: respostaPaginada, 400: respostaErro } } }, listarFuncionariosControlador);
    aplicacao.get("/busca", { schema: { tags: ["Funcionarios"], summary: "Buscar funcionários", description: "Busca por um ou mais filtros combináveis. É obrigatório informar ao menos um filtro.", querystring: esquemaBuscarFuncionarios, response: { 200: respostaPaginada, 400: respostaErro } } }, buscarFuncionariosControlador);
    aplicacao.post("/", { schema: { tags: ["Funcionarios"], summary: "Criar funcionário", description: "Cadastra um funcionário.", body: esquemaCriarFuncionario, response: { 201: respostaFuncionario, 400: respostaErro, 409: respostaErro } } }, criarFuncionarioControlador);
    aplicacao.delete("/:id", { schema: { tags: ["Funcionarios"], summary: "Excluir funcionário", description: "Exclui um funcionário pelo UUID.", params: esquemaIdentificadorFuncionario, response: { 400: respostaErro, 404: respostaErro, 409: respostaErro } } }, excluirFuncionarioControlador);
    aplicacao.patch("/:id", { schema: { tags: ["Funcionarios"], summary: "Atualizar parcialmente funcionário", description: "Atualiza um ou mais campos. Diferentemente de PUT, aceita corpo parcial.", params: esquemaIdentificadorFuncionario, body: esquemaAtualizarFuncionario, response: { 200: respostaFuncionario, 400: respostaErro, 404: respostaErro, 409: respostaErro } } }, atualizarFuncionarioControlador);
    aplicacao.put("/:id", { schema: { tags: ["Funcionarios"], summary: "Substituir funcionário", description: "Substitui integralmente o recurso; todos os campos obrigatórios devem ser enviados.", params: esquemaIdentificadorFuncionario, body: esquemaSubstituirFuncionario, response: { 200: respostaFuncionario, 400: respostaErro, 404: respostaErro, 409: respostaErro } } }, substituirFuncionarioControlador);
}

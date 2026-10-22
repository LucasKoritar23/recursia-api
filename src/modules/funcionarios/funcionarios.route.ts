import type { FastifyInstance } from "fastify";

import {
    listarFuncionariosControlador,
    criarFuncionarioControlador,
    excluirFuncionarioControlador,
    buscarFuncionariosControlador,
    atualizarFuncionarioControlador,
    substituirFuncionarioControlador
} from "./funcionarios.controller.js";

export async function rotasFuncionarios(
    aplicacao: FastifyInstance
) {
    aplicacao.get("/", listarFuncionariosControlador);
    aplicacao.get("/busca", buscarFuncionariosControlador);
    aplicacao.post("/", criarFuncionarioControlador);
    aplicacao.delete("/:id", excluirFuncionarioControlador);
    aplicacao.patch("/:id", atualizarFuncionarioControlador);
    aplicacao.put("/:id", substituirFuncionarioControlador);
}
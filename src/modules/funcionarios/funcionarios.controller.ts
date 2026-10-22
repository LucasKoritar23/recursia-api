import type { FastifyReply, FastifyRequest } from "fastify";

import {
    esquemaCriarFuncionario,
    esquemaIdentificadorFuncionario,
    esquemaBuscarFuncionarios,
    esquemaPaginacao,
    esquemaAtualizarFuncionario,
    esquemaSubstituirFuncionario
} from "./funcionarios.schema.js";

import {
    listarFuncionariosServico,
    criarFuncionarioServico,
    excluirFuncionarioServico,
    buscarFuncionariosServico,
    atualizarFuncionarioServico,
    substituirFuncionarioServico
} from "./funcionarios.service.js";

/**
 * Valida o body, cria um funcionário e traduz conflitos de unicidade para HTTP 409.
 * @param requisicao Requisição Fastify com o body do novo funcionário.
 * @param resposta Resposta Fastify usada para enviar status e JSON.
 * @returns Funcionário criado (201) ou erro de validação/conflito.
 * @throws Erros de infraestrutura não tratados localmente.
 */
export async function criarFuncionarioControlador(
    requisicao: FastifyRequest,
    resposta: FastifyReply
) {
    // safeParse evita lançar exceção: o resultado indica sucesso ou lista de issues.
    const validacao = esquemaCriarFuncionario.safeParse(
        requisicao.body
    );

    if (!validacao.success) {
        return resposta.status(400).send({
            mensagem: "Existem campos invalidos ou nao preenchidos.",
            erros: validacao.error.issues.map((erro) => ({
                campo: erro.path.join("."),
                mensagem: erro.message
            }))
        });
    }

    try {
        const funcionario = await criarFuncionarioServico(
            validacao.data
        );

        return resposta.status(201).send(funcionario);
    } catch (erro: unknown) {
        if (
            typeof erro === "object" &&
            erro !== null &&
            "code" in erro &&
            erro.code === "23505"
        ) {
            const restricao =
                "constraint" in erro ? erro.constraint : null;

            if (restricao === "funcionarios_email_corporativo_key") {
                return resposta.status(409).send({
                    mensagem: "O e-mail corporativo informado ja esta cadastrado.",
                    erros: [
                        {
                            campo: "email_corporativo",
                            mensagem: "Este e-mail corporativo ja esta em uso."
                        }
                    ]
                });
            }

            if (restricao === "funcionarios_matricula_key") {
                return resposta.status(409).send({
                    mensagem: "A matricula informada ja esta cadastrada.",
                    erros: [
                        {
                            campo: "matricula",
                            mensagem: "Esta matricula ja esta em uso."
                        }
                    ]
                });
            }

            return resposta.status(409).send({
                mensagem: "Ja existe um registro com um valor unico informado."
            });
        }

        throw erro;
    }
}

/**
 * Valida o UUID, remove o registro e trata ausência ou violação de FK.
 * @param requisicao Requisição com `params.id`.
 * @param resposta Resposta Fastify.
 * @returns Resposta 204, 404, 409 ou 400 conforme o resultado.
 * @throws Erros de infraestrutura não tratados localmente.
 */
export async function excluirFuncionarioControlador(
    requisicao: FastifyRequest,
    resposta: FastifyReply
) {
    const validacao = esquemaIdentificadorFuncionario.safeParse(
        requisicao.params
    );

    if (!validacao.success) {
        return resposta.status(400).send({
            mensagem: "Identificador do funcionario invalido.",
            erros: validacao.error.issues.map((erro) => ({
                campo: erro.path.join("."),
                mensagem: erro.message
            }))
        });
    }

    try {
        const excluido = await excluirFuncionarioServico(
            validacao.data.id
        );

        if (!excluido) {
            return resposta.status(404).send({
                mensagem: "Funcionario nao encontrado."
            });
        }

        return resposta.status(204).send();
    } catch (erro: unknown) {
        if (
            typeof erro === "object" &&
            erro !== null &&
            "code" in erro &&
            erro.code === "23503"
        ) {
            return resposta.status(409).send({
                mensagem:
                    "Nao e possivel excluir o funcionario porque existem registros vinculados a ele."
            });
        }

        throw erro;
    }
}

/**
 * Valida filtros combináveis, delega a busca paginada e retorna seus dados.
 * @param requisicao Requisição com filtros em `query`.
 * @param resposta Resposta Fastify.
 * @returns Página de funcionários ou erro 400.
 */
export async function buscarFuncionariosControlador(
    requisicao: FastifyRequest,
    resposta: FastifyReply
) {
    const validacao = esquemaBuscarFuncionarios.safeParse(
        requisicao.query
    );

    if (!validacao.success) {
        return resposta.status(400).send({
            mensagem: "Filtros de busca invalidos.",
            erros: validacao.error.issues.map((erro) => ({
                campo: erro.path.join(".") || "filtros",
                mensagem: erro.message
            }))
        });
    }

    const resultado = await buscarFuncionariosServico(
        validacao.data
    );

    return resposta.status(200).send(resultado);
}

/**
 * Valida paginação e delega a listagem sem filtros.
 * @param requisicao Requisição com `pagina` e `limite` na query.
 * @param resposta Resposta Fastify.
 * @returns Página de funcionários ou erro 400.
 */
export async function listarFuncionariosControlador(
    requisicao: FastifyRequest,
    resposta: FastifyReply
) {
    const validacao = esquemaPaginacao.safeParse(
        requisicao.query
    );

    if (!validacao.success) {
        return resposta.status(400).send({
            mensagem: "Parametros de paginacao invalidos.",
            erros: validacao.error.issues.map((erro) => ({
                campo: erro.path.join("."),
                mensagem: erro.message
            }))
        });
    }

    const resultado = await listarFuncionariosServico(
        validacao.data
    );

    return resposta.status(200).send(resultado);
}

/**
 * Executa atualização parcial após validar UUID e body não vazio.
 * @param requisicao Requisição com `params.id` e campos parciais no body.
 * @param resposta Resposta Fastify.
 * @returns Funcionário atualizado ou erro de validação, ausência ou conflito.
 * @throws Erros de infraestrutura não tratados localmente.
 */
export async function atualizarFuncionarioControlador(
    requisicao: FastifyRequest,
    resposta: FastifyReply
) {
    const identificador = esquemaIdentificadorFuncionario.safeParse(
        requisicao.params
    );

    if (!identificador.success) {
        return resposta.status(400).send({
            mensagem: "Identificador do funcionario invalido.",
            erros: identificador.error.issues.map((erro) => ({
                campo: erro.path.join("."),
                mensagem: erro.message
            }))
        });
    }

    const validacao = esquemaAtualizarFuncionario.safeParse(
        requisicao.body
    );

    if (!validacao.success) {
        return resposta.status(400).send({
            mensagem: "Dados invalidos para atualizacao.",
            erros: validacao.error.issues.map((erro) => ({
                campo: erro.path.join(".") || "dados",
                mensagem: erro.message
            }))
        });
    }

    try {
        const funcionario = await atualizarFuncionarioServico(
            identificador.data.id,
            validacao.data
        );

        if (!funcionario) {
            return resposta.status(404).send({
                mensagem: "Funcionario nao encontrado."
            });
        }

        return resposta.status(200).send(funcionario);
    } catch (erro: unknown) {
        if (typeof erro === "object" && erro !== null && "code" in erro) {
            if (erro.code === "23505") {
                const restricao = "constraint" in erro ? erro.constraint : null;

                const campo =
                    restricao === "funcionarios_email_corporativo_key"
                        ? "email_corporativo"
                        : restricao === "funcionarios_matricula_key"
                            ? "matricula"
                            : "dados";

                return resposta.status(409).send({
                    mensagem: "Ja existe um funcionario com esse valor.",
                    erros: [{
                        campo,
                        mensagem: "O valor informado ja esta cadastrado."
                    }]
                });
            }

            if (erro.code === "23503") {
                return resposta.status(409).send({
                    mensagem: "O gestor informado nao existe ou ha um relacionamento invalido."
                });
            }
        }

        throw erro;
    }
}

/**
 * Executa substituição completa após validar UUID e todos os campos do body.
 * @param requisicao Requisição com `params.id` e representação completa.
 * @param resposta Resposta Fastify.
 * @returns Funcionário substituído ou erro de validação, ausência ou conflito.
 * @throws Erros de infraestrutura não tratados localmente.
 */
export async function substituirFuncionarioControlador(
    requisicao: FastifyRequest,
    resposta: FastifyReply
) {
    const identificador = esquemaIdentificadorFuncionario.safeParse(
        requisicao.params
    );

    if (!identificador.success) {
        return resposta.status(400).send({
            mensagem: "Identificador do funcionario invalido.",
            erros: identificador.error.issues.map((erro) => ({
                campo: erro.path.join("."),
                mensagem: erro.message
            }))
        });
    }

    const validacao = esquemaSubstituirFuncionario.safeParse(
        requisicao.body
    );

    if (!validacao.success) {
        return resposta.status(400).send({
            mensagem: "Dados invalidos para substituicao do funcionario.",
            erros: validacao.error.issues.map((erro) => ({
                campo: erro.path.join(".") || "dados",
                mensagem: erro.message
            }))
        });
    }

    try {
        const funcionario = await substituirFuncionarioServico(
            identificador.data.id,
            validacao.data
        );

        if (!funcionario) {
            return resposta.status(404).send({
                mensagem: "Funcionario nao encontrado."
            });
        }

        return resposta.status(200).send(funcionario);
    } catch (erro: unknown) {
        if (
            typeof erro === "object" &&
            erro !== null &&
            "code" in erro
        ) {
            if (erro.code === "23505") {
                const restricao =
                    "constraint" in erro ? erro.constraint : null;

                const campo =
                    restricao === "funcionarios_email_corporativo_key"
                        ? "email_corporativo"
                        : restricao === "funcionarios_matricula_key"
                            ? "matricula"
                            : "dados";

                return resposta.status(409).send({
                    mensagem: "Ja existe um funcionario com esse valor.",
                    erros: [
                        {
                            campo,
                            mensagem: "O valor informado ja esta cadastrado."
                        }
                    ]
                });
            }

            if (erro.code === "23503") {
                return resposta.status(409).send({
                    mensagem:
                        "O gestor informado nao existe ou ha um relacionamento invalido."
                });
            }
        }

        throw erro;
    }
}

import type {
    CriarFuncionario,
    Paginacao,
    FiltrosBuscarFuncionarios,
    AtualizarFuncionario,
    SubstituirFuncionario
} from "./funcionarios.schema.js";

import {
    listarFuncionariosRepositorio,
    criarFuncionarioRepositorio,
    excluirFuncionarioRepositorio,
    buscarFuncionariosRepositorio,
    atualizarFuncionarioRepositorio,
    substituirFuncionarioRepositorio
} from "./funcionarios.repository.js";

/** Encaminha a criação para o repository, mantendo a regra de negócio isolada da HTTP. */
export async function criarFuncionarioServico(
    dados: CriarFuncionario
) {
    return criarFuncionarioRepositorio(dados);
}

/** Remove um funcionário e informa se uma linha foi afetada. */
export async function excluirFuncionarioServico(
    id: string
) {
    return excluirFuncionarioRepositorio(id);
}

/**
 * Monta o envelope comum das consultas paginadas.
 * @param dados Registros da página atual.
 * @param totalRegistros Quantidade total após aplicar filtros.
 * @param paginacao Página e limite usados na consulta.
 * @returns Dados e metadados para o cliente navegar pelas páginas.
 */
function montarRespostaPaginada(
    dados: unknown[],
    totalRegistros: number,
    paginacao: Paginacao
) {
    const totalPaginas = Math.ceil(
        totalRegistros / paginacao.limite
    );

    return {
        dados,
        paginacao: {
            pagina: paginacao.pagina,
            limite: paginacao.limite,
            total_registros: totalRegistros,
            total_paginas: totalPaginas,
            tem_proxima_pagina: paginacao.pagina < totalPaginas,
            tem_pagina_anterior:
                paginacao.pagina > 1 && totalPaginas > 0
        }
    };
}

/** Lista funcionários sem filtros e calcula os metadados de paginação. */
export async function listarFuncionariosServico(
    paginacao: Paginacao
) {
    const resultado = await listarFuncionariosRepositorio(
        paginacao
    );

    return montarRespostaPaginada(
        resultado.dados,
        resultado.total_registros,
        paginacao
    );
}

/** Busca funcionários com filtros e paginação. */
export async function buscarFuncionariosServico(
    filtros: FiltrosBuscarFuncionarios
) {
    const resultado = await buscarFuncionariosRepositorio(
        filtros
    );

    return montarRespostaPaginada(
        resultado.dados,
        resultado.total_registros,
        filtros
    );
}

/** Encaminha uma atualização parcial ao repository. */
export async function atualizarFuncionarioServico(
    id: string,
    dados: AtualizarFuncionario
) {
    return atualizarFuncionarioRepositorio(id, dados);
}

/** Encaminha uma substituição completa ao repository. */
export async function substituirFuncionarioServico(
    id: string,
    dados: SubstituirFuncionario
) {
    return substituirFuncionarioRepositorio(id, dados);
}

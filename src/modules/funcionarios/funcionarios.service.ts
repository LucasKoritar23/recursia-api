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

export async function criarFuncionarioServico(
    dados: CriarFuncionario
) {
    return criarFuncionarioRepositorio(dados);
}

export async function excluirFuncionarioServico(
    id: string
) {
    return excluirFuncionarioRepositorio(id);
}

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

export async function atualizarFuncionarioServico(
    id: string,
    dados: AtualizarFuncionario
) {
    return atualizarFuncionarioRepositorio(id, dados);
}

export async function substituirFuncionarioServico(
    id: string,
    dados: SubstituirFuncionario
) {
    return substituirFuncionarioRepositorio(id, dados);
}
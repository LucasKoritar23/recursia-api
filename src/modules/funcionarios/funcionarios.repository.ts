import { banco } from "../../configs/banco.js";
import type {
    AtualizarFuncionario,
    CriarFuncionario,
    FiltrosBuscarFuncionarios,
    Paginacao,
    SubstituirFuncionario
} from "./funcionarios.schema.js";

type FiltrosConsulta = Partial<
    Pick<
        FiltrosBuscarFuncionarios,
        "id" | "nome_completo" | "matricula" | "tipo_contrato"
    >
>;

/** Insere um funcionário usando query parametrizada e retorna a linha criada. */
export async function criarFuncionarioRepositorio(
    dados: CriarFuncionario
) {
    const consulta = `
    INSERT INTO public.funcionarios (
      nome_completo,
      email_corporativo,
      matricula,
      data_admissao,
      tipo_contrato,
      modelo_trabalho,
      situacao,
      departamento_id,
      cargo_id,
      gestor_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

    // Os placeholders ($1...$10) separam SQL de dados e evitam interpolação insegura.
    const valores = [
        dados.nome_completo,
        dados.email_corporativo,
        dados.matricula,
        dados.data_admissao,
        dados.tipo_contrato,
        dados.modelo_trabalho ?? null,
        dados.situacao,
        dados.departamento_id ?? null,
        dados.cargo_id ?? null,
        dados.gestor_id ?? null
    ];

    const resultado = await banco.query(consulta, valores);

    return resultado.rows[0];
}

/** Exclui por UUID e retorna true somente quando uma linha foi removida. */
export async function excluirFuncionarioRepositorio(
    id: string
) {
    const resultado = await banco.query(
        `DELETE FROM public.funcionarios
     WHERE id = $1
     RETURNING id`,
        [id]
    );

    return resultado.rowCount === 1;
}

async function consultarFuncionariosPaginados(
    paginacao: Paginacao,
    filtros: FiltrosConsulta = {}
) {
    // Condições e valores são montados separadamente para manter a query parametrizada.
    const condicoes: string[] = [];
    const valores: string[] = [];

    if (filtros.id !== undefined) {
        valores.push(filtros.id);
        condicoes.push(`id = $${valores.length}`);
    }

    if (filtros.nome_completo !== undefined) {
        valores.push(`%${filtros.nome_completo}%`);
        condicoes.push(`nome_completo ILIKE $${valores.length}`);
    }

    if (filtros.matricula !== undefined) {
        valores.push(filtros.matricula);
        condicoes.push(`matricula = $${valores.length}`);
    }

    if (filtros.tipo_contrato !== undefined) {
        valores.push(filtros.tipo_contrato);
        condicoes.push(`tipo_contrato = $${valores.length}`);
    }

    const onde = condicoes.length > 0
        ? `WHERE ${condicoes.join(" AND ")}`
        : "";

    const consultaTotal = `
    SELECT COUNT(*) AS total
    FROM public.funcionarios
    ${onde}
  `;

    // A contagem é feita separadamente para calcular total_paginas.
    const resultadoTotal = await banco.query(
        consultaTotal,
        valores
    );

    const totalRegistros = Number(
        resultadoTotal.rows[0].total
    );

    const deslocamento =
        (paginacao.pagina - 1) * paginacao.limite;

    const indiceLimite = valores.length + 1;
    const indiceDeslocamento = valores.length + 2;

    const consultaDados = `
    SELECT *
    FROM public.funcionarios
    ${onde}
    ORDER BY nome_completo ASC, id ASC
    LIMIT $${indiceLimite}
    OFFSET $${indiceDeslocamento}
  `;

    // LIMIT/OFFSET implementam a paginação após a ordenação estável.
    const resultadoDados = await banco.query(
        consultaDados,
        [...valores, paginacao.limite, deslocamento]
    );

    return {
        dados: resultadoDados.rows,
        total_registros: totalRegistros
    };
}

/** Consulta a página sem filtros. */
export async function listarFuncionariosRepositorio(
    paginacao: Paginacao
) {
    return consultarFuncionariosPaginados(paginacao);
}

/** Consulta a página aplicando todos os filtros informados com AND. */
export async function buscarFuncionariosRepositorio(
    filtros: FiltrosBuscarFuncionarios
) {
    return consultarFuncionariosPaginados(
        {
            pagina: filtros.pagina,
            limite: filtros.limite
        },
        filtros
    );
}

/** Atualiza apenas colunas presentes no body e retorna o registro atualizado. */
export async function atualizarFuncionarioRepositorio(
    id: string,
    dados: AtualizarFuncionario
) {
    const camposPermitidos = [
        "nome_completo",
        "email_corporativo",
        "matricula",
        "data_admissao",
        "tipo_contrato",
        "modelo_trabalho",
        "situacao",
        "departamento_id",
        "cargo_id",
        "gestor_id"
    ] as const;

    // A lista fixa impede que chaves arbitrárias do body virem SQL executável.
    const campos = camposPermitidos.filter(
        (campo) => dados[campo] !== undefined
    );

    const valores = campos.map((campo) => dados[campo]);

    const atualizacoes = campos.map(
        (campo, indice) => `${campo} = $${indice + 1}`
    );

    const consulta = `
    UPDATE public.funcionarios
    SET
      ${atualizacoes.join(", ")},
      atualizado_em = NOW()
    WHERE id = $${valores.length + 1}
    RETURNING *
  `;

    const resultado = await banco.query(
        consulta,
        [...valores, id]
    );

    return resultado.rows[0] ?? null;
}

/** Substitui todas as colunas editáveis pelo conteúdo completo recebido. */
export async function substituirFuncionarioRepositorio(
    id: string,
    dados: SubstituirFuncionario
) {
    const consulta = `
    UPDATE public.funcionarios
    SET
      nome_completo = $1,
      email_corporativo = $2,
      matricula = $3,
      data_admissao = $4,
      tipo_contrato = $5,
      modelo_trabalho = $6,
      situacao = $7,
      departamento_id = $8,
      cargo_id = $9,
      gestor_id = $10,
      atualizado_em = NOW()
    WHERE id = $11
    RETURNING *
  `;

    const valores = [
        dados.nome_completo,
        dados.email_corporativo,
        dados.matricula,
        dados.data_admissao,
        dados.tipo_contrato,
        dados.modelo_trabalho,
        dados.situacao,
        dados.departamento_id,
        dados.cargo_id,
        dados.gestor_id,
        id
    ];

    const resultado = await banco.query(consulta, valores);

    return resultado.rows[0] ?? null;
}

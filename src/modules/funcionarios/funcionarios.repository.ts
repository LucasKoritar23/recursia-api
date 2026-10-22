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

    const resultadoDados = await banco.query(
        consultaDados,
        [...valores, paginacao.limite, deslocamento]
    );

    return {
        dados: resultadoDados.rows,
        total_registros: totalRegistros
    };
}

export async function listarFuncionariosRepositorio(
    paginacao: Paginacao
) {
    return consultarFuncionariosPaginados(paginacao);
}

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
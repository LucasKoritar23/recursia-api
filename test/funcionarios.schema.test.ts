import { describe, expect, it } from "vitest";

import {
    esquemaAtualizarFuncionario,
    esquemaBuscarFuncionarios,
    esquemaCriarFuncionario,
    esquemaPaginacao,
    esquemaSubstituirFuncionario
} from "../src/modules/funcionarios/funcionarios.schema.js";

const uuid = "123e4567-e89b-12d3-a456-426614174000";
const funcionario = {
    nome_completo: "Ana Souza",
    email_corporativo: "ana.souza@empresa.com",
    matricula: "REC-123456",
    data_admissao: "2026-01-15",
    tipo_contrato: "CLT",
    modelo_trabalho: "HIBRIDO" as const,
    situacao: "ATIVO" as const,
    departamento_id: uuid,
    cargo_id: uuid,
    gestor_id: null
};

describe("schemas de funcionários", () => {
    it("aceita criação válida e aplica situação padrão", () => {
        const resultado = esquemaCriarFuncionario.parse({
            ...funcionario,
            situacao: undefined,
            modelo_trabalho: undefined
        });

        expect(resultado.situacao).toBe("ATIVO");
        expect(resultado.modelo_trabalho).toBeUndefined();
    });

    it("rejeita nome, e-mail e data inválidos", () => {
        const resultado = esquemaCriarFuncionario.safeParse({
            ...funcionario,
            nome_completo: "A",
            email_corporativo: "invalido",
            data_admissao: "15/01/2026"
        });

        expect(resultado.success).toBe(false);
        if (!resultado.success) expect(resultado.error.issues.length).toBeGreaterThanOrEqual(3);
    });

    it("exige um filtro de busca e converte paginação", () => {
        expect(esquemaBuscarFuncionarios.safeParse({}).success).toBe(false);
        expect(esquemaBuscarFuncionarios.parse({ matricula: "REC-123456" })).toEqual({
            pagina: 1,
            limite: 10,
            matricula: "REC-123456"
        });
        expect(esquemaPaginacao.parse({ pagina: "2", limite: "20" })).toEqual({ pagina: 2, limite: 20 });
    });

    it("valida regras de PATCH e PUT", () => {
        expect(esquemaAtualizarFuncionario.safeParse({}).success).toBe(false);
        expect(esquemaAtualizarFuncionario.safeParse({ nome_completo: "Novo Nome" }).success).toBe(true);
        expect(esquemaSubstituirFuncionario.safeParse(funcionario).success).toBe(true);
        expect(esquemaSubstituirFuncionario.safeParse({ ...funcionario, cargo_id: undefined }).success).toBe(false);
    });
});

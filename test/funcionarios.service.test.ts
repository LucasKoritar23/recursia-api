import { beforeEach, describe, expect, it, vi } from "vitest";

const repositorio = {
    listarFuncionariosRepositorio: vi.fn(),
    buscarFuncionariosRepositorio: vi.fn(),
    criarFuncionarioRepositorio: vi.fn(),
    excluirFuncionarioRepositorio: vi.fn(),
    atualizarFuncionarioRepositorio: vi.fn(),
    substituirFuncionarioRepositorio: vi.fn()
};

vi.mock("../src/modules/funcionarios/funcionarios.repository.js", () => repositorio);

const {
    listarFuncionariosServico,
    buscarFuncionariosServico,
    criarFuncionarioServico,
    excluirFuncionarioServico
} = await import("../src/modules/funcionarios/funcionarios.service.js");

describe("serviço de funcionários", () => {
    beforeEach(() => vi.clearAllMocks());

    it("monta metadados de paginação", async () => {
        repositorio.listarFuncionariosRepositorio.mockResolvedValue({
            dados: [{ id: "1" }],
            total_registros: 21
        });

        await expect(listarFuncionariosServico({ pagina: 2, limite: 10 })).resolves.toEqual({
            dados: [{ id: "1" }],
            paginacao: {
                pagina: 2,
                limite: 10,
                total_registros: 21,
                total_paginas: 3,
                tem_proxima_pagina: true,
                tem_pagina_anterior: true
            }
        });
    });

    it("encaminha filtros e operações ao repository", async () => {
        const filtros = { pagina: 1, limite: 10, nome_completo: "Ana" } as never;
        repositorio.buscarFuncionariosRepositorio.mockResolvedValue({ dados: [], total_registros: 0 });
        repositorio.criarFuncionarioRepositorio.mockResolvedValue({ id: "1" });
        repositorio.excluirFuncionarioRepositorio.mockResolvedValue(true);

        await buscarFuncionariosServico(filtros);
        await criarFuncionarioServico({} as never);
        await excluirFuncionarioServico("id");

        expect(repositorio.buscarFuncionariosRepositorio).toHaveBeenCalledWith(filtros);
        expect(repositorio.criarFuncionarioRepositorio).toHaveBeenCalledWith({});
        expect(repositorio.excluirFuncionarioRepositorio).toHaveBeenCalledWith("id");
    });
});

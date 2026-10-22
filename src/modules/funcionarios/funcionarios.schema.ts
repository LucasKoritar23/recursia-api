import { z } from "zod";

export const esquemaCriarFuncionario = z.object({
    nome_completo: z
        .string({ error: "O nome completo deve ser informado." })
        .trim()
        .min(3, "O nome completo deve conter pelo menos 3 caracteres.")
        .max(150, "O nome completo deve conter no maximo 150 caracteres.")
        .describe("Nome completo do funcionário."),

    email_corporativo: z
        .email({ error: "Informe um e-mail corporativo valido." })
        .max(255, "O e-mail corporativo deve conter no maximo 255 caracteres.")
        .describe("E-mail corporativo único."),

    matricula: z
        .string({ error: "A matricula deve ser informada." })
        .trim()
        .min(1, "A matricula nao pode estar vazia.")
        .max(30, "A matricula deve conter no maximo 30 caracteres.")
        .describe("Matrícula funcional."),

    data_admissao: z.iso.date({
        error: "Informe uma data de admissao valida no formato AAAA-MM-DD."
    }).describe("Data de admissão no formato AAAA-MM-DD."),

    tipo_contrato: z
        .string({ error: "O tipo de contrato deve ser informado." })
        .trim()
        .min(1, "O tipo de contrato nao pode estar vazio.")
        .max(30, "O tipo de contrato deve conter no maximo 30 caracteres."),

    modelo_trabalho: z
        .enum(["PRESENCIAL", "HIBRIDO", "REMOTO"], {
            error: "O modelo de trabalho deve ser PRESENCIAL, HIBRIDO ou REMOTO."
        })
        .nullish(),

    situacao: z
        .enum(["ATIVO", "AFASTADO", "DESLIGADO"], {
            error: "A situacao deve ser ATIVO, AFASTADO ou DESLIGADO."
        })
        .default("ATIVO"),

    departamento_id: z
        .uuid({
            error: "O departamento deve possuir um UUID valido."
        })
        .nullish(),

    cargo_id: z
        .uuid({
            error: "O cargo deve possuir um UUID valido."
        })
        .nullish(),

    gestor_id: z
        .uuid({
            error: "O gestor deve possuir um UUID valido."
        })
        .nullish()
});

export const esquemaIdentificadorFuncionario = z.object({
    id: z.uuid({
        error: "O identificador do funcionario deve ser um UUID valido."
    })
});

export const esquemaPaginacao = z.object({
    pagina: z.coerce
        .number<string>({
            error: "A pagina deve ser um numero inteiro."
        })
        .int("A pagina deve ser um numero inteiro.")
        .min(1, "A pagina deve ser maior ou igual a 1.")
        .max(1000000, "A pagina excede o limite permitido.")
        .default(1),

    limite: z.coerce
        .number<string>({
            error: "O limite deve ser um numero inteiro."
        })
        .int("O limite deve ser um numero inteiro.")
        .min(1, "O limite deve ser maior ou igual a 1.")
        .max(100, "O limite maximo permitido e 100.")
        .default(10)
});

export const esquemaBuscarFuncionarios = esquemaPaginacao
    .extend({
        id: z.uuid({
            error: "O ID do funcionario deve ser um UUID valido."
        }).optional(),

        nome_completo: z
            .string()
            .trim()
            .min(1, "O nome completo nao pode estar vazio.")
            .max(150, "O nome completo deve ter no maximo 150 caracteres.")
            .optional(),

        matricula: z
            .string()
            .trim()
            .regex(
                /^REC-\d{6}$/,
                "A matricula deve seguir o formato REC-123456."
            )
            .optional(),

        tipo_contrato: z
            .string()
            .trim()
            .optional()
    })
    .refine(
        (filtros) =>
            filtros.id !== undefined ||
            filtros.nome_completo !== undefined ||
            filtros.matricula !== undefined ||
            filtros.tipo_contrato !== undefined,
        {
            message: "Informe pelo menos um filtro para realizar a busca."
        }
    );

export const esquemaAtualizarFuncionario = esquemaCriarFuncionario
    .partial()
    .extend({
        situacao: z
            .enum(["ATIVO", "AFASTADO", "DESLIGADO"], {
                error: "A situacao deve ser ATIVO, AFASTADO ou DESLIGADO."
            })
            .optional()
    })
    .strict()
    .refine(
        (dados) => Object.keys(dados).length > 0,
        {
            message: "Informe pelo menos um campo para atualizar."
        }
    );

export const esquemaSubstituirFuncionario = esquemaCriarFuncionario
    .extend({
        situacao: z.enum(
            ["ATIVO", "AFASTADO", "DESLIGADO"],
            {
                error: "A situacao deve ser ATIVO, AFASTADO ou DESLIGADO."
            }
        ),

        modelo_trabalho: z
            .enum(["PRESENCIAL", "HIBRIDO", "REMOTO"], {
                error: "O modelo de trabalho deve ser PRESENCIAL, HIBRIDO ou REMOTO."
            })
            .nullable(),

        departamento_id: z
            .uuid({
                error: "O departamento deve possuir um UUID valido."
            })
            .nullable(),

        cargo_id: z
            .uuid({
                error: "O cargo deve possuir um UUID valido."
            })
            .nullable(),

        gestor_id: z
            .uuid({
                error: "O gestor deve possuir um UUID valido."
            })
            .nullable()
    })
    .strict();

export type SubstituirFuncionario = z.infer<typeof esquemaSubstituirFuncionario>;

export type FiltrosBuscarFuncionarios = z.infer<typeof esquemaBuscarFuncionarios>;

export type Paginacao = z.infer<typeof esquemaPaginacao>;

export type CriarFuncionario = z.infer<typeof esquemaCriarFuncionario>;

export type AtualizarFuncionario = z.infer<typeof esquemaAtualizarFuncionario>;

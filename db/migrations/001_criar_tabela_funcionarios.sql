CREATE TABLE public.funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome_completo VARCHAR(150) NOT NULL,
    email_corporativo VARCHAR(255) NOT NULL UNIQUE,
    matricula VARCHAR(30) NOT NULL UNIQUE,

    data_admissao DATE NOT NULL,
    tipo_contrato VARCHAR(30) NOT NULL,
    modelo_trabalho VARCHAR(20),

    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    departamento_id UUID,
    cargo_id UUID,
    gestor_id UUID,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_funcionarios_gestor
        FOREIGN KEY (gestor_id)
        REFERENCES public.funcionarios(id),

    CONSTRAINT ck_funcionarios_situacao
        CHECK (
            situacao IN (
                'ATIVO',
                'AFASTADO',
                'DESLIGADO'
            )
        ),

    CONSTRAINT ck_funcionarios_modelo_trabalho
        CHECK (
            modelo_trabalho IN (
                'PRESENCIAL',
                'HIBRIDO',
                'REMOTO'
            )
        )
);
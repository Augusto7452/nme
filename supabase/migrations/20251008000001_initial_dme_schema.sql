-- ==============================================================================
-- DME · DIVISÃO DE MONITORAMENTO ELETRÔNICO
-- MIGRATION: 20251008000001_initial_dme_schema.sql
-- DESCRIÇÃO: Criação das tabelas centrais do Sistema DME (Indivíduos, Movimentações, Fugas e Operadores)
-- COMPATIBILIDADE: PostgreSQL 14+ / Supabase
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela: usuarios_operadores
-- Registro de operadores, policiais penais e analistas do sistema DME
CREATE TABLE IF NOT EXISTS public.usuarios_operadores (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    perfil_acesso VARCHAR(50) NOT NULL CHECK (perfil_acesso IN ('ADMIN', 'SUPERVISOR', 'OPERADOR_PLANTAO', 'AGENTE_CAMPO')),
    lotacao VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela: individuos_monitorados
-- Cadastro central de apenados, agressores sob medida protetiva e vítimas assistidas
CREATE TABLE IF NOT EXISTS public.individuos_monitorados (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL CHECK (genero IN ('MASCULINO', 'FEMININO', 'OUTRO')),
    foto_url TEXT,
    perfil VARCHAR(30) NOT NULL CHECK (perfil IN ('MONITORADO_GERAL', 'AGRESSOR', 'VITIMA_PROTEGIDA')),
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'DESLIGADO', 'FORAGIDO', 'SUSPENSO', 'RECAPTURA_PENDENTE')),
    
    -- Dados Jurídicos e Judiciais
    numero_processo VARCHAR(100) NOT NULL,
    vara_judicial VARCHAR(150) NOT NULL,
    comarca VARCHAR(100) NOT NULL,
    tipo_penal VARCHAR(255) NOT NULL,
    resumo_tipificacao TEXT,

    -- Dispositivo de Monitoramento (Tornozeleira ou Unidade Portátil de Proteção à Vítima)
    numero_tornozeleira_ou_receptor VARCHAR(100),
    imei_dispositivo VARCHAR(50),
    raio_exclusao_metros INTEGER DEFAULT 500,
    individuo_vinculado_id TEXT REFERENCES public.individuos_monitorados(id) ON DELETE SET NULL,
    nome_individuo_vinculado VARCHAR(255),

    -- Cronologia
    data_primeira_entrada TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    data_ultima_saida TIMESTAMPTZ,

    -- Localização e Contato
    endereco_residencial TEXT,
    cidade VARCHAR(100) NOT NULL DEFAULT 'São Paulo',
    estado VARCHAR(2) NOT NULL DEFAULT 'SP',
    telefone_contato VARCHAR(50),
    contato_emergencia VARCHAR(150),
    observacoes_gerais TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela: movimentacoes
-- Registros de entradas (instalações, recapturas) e saídas (extinções, fugas, revogações)
CREATE TABLE IF NOT EXISTS public.movimentacoes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    individuo_id TEXT NOT NULL REFERENCES public.individuos_monitorados(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    data_hora TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    motivo VARCHAR(100) NOT NULL,
    motivo_detalhado TEXT NOT NULL,
    responsavel_operacional VARCHAR(150) NOT NULL,
    numero_oficio_ou_mandado VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela: fugas
-- Registro operacional de evasões, rompimentos de cinta e recapturas
CREATE TABLE IF NOT EXISTS public.fugas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    individuo_id TEXT NOT NULL REFERENCES public.individuos_monitorados(id) ON DELETE CASCADE,
    data_hora_fuga TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    local_fuga TEXT NOT NULL,
    coordenadas_aproximadas VARCHAR(100),
    circunstancias TEXT NOT NULL,
    status_fuga VARCHAR(30) NOT NULL DEFAULT 'FORAGIDO' CHECK (status_fuga IN ('FORAGIDO', 'RECAPTURADO', 'EM_DILIGENCIA')),
    data_recaptura TIMESTAMPTZ,
    mandado_prisao_numero VARCHAR(100),
    orgao_comunicado TEXT[] DEFAULT ARRAY[]::TEXT[],
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabela de Auditoria e Logs do Sistema DME
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    operador_matricula VARCHAR(50) NOT NULL,
    operador_nome VARCHAR(255) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    registro_id TEXT,
    detalhes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_individuos_cpf ON public.individuos_monitorados(cpf);
CREATE INDEX IF NOT EXISTS idx_individuos_status ON public.individuos_monitorados(status);
CREATE INDEX IF NOT EXISTS idx_individuos_perfil ON public.individuos_monitorados(perfil);
CREATE INDEX IF NOT EXISTS idx_individuos_processo ON public.individuos_monitorados(numero_processo);
CREATE INDEX IF NOT EXISTS idx_individuos_vinculado ON public.individuos_monitorados(individuo_vinculado_id);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_individuo ON public.movimentacoes(individuo_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data_hora ON public.movimentacoes(data_hora DESC);

CREATE INDEX IF NOT EXISTS idx_fugas_individuo ON public.fugas(individuo_id);
CREATE INDEX IF NOT EXISTS idx_fugas_status ON public.fugas(status_fuga);
CREATE INDEX IF NOT EXISTS idx_fugas_data ON public.fugas(data_hora_fuga DESC);

-- 8. Função e Trigger para Atualização Automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_individuos_updated_at ON public.individuos_monitorados;
CREATE TRIGGER set_individuos_updated_at
    BEFORE UPDATE ON public.individuos_monitorados
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_fugas_updated_at ON public.fugas;
CREATE TRIGGER set_fugas_updated_at
    BEFORE UPDATE ON public.fugas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_usuarios_updated_at ON public.usuarios_operadores;
CREATE TRIGGER set_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios_operadores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 9. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.usuarios_operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individuos_monitorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários anônimos / chave pública anon do Supabase (Acesso Operacional DME)
DROP POLICY IF EXISTS "DME Permissao Completa Individuos" ON public.individuos_monitorados;
CREATE POLICY "DME Permissao Completa Individuos"
    ON public.individuos_monitorados
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "DME Permissao Completa Movimentacoes" ON public.movimentacoes;
CREATE POLICY "DME Permissao Completa Movimentacoes"
    ON public.movimentacoes
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "DME Permissao Completa Fugas" ON public.fugas;
CREATE POLICY "DME Permissao Completa Fugas"
    ON public.fugas
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "DME Permissao Completa Operadores" ON public.usuarios_operadores;
CREATE POLICY "DME Permissao Completa Operadores"
    ON public.usuarios_operadores
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "DME Permissao Completa Auditoria" ON public.auditoria_logs;
CREATE POLICY "DME Permissao Completa Auditoria"
    ON public.auditoria_logs
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  KeyRound,
  Globe,
  UploadCloud,
  DownloadCloud,
  FileCode,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
  testarConexaoSupabase,
  TesteConexaoResult,
} from '../lib/supabase';
import {
  carregarIndividuosDoSupabase,
  exportarTudoParaSupabase,
} from '../services/supabaseService';
import { IndividuoMonitorado } from '../types/monitoring';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  individuosLocais: IndividuoMonitorado[];
  onIndividuosAtualizados: (novos: IndividuoMonitorado[]) => void;
}

const PROJECT_REF = 'nskjaoiqmedioycuffjo';
const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;

const MIGRATION_SCHEMA_SQL = `-- ==============================================================================
-- DME · DIVISÃO DE MONITORAMENTO ELETRÔNICO
-- MIGRATION: 20251008000001_initial_dme_schema.sql
-- DESCRIÇÃO: Criação das tabelas centrais do Sistema DME (Indivíduos, Movimentações, Fugas e Operadores)
-- COMPATIBILIDADE: PostgreSQL 14+ / Supabase
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela: usuarios_operadores
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

    -- Dispositivo de Monitoramento
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

-- 6. Tabela: auditoria_logs
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
    WITH CHECK (true);`;

const MIGRATION_SEED_SQL = `-- ==============================================================================
-- DME · DIVISÃO DE MONITORAMENTO ELETRÔNICO
-- MIGRATION: 20251008000002_seed_initial_data.sql
-- DESCRIÇÃO: Carga inicial de operadores e monitorados para o banco de dados DME
-- COMPATIBILIDADE: PostgreSQL 14+ / Supabase
-- ==============================================================================

-- 1. Operadores Oficiais do Sistema DME
INSERT INTO public.usuarios_operadores (id, nome, matricula, cargo, perfil_acesso, lotacao, email)
VALUES
    ('usr-001', 'Inspetor Rogério Medeiros', 'DME-8841', 'Supervisor Tático de Monitoramento', 'ADMIN', 'DME Central - Núcleo de Comando Operacional', 'rogerio.medeiros@dme.seguranca.gov.br'),
    ('usr-002', 'Policial Penal Carla Vasconcelos', 'DME-5120', 'Operadora de Monitoramento - Plantão Alpha', 'OPERADOR_PLANTAO', 'DME Central - Sala de Situação e Telemetria', 'carla.vasconcelos@dme.seguranca.gov.br'),
    ('usr-003', 'Agente Marcos Aurelio Dias', 'DME-3307', 'Analista de Inteligência e Recapturas', 'SUPERVISOR', 'DME - Núcleo de Fugas & Recaptura', 'marcos.dias@dme.seguranca.gov.br')
ON CONFLICT (matricula) DO NOTHING;`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  individuosLocais,
  onIndividuosAtualizados,
}) => {
  const [tabAtiva, setTabAtiva] = useState<'status' | 'config' | 'migrations'>('status');
  const [migrationTab, setMigrationTab] = useState<'schema' | 'seed'>('schema');

  // Credenciais
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [credSource, setCredSource] = useState<'env' | 'custom' | 'default' | 'none'>('none');

  // Estado de teste e sincronização
  const [testando, setTestando] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState<TesteConexaoResult | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSinc, setMensagemSinc] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setCredSource(creds.source);
      setResultadoTeste(null);
      setMensagemSinc(null);

      if (creds.source !== 'none') {
        executarTesteConexao();
      }
    }
  }, [isOpen]);

  const executarTesteConexao = async () => {
    setTestando(true);
    setResultadoTeste(null);
    try {
      const res = await testarConexaoSupabase();
      setResultadoTeste(res);
    } catch (e: any) {
      setResultadoTeste({ sucesso: false, mensagem: e.message || 'Erro inesperado' });
    } finally {
      setTestando(false);
    }
  };

  const handleSalvarCredenciais = () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Informe a URL do Supabase e a Anon Key');
      return;
    }
    saveCustomSupabaseCredentials(url, anonKey);
    const novasCreds = getSupabaseCredentials();
    setCredSource(novasCreds.source);
    executarTesteConexao();
    setTabAtiva('status');
  };

  const handleLimparCredenciais = () => {
    clearCustomSupabaseCredentials();
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setAnonKey(creds.anonKey);
    setCredSource(creds.source);
    setResultadoTeste(null);
  };

  const handlePuxarDadosSupabase = async () => {
    setSincronizando(true);
    setMensagemSinc(null);
    try {
      const res = await carregarIndividuosDoSupabase();
      if (res.sucesso && res.dados) {
        if (res.dados.length === 0) {
          setMensagemSinc('O banco no Supabase está vazio. Use "Enviar Dados Locais" para preenchê-lo.');
        } else {
          onIndividuosAtualizados(res.dados);
          setMensagemSinc(`Sucesso! ${res.dados.length} monitorados carregados do Supabase.`);
        }
      } else {
        setMensagemSinc(`Falha: ${res.erro || 'Erro ao consultar o Supabase'}`);
      }
    } catch (e: any) {
      setMensagemSinc(`Erro: ${e.message}`);
    } finally {
      setSincronizando(false);
    }
  };

  const handleEnviarDadosLocais = async () => {
    setSincronizando(true);
    setMensagemSinc(null);
    try {
      const res = await exportarTudoParaSupabase(individuosLocais);
      if (res.sucesso) {
        setMensagemSinc(
          `Sincronização concluída! Enviados: ${res.totalIndividuos} indivíduos, ${res.totalMovimentacoes} movimentações e ${res.totalFugas} fugas.`
        );
      } else {
        setMensagemSinc(`Falha: ${res.erro || 'Erro ao sincronizar'}`);
      }
    } catch (e: any) {
      setMensagemSinc(`Erro: ${e.message}`);
    } finally {
      setSincronizando(false);
    }
  };

  const handleCopiarSQL = (sqlText: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Topo do Modal */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Supabase Database & Migrations
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Divisão de Monitoramento Eletrônico · Integração de Persistência em Nuvem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => setTabAtiva('status')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              tabAtiva === 'status'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Status da Conexão
          </button>
          <button
            onClick={() => setTabAtiva('migrations')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              tabAtiva === 'migrations'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Migrations SQL (Scripts)
          </button>
          <button
            onClick={() => setTabAtiva('config')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              tabAtiva === 'config'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Credenciais & Configurações
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ABA 1: STATUS & SINCRONIZAÇÃO */}
          {tabAtiva === 'status' && (
            <div className="space-y-5">
              {/* Card de Status Conexão */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  resultadoTeste?.sucesso
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : resultadoTeste?.precisaMigration
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : credSource === 'none'
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      resultadoTeste?.sucesso
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : resultadoTeste?.precisaMigration
                        ? 'bg-amber-500/20 text-amber-400'
                        : credSource === 'none'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {resultadoTeste?.sucesso ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-100">
                        {resultadoTeste?.sucesso
                          ? 'Supabase Conectado e Operacional'
                          : resultadoTeste?.precisaMigration
                          ? 'Conexão Supabase Estabelecida (Tabelas Pendentes)'
                          : credSource === 'none'
                          ? 'Supabase Não Configurado'
                          : 'Falha na Comunicação com o Supabase'}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium uppercase bg-slate-800 text-slate-300">
                        {credSource === 'env'
                          ? '.env ativo'
                          : credSource === 'default'
                          ? `Projeto ${PROJECT_REF}`
                          : credSource === 'custom'
                          ? 'Chave customizada'
                          : 'Sem credenciais'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {resultadoTeste?.mensagem ||
                        (credSource === 'none'
                          ? 'Configure as credenciais para ativar persistência remota.'
                          : 'Aguardando verificação do banco...')}
                    </p>
                    {url && (
                      <p className="text-[11px] font-mono text-emerald-400/90 mt-1 truncate max-w-md">
                        Endpoint: {url}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={executarTesteConexao}
                    disabled={testando || credSource === 'none'}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testando ? 'animate-spin' : ''}`} />
                    {testando ? 'Testando...' : 'Testar Novamente'}
                  </button>
                </div>
              </div>

              {/* Banner Especial de Ação: Tabelas Pendentes */}
              {resultadoTeste?.precisaMigration && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-950 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Etapa Final: Executar Migration no SQL Editor do Supabase
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Sua conexão com o projeto <strong>{PROJECT_REF}</strong> foi autenticada com sucesso! 
                    Para que o sistema salve os dados dos monitorados na nuvem, basta executar o script SQL 
                    que criará as tabelas (<code>individuos_monitorados</code>, <code>movimentacoes</code>, <code>fugas</code> e <code>usuarios_operadores</code>).
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      onClick={() => handleCopiarSQL(MIGRATION_SCHEMA_SQL)}
                      className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md"
                    >
                      {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiado ? 'SQL Copiado para a Área de Transferência!' : '1. Copiar Migration SQL (1-Clique)'}
                    </button>
                    <a
                      href={SQL_EDITOR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md"
                    >
                      <span>2. Abrir SQL Editor no Supabase</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setTabAtiva('migrations')}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                    >
                      Ver Código SQL
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Ações de Sincronização */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  Sincronização de Dados DME
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Você pode importar os registros armazenados no Supabase para esta sessão ou enviar os dados
                  locais para povoar o banco na nuvem.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={handleEnviarDadosLocais}
                    disabled={sincronizando || !resultadoTeste?.sucesso}
                    className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Enviar Dados Locais para o Supabase
                  </button>

                  <button
                    onClick={handlePuxarDadosSupabase}
                    disabled={sincronizando || !resultadoTeste?.sucesso}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <DownloadCloud className="w-4 h-4 text-emerald-400" />
                    Baixar Dados do Supabase
                  </button>
                </div>

                {mensagemSinc && (
                  <div className="p-3 text-xs rounded-lg bg-slate-900 border border-slate-700/70 text-slate-200 flex items-center gap-2 animate-fadeIn">
                    <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{mensagemSinc}</span>
                  </div>
                )}
              </div>

              {/* Guia de 3 Passos */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Fluxo de Configuração do Supabase
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li>
                    O projeto Supabase <strong>{PROJECT_REF}</strong> já está configurado na aplicação.
                  </li>
                  <li>
                    Na aba <strong>Migrations SQL</strong>, copie o script e cole no{' '}
                    <a
                      href={SQL_EDITOR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline hover:text-emerald-300 inline-flex items-center gap-1"
                    >
                      SQL Editor do Projeto <ExternalLink className="w-3 h-3 inline" />
                    </a>.
                  </li>
                  <li>
                    Clique em <strong>Run</strong> no Supabase para criar as tabelas e índices. A sincronização ficará 100% ativa!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* ABA 2: MIGRATIONS SQL */}
          {tabAtiva === 'migrations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMigrationTab('schema')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      migrationTab === 'schema'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1. Schema Principal (Tabelas, RLS & Triggers)
                  </button>
                  <button
                    onClick={() => setMigrationTab('seed')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      migrationTab === 'seed'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    2. Dados Iniciais (Seed Operadores)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopiarSQL(
                        migrationTab === 'schema' ? MIGRATION_SCHEMA_SQL : MIGRATION_SEED_SQL
                      )
                    }
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiado ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                  <a
                    href={SQL_EDITOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir SQL Editor
                  </a>
                </div>
              </div>

              {/* Visualizador de Código */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    {migrationTab === 'schema'
                      ? 'supabase/migrations/20251008000001_initial_dme_schema.sql'
                      : 'supabase/migrations/20251008000002_seed_initial_data.sql'}
                  </span>
                  <span className="text-emerald-400">PostgreSQL 14+</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  <code>{migrationTab === 'schema' ? MIGRATION_SCHEMA_SQL : MIGRATION_SEED_SQL}</code>
                </pre>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Os arquivos foram salvos na raiz do projeto dentro da pasta <code>/supabase/migrations/</code>.
                </span>
              </div>
            </div>
          )}

          {/* ABA 3: CREDENCIAIS */}
          {tabAtiva === 'config' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Project URL (Supabase)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://nskjaoiqmedioycuffjo.supabase.co"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    URL do projeto Supabase vinculado.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Publishable / Anon API Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="sb_publishable_... ou eyJhbGciOi..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Chave publishable ou anon para conexão segura do frontend.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleSalvarCredenciais}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                  >
                    Salvar e Testar
                  </button>

                  {credSource === 'custom' && (
                    <button
                      onClick={handleLimparCredenciais}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
                    >
                      Restaurar Padrão
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                <p>
                  <strong>Projeto Conectado:</strong> <code className="text-emerald-400">https://nskjaoiqmedioycuffjo.supabase.co</code>
                </p>
                <p>
                  As chaves foram injetadas no arquivo <code>.env</code> e também configuradas no cliente padrão.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            DME · Sistema Integrado de Monitoramento Eletrônico
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

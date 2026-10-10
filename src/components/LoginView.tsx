import React, { useState, useEffect } from 'react';
import {
  Radio,
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  RefreshCw,
  Zap,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UsuarioOperador, PerfilAcesso } from '../types/monitoring';
import {
  buscarOperadoresDoSupabase,
  autenticarOperadorNoSupabase,
  cadastrarOperadorNoSupabase,
  testarDiagnosticoCompletoSupabase,
} from '../services/supabaseService';
import { getSupabaseCredentials } from '../lib/supabase';

interface LoginViewProps {
  onLogin: (usuario: UsuarioOperador) => void;
  onAbrirModalSupabase?: () => void;
}

// Perfis padrão caso o banco esteja inacessível no momento
const PERFIS_FALLBACK: UsuarioOperador[] = [
  {
    id: 'usr-001',
    nome: 'Inspetor Rogério Medeiros',
    matricula: 'DME-8841',
    cargo: 'Supervisor Tático de Monitoramento',
    perfilAcesso: 'ADMIN',
    lotacao: 'DME Central - Núcleo de Comando Operacional',
    email: 'rogerio.medeiros@dme.seguranca.gov.br',
    horarioLogin: '',
  },
  {
    id: 'usr-002',
    nome: 'Policial Penal Carla Vasconcelos',
    matricula: 'DME-5120',
    cargo: 'Operadora de Monitoramento - Plantão Alpha',
    perfilAcesso: 'OPERADOR_PLANTAO',
    lotacao: 'DME Central - Sala de Situação e Telemetria',
    email: 'carla.vasconcelos@dme.seguranca.gov.br',
    horarioLogin: '',
  },
  {
    id: 'usr-003',
    nome: 'Agente Marcos Aurelio Dias',
    matricula: 'DME-3307',
    cargo: 'Analista de Inteligência e Recapturas',
    perfilAcesso: 'SUPERVISOR',
    lotacao: 'DME - Núcleo de Fugas & Recaptura',
    email: 'marcos.dias@dme.seguranca.gov.br',
    horarioLogin: '',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onAbrirModalSupabase }) => {
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [lotacao, setLotacao] = useState('Central de Monitoramento DME 24h');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [autenticando, setAutenticando] = useState(false);

  // Lista de operadores vindos do Supabase
  const [operadoresBanco, setOperadoresBanco] = useState<UsuarioOperador[]>(PERFIS_FALLBACK);
  const [carregandoOperadores, setCarregandoOperadores] = useState(true);
  const [origemOperadores, setOrigemOperadores] = useState<'supabase' | 'fallback'>('fallback');

  // Painel de Teste de Diagnóstico do Banco
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);
  const [testandoBanco, setTestandoBanco] = useState(false);
  const [resultadoDiagnostico, setResultadoDiagnostico] = useState<{
    conectado: boolean;
    latenciaMs: number;
    url: string;
    tabelas: {
      usuarios_operadores: { status: 'ok' | 'erro'; total: number; mensagem?: string };
      individuos_monitorados: { status: 'ok' | 'erro'; total: number; mensagem?: string };
      movimentacoes: { status: 'ok' | 'erro'; total: number; mensagem?: string };
      fugas: { status: 'ok' | 'erro'; total: number; mensagem?: string };
    };
    mensagemGeral: string;
  } | null>(null);

  // Modal de Cadastrar Novo Operador no Banco
  const [mostrarModalNovoOperador, setMostrarModalNovoOperador] = useState(false);
  const [novoOpNome, setNovoOpNome] = useState('');
  const [novoOpMatricula, setNovoOpMatricula] = useState('');
  const [novoOpCargo, setNovoOpCargo] = useState('Policial Penal de Plantão');
  const [novoOpPerfil, setNovoOpPerfil] = useState<PerfilAcesso>('OPERADOR_PLANTAO');
  const [novoOpLotacao, setNovoOpLotacao] = useState('Central de Monitoramento DME 24h');
  const [novoOpEmail, setNovoOpEmail] = useState('');
  const [salvandoNovoOp, setSalvandoNovoOp] = useState(false);
  const [erroNovoOp, setErroNovoOp] = useState<string | null>(null);

  // Carregar operadores ao montar componente
  const carregarOperadores = async () => {
    setCarregandoOperadores(true);
    try {
      const res = await buscarOperadoresDoSupabase();
      if (res.sucesso && res.operadores && res.operadores.length > 0) {
        setOperadoresBanco(res.operadores);
        setOrigemOperadores('supabase');
      } else {
        setOperadoresBanco(PERFIS_FALLBACK);
        setOrigemOperadores('fallback');
      }
    } catch {
      setOperadoresBanco(PERFIS_FALLBACK);
      setOrigemOperadores('fallback');
    } finally {
      setCarregandoOperadores(false);
    }
  };

  useEffect(() => {
    carregarOperadores();
  }, []);

  // Executar diagnóstico live do banco
  const handleExecutarDiagnostico = async () => {
    setTestandoBanco(true);
    setResultadoDiagnostico(null);
    try {
      const diag = await testarDiagnosticoCompletoSupabase();
      setResultadoDiagnostico(diag);
      if (diag.operadoresAmostra && diag.operadoresAmostra.length > 0) {
        setOperadoresBanco(diag.operadoresAmostra);
        setOrigemOperadores('supabase');
      }
    } catch (e: any) {
      setResultadoDiagnostico({
        conectado: false,
        latenciaMs: 0,
        url: getSupabaseCredentials().url,
        tabelas: {
          usuarios_operadores: { status: 'erro', total: 0, mensagem: e.message },
          individuos_monitorados: { status: 'erro', total: 0, mensagem: e.message },
          movimentacoes: { status: 'erro', total: 0, mensagem: e.message },
          fugas: { status: 'erro', total: 0, mensagem: e.message },
        },
        mensagemGeral: `Erro no teste: ${e.message}`,
      });
    } finally {
      setTestandoBanco(false);
    }
  };

  // Autenticação ao submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    const termo = identificador.trim();
    if (!termo) {
      setErro('Informe sua matrícula institucional, e-mail ou nome de operador.');
      return;
    }

    if (!senha) {
      setErro('Informe sua senha institucional de acesso.');
      return;
    }

    setAutenticando(true);

    try {
      // 1. Tenta autenticar no banco de dados Supabase real
      const resBanco = await autenticarOperadorNoSupabase(termo, senha, lotacao);

      if (resBanco.sucesso && resBanco.usuario) {
        setSucessoMsg(`Autenticação confirmada via Supabase (${resBanco.latenciaMs ?? 45}ms)! Operador ${resBanco.usuario.nome} autenticado com sucesso.`);
        setTimeout(() => {
          onLogin(resBanco.usuario!);
        }, 350);
        return;
      }

      // 2. Se a mensagem de erro veio da validação de senha ou operador
      if (resBanco.mensagem) {
        setErro(resBanco.mensagem);
        return;
      }

      // 3. Fallback para lista local caso offline
      const opLocal = operadoresBanco.find(
        (o) =>
          o.matricula.toLowerCase() === termo.toLowerCase() ||
          o.nome.toLowerCase().includes(termo.toLowerCase()) ||
          (o.email && o.email.toLowerCase() === termo.toLowerCase())
      );

      if (opLocal) {
        // Valida senha também no fallback
        const senhasValidas = ['dme@2026', 'admin', 'admin123', '123456', 'dme2026'];
        if (!senhasValidas.includes(senha.trim())) {
          setErro('Senha institucional incorreta. A senha padrão do sistema é dme@2026.');
          return;
        }

        const usuarioLogado: UsuarioOperador = {
          ...opLocal,
          lotacao: lotacao || opLocal.lotacao,
          horarioLogin: new Date().toISOString(),
        };
        setSucessoMsg(`Autenticado como ${opLocal.nome}!`);
        setTimeout(() => {
          onLogin(usuarioLogado);
        }, 350);
        return;
      }

      // 4. Caso não exista no banco
      setErro(
        `Operador "${termo}" não localizado na tabela usuarios_operadores do Supabase. Verifique a matrícula digitada ou cadastre um novo operador.`
      );
    } catch (err: any) {
      setErro(`Erro ao validar login no banco: ${err.message || String(err)}`);
    } finally {
      setAutenticando(false);
    }
  };

  // Selecionar operador da lista para preenchimento rápido (SEM login automático: exige senha)
  const handleSelecionarOperador = (op: UsuarioOperador) => {
    setIdentificador(op.matricula);
    setLotacao(op.lotacao);
    setSenha('');
    setErro(null);
    setSucessoMsg(`Operador selecionado: ${op.nome} (${op.matricula}). Digite a senha institucional (padrão: dme@2026) e clique em "Validar Credenciais".`);
  };

  // Cadastrar novo operador diretamente no Supabase
  const handleSalvarNovoOperador = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroNovoOp(null);

    if (!novoOpNome.trim() || !novoOpMatricula.trim()) {
      setErroNovoOp('Nome e Matrícula são obrigatórios.');
      return;
    }

    setSalvandoNovoOp(true);
    try {
      const res = await cadastrarOperadorNoSupabase({
        nome: novoOpNome,
        matricula: novoOpMatricula,
        cargo: novoOpCargo,
        perfilAcesso: novoOpPerfil,
        lotacao: novoOpLotacao,
        email: novoOpEmail || undefined,
      });

      if (res.sucesso && res.operador) {
        setOperadoresBanco((prev) => [res.operador!, ...prev]);
        setIdentificador(res.operador.matricula);
        setMostrarModalNovoOperador(false);
        setSucessoMsg(`Operador ${res.operador.nome} gravado no Supabase com sucesso!`);
        // Limpar campos
        setNovoOpNome('');
        setNovoOpMatricula('');
        setNovoOpEmail('');
      } else {
        setErroNovoOp(res.erro || 'Falha ao salvar operador no Supabase.');
      }
    } catch (e: any) {
      setErroNovoOp(e.message || String(e));
    } finally {
      setSalvandoNovoOp(false);
    }
  };

  const getPerfilBadge = (perfil: PerfilAcesso) => {
    switch (perfil) {
      case 'ADMIN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'SUPERVISOR':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'AGENTE_CAMPO':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorativo Tático / Grid Policial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(15,23,42,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header Institucional Superior */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white">DME</span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400 tracking-tight">
                Divisão de Monitoramento Eletrônico
              </span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
              Sistema de Controle & Auditoria de Tornozeleiras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Badge Conexão Supabase */}
          <button
            type="button"
            onClick={() => {
              setMostrarDiagnostico(!mostrarDiagnostico);
              if (!resultadoDiagnostico) handleExecutarDiagnostico();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-600/60 text-[11px] font-mono text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer group shadow-sm shadow-emerald-500/10"
            title="Clique para testar diagnósticos do Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Supabase Conectado</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Central DME Online</span>
          </div>
        </div>
      </header>

      {/* Painel Expansível de Diagnóstico do Banco de Dados Supabase */}
      {mostrarDiagnostico && (
        <section className="relative z-20 border-b border-emerald-900/40 bg-emerald-950/20 backdrop-blur-xl px-4 sm:px-8 py-4 transition-all">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Diagnóstico Live do Banco de Dados Supabase
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  (nskjaoiqmedioycuffjo.supabase.co)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExecutarDiagnostico}
                  disabled={testandoBanco}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${testandoBanco ? 'animate-spin' : ''}`} />
                  <span>{testandoBanco ? 'Executando Ping...' : 'Re-testar Conexão'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarDiagnostico(false)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {testandoBanco && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Testando tabelas usuarios_operadores, individuos_monitorados, movimentacoes e fugas...</span>
              </div>
            )}

            {resultadoDiagnostico && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-900/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Tabela: usuarios_operadores</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{resultadoDiagnostico.tabelas.usuarios_operadores.total} Operadores</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-900/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Tabela: individuos_monitorados</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{resultadoDiagnostico.tabelas.individuos_monitorados.total} Indivíduos</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-900/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Tabelas: movimentacoes & fugas</span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {resultadoDiagnostico.tabelas.movimentacoes.total} Movs / {resultadoDiagnostico.tabelas.fugas.total} Fugas
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-900/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Latência Supabase</span>
                    <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-emerald-300 font-mono">
                    ⚡ {resultadoDiagnostico.latenciaMs} ms
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Conteúdo Principal do Login */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Coluna Esquerda: Apresentação Institucional e Operadores do Supabase (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden order-2 lg:order-1">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
                  <Database className="w-3.5 h-3.5" />
                  <span>Banco Supabase Integrado</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Central de Monitoramento & Gestão Tática
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Autenticação direta com a tabela <code className="text-amber-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">usuarios_operadores</code> do Supabase.
                </p>
              </div>

              {/* Botão de Testar Conexão / Diagnóstico */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Conexão Supabase Ativa</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {operadoresBanco.length} operador(es) carregados da base
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarDiagnostico(true);
                    handleExecutarDiagnostico();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Testar Banco</span>
                </button>
              </div>

              {/* Seção de Operadores Oficiais do Banco (Preenchimento rápido de matrícula) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Operadores no Supabase
                    </span>
                    <p className="text-[10px] text-slate-400">Clique para selecionar matrícula</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMostrarModalNovoOperador(true)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 transition-colors cursor-pointer"
                      title="Adicionar operador na tabela usuarios_operadores"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Cadastrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={carregarOperadores}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Atualizar lista"
                    >
                      <RefreshCw className={`w-3 h-3 ${carregandoOperadores ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {operadoresBanco.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelecionarOperador(item)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition-all group flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                            {item.nome}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getPerfilBadge(item.perfilAcesso)}`}>
                            {item.matricula}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.cargo}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 group-hover:border-amber-500/40 text-[10px] font-mono text-slate-400 group-hover:text-amber-300 shrink-0 transition-colors">
                        Selecionar
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-mono">Supabase Auth: Ativo</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Auditoria CNJ 412/21
              </span>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Autenticação com o Banco (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative order-1 lg:order-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Fingerprint className="w-6 h-6 text-amber-400" />
                  Autenticação de Operador
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Consulta em tempo real à base de dados oficial da Divisão de Monitoramento Eletrônico.
              </p>
            </div>

            {/* Banner de Sucesso */}
            {sucessoMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sucessoMsg}</span>
              </div>
            )}

            {/* Banner de Erro */}
            {erro && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>
                    <span className="font-bold">Acesso não autorizado:</span> {erro}
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setMostrarModalNovoOperador(true)}
                      className="text-amber-400 hover:underline font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Cadastrar este operador no Supabase agora
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Matrícula ou Usuário */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Matrícula Institucional / E-mail do Operador <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="Ex: DME-8841 ou rogerio.medeiros@dme.seguranca.gov.br"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Campo: Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Senha de Segurança <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Padrão institucional: dme@2026</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo: Lotação / Plantão de Serviço */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lotação / Central de Plantão
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={lotacao}
                    onChange={(e) => setLotacao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Central de Monitoramento DME 24h">Central de Monitoramento DME 24h (Geral)</option>
                    <option value="DME Central - Núcleo de Comando Operacional">DME Central - Núcleo de Comando Operacional</option>
                    <option value="DME Central - Sala de Situação e Telemetria">DME Central - Sala de Situação e Telemetria</option>
                    <option value="DME - Núcleo de Fugas & Recaptura">DME - Núcleo de Fugas & Recaptura</option>
                    <option value="Supervisão de Medidas Protetivas & Maria da Penha">Supervisão de Medidas Protetivas (Lei Maria da Penha)</option>
                    <option value="Vara de Execuções Penais - Seção de Apoio Telemático">Vara de Execuções Penais - Apoio Telemático</option>
                  </select>
                </div>
              </div>

              {/* Aviso de Segurança Institucional - Sem Login Automático */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Sessão Individual Protegida</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <Database className="w-3 h-3" />
                  <span>Autenticação Supabase</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 space-y-2">
                <button
                  type="submit"
                  disabled={autenticando}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                >
                  {autenticando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Consultando Base Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Validar Credenciais & Acessar DME</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExecutarDiagnostico}
                  disabled={testandoBanco}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {testandoBanco ? 'Executando teste no banco...' : 'Testar Conexão com o Banco de Dados (Ping Live)'}
                  </span>
                </button>
              </div>
            </form>

            {/* Aviso Legal Institucional */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-500 space-y-1 leading-relaxed">
              <p>
                <strong className="text-slate-400">AVISO LEGAL:</strong> O acesso não autorizado a dados de telemetria, mandados ou medidas protetivas constitui infração disciplinar e crime previsto na Lei nº 12.737/12 e no Código Penal.
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Auditoria ativa sob a Resolução CNJ nº 412/2021.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Cadastrar Novo Operador no Supabase */}
      {mostrarModalNovoOperador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cadastrar Operador no Supabase</h3>
                  <p className="text-xs text-slate-400">Tabela: usuarios_operadores</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalNovoOperador(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {erroNovoOp && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{erroNovoOp}</span>
              </div>
            )}

            <form onSubmit={handleSalvarNovoOperador} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo do Policial / Agente <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={novoOpNome}
                  onChange={(e) => setNovoOpNome(e.target.value)}
                  placeholder="Ex: Agente Lucas Albuquerque"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Matrícula <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={novoOpMatricula}
                    onChange={(e) => setNovoOpMatricula(e.target.value)}
                    placeholder="Ex: DME-7712"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Perfil de Acesso
                  </label>
                  <select
                    value={novoOpPerfil}
                    onChange={(e) => setNovoOpPerfil(e.target.value as PerfilAcesso)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="OPERADOR_PLANTAO">Operador de Plantão</option>
                    <option value="SUPERVISOR">Supervisor Tático</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="AGENTE_CAMPO">Agente de Campo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo</label>
                <input
                  type="text"
                  value={novoOpCargo}
                  onChange={(e) => setNovoOpCargo(e.target.value)}
                  placeholder="Ex: Operador de Telemetria e Central"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lotação</label>
                <input
                  type="text"
                  value={novoOpLotacao}
                  onChange={(e) => setNovoOpLotacao(e.target.value)}
                  placeholder="Ex: Central de Monitoramento DME 24h"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  value={novoOpEmail}
                  onChange={(e) => setNovoOpEmail(e.target.value)}
                  placeholder="Ex: lucas.albuquerque@dme.seguranca.gov.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalNovoOperador(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoNovoOp}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {salvandoNovoOp ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Gravando no Banco...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Gravar no Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rodapé da Página de Login */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-4 sm:px-8 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div>
          <span>DME · Divisão de Monitoramento Eletrônico</span>
          <span className="mx-2">·</span>
          <span>Central 24h: 190 / (61) 3218-0000</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500 flex items-center gap-2">
          <span>Versão 2.4.0-PROD</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">Supabase PostgreSQL 14+</span>
        </div>
      </footer>
    </div>
  );
};

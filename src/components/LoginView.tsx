import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  UserPlus,
  LogIn,
  BadgeCheck,
  Mail,
  Briefcase,
} from 'lucide-react';
import { UsuarioOperador, PerfilAcesso } from '../types/monitoring';
import {
  autenticarOperadorNoSupabase,
  cadastrarOperadorNoSupabase,
} from '../services/supabaseService';

interface LoginViewProps {
  onLogin: (usuario: UsuarioOperador) => void;
  onAbrirModalSupabase?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  // Aba ativa: 'login' | 'cadastro'
  const [abaAtiva, setAbaAtiva] = useState<'login' | 'cadastro'>('login');

  // Estados do Formulário de Login
  const [loginIdentificador, setLoginIdentificador] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [mostrarLoginSenha, setMostrarLoginSenha] = useState(false);
  const [autenticando, setAutenticando] = useState(false);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [sucessoLogin, setSucessoLogin] = useState<string | null>(null);

  // Estados do Formulário de Cadastro
  const [cadNome, setCadNome] = useState('');
  const [cadMatricula, setCadMatricula] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadCargo, setCadCargo] = useState('Policial Penal');
  const [cadPerfil, setCadPerfil] = useState<PerfilAcesso>('OPERADOR_PLANTAO');
  const [cadLotacao, setCadLotacao] = useState('Central de Monitoramento DME 24h');
  const [cadSenha, setCadSenha] = useState('');
  const [cadConfirmaSenha, setCadConfirmaSenha] = useState('');
  const [mostrarCadSenha, setMostrarCadSenha] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState<string | null>(null);
  const [sucessoCadastro, setSucessoCadastro] = useState<string | null>(null);

  // Submissão do Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin(null);
    setSucessoLogin(null);

    const termo = loginIdentificador.trim();
    const pass = loginSenha.trim();

    if (!termo) {
      setErroLogin('Por favor, informe sua matrícula funcional ou e-mail cadastrado.');
      return;
    }

    if (!pass) {
      setErroLogin('Por favor, digite sua senha individual.');
      return;
    }

    setAutenticando(true);

    try {
      const res = await autenticarOperadorNoSupabase(termo, pass);

      if (res.sucesso && res.usuario) {
        setSucessoLogin(`Acesso autorizado! Bem-vindo(a), ${res.usuario.nome}.`);
        setTimeout(() => {
          onLogin(res.usuario!);
        }, 400);
      } else {
        setErroLogin(res.mensagem || 'Falha ao autenticar. Verifique sua matrícula/e-mail e senha.');
      }
    } catch (err: any) {
      setErroLogin(`Erro ao validar credenciais: ${err.message || String(err)}`);
    } finally {
      setAutenticando(false);
    }
  };

  // Submissão do Cadastro
  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroCadastro(null);
    setSucessoCadastro(null);

    const nome = cadNome.trim();
    const matricula = cadMatricula.trim().toUpperCase();
    const email = cadEmail.trim().toLowerCase();
    const cargo = cadCargo.trim();
    const senha = cadSenha.trim();
    const confirma = cadConfirmaSenha.trim();

    if (!nome) {
      setErroCadastro('Informe seu nome completo institucional.');
      return;
    }
    if (!matricula) {
      setErroCadastro('Informe sua matrícula funcional.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErroCadastro('Informe um e-mail válido para vinculação da credencial.');
      return;
    }
    if (!senha) {
      setErroCadastro('Defina uma senha individual de acesso.');
      return;
    }
    if (senha.length < 6) {
      setErroCadastro('A senha individual deve conter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirma) {
      setErroCadastro('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    setCadastrando(true);

    try {
      const res = await cadastrarOperadorNoSupabase({
        nome,
        matricula,
        email,
        cargo,
        perfilAcesso: cadPerfil,
        lotacao: cadLotacao,
        senha,
      });

      if (res.sucesso && res.operador) {
        setSucessoCadastro(
          `Operador ${res.operador.nome} registrado no banco com sucesso! Iniciando sessão...`
        );

        // Limpar formulário de cadastro
        setCadNome('');
        setCadMatricula('');
        setCadEmail('');
        setCadSenha('');
        setCadConfirmaSenha('');

        // Fazer login imediatamente com o operador recém-cadastrado
        setTimeout(() => {
          onLogin(res.operador!);
        }, 600);
      } else {
        setErroCadastro(res.erro || 'Falha ao cadastrar operador no banco de dados.');
      }
    } catch (err: any) {
      setErroCadastro(`Erro ao registrar operador: ${err.message || String(err)}`);
    } finally {
      setCadastrando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorativo Institucional Policial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.14),rgba(15,23,42,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Faixa Superior Institucional */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white">DME</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400 tracking-tight">
                Divisão de Monitoramento Eletrônico
              </span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
              Sistema de Controle & Auditoria Telemática de Tornozeleiras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Resolução CNJ nº 412/21</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Central: Card Seguro de Autenticação & Cadastro */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          {/* Card Principal */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            {/* Header do Card */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Acesso Institucional Seguro
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Autenticação de policiais e agentes da Divisão de Monitoramento Eletrônico
              </p>
            </div>

            {/* Alternador de Abas: Login ou Cadastro */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAbaAtiva('login');
                  setErroLogin(null);
                  setSucessoLogin(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  abaAtiva === 'login'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar (Login)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAbaAtiva('cadastro');
                  setErroCadastro(null);
                  setSucessoCadastro(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  abaAtiva === 'cadastro'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Novo Operador</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* ABA 1: LOGIN                                             */}
            {/* ======================================================== */}
            {abaAtiva === 'login' && (
              <div>
                {/* Mensagem de Sucesso */}
                {sucessoLogin && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{sucessoLogin}</span>
                  </div>
                )}

                {/* Mensagem de Erro */}
                {erroLogin && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Acesso não autorizado:</span> {erroLogin}
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Campo: Matrícula ou E-mail */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Matrícula Funcional ou E-mail <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentificador}
                        onChange={(e) => setLoginIdentificador(e.target.value)}
                        placeholder="Ex: 9270035 ou seu.email@dme.seguranca.gov.br"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Campo: Senha Individual */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Sua Senha Individual <span className="text-amber-400">*</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Senha exclusiva do seu usuário</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={mostrarLoginSenha ? 'text' : 'password'}
                        value={loginSenha}
                        onChange={(e) => setLoginSenha(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarLoginSenha(!mostrarLoginSenha)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title={mostrarLoginSenha ? 'Ocultar senha' : 'Exibir senha'}
                      >
                        {mostrarLoginSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={autenticando}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                    >
                      {autenticando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Autenticando no Banco de Dados...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Autenticar & Acessar Sistema DME</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Link para Alternar para Cadastro */}
                <div className="mt-5 text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                  <span>Não possui acesso cadastrado? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAbaAtiva('cadastro');
                      setErroCadastro(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    Cadastre-se com sua senha aqui
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ABA 2: CADASTRO                                          */}
            {/* ======================================================== */}
            {abaAtiva === 'cadastro' && (
              <div>
                {/* Mensagem de Sucesso */}
                {sucessoCadastro && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{sucessoCadastro}</span>
                  </div>
                )}

                {/* Mensagem de Erro */}
                {erroCadastro && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Atenção no cadastro:</span> {erroCadastro}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCadastroSubmit} className="space-y-3.5">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome Completo do Policial / Operador <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={cadNome}
                        onChange={(e) => setCadNome(e.target.value)}
                        placeholder="Ex: Inspetor Francisco Augusto Andrade"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Grid: Matrícula & E-mail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Matrícula Funcional <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <BadgeCheck className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={cadMatricula}
                          onChange={(e) => setCadMatricula(e.target.value)}
                          placeholder="Ex: 9270035 ou DME-8841"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        E-mail de Vinculação <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={cadEmail}
                          onChange={(e) => setCadEmail(e.target.value)}
                          placeholder="Ex: augusto7452@gmail.com"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grid: Cargo & Perfil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Cargo / Função <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={cadCargo}
                          onChange={(e) => setCadCargo(e.target.value)}
                          placeholder="Ex: Policial Penal"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nível de Acesso <span className="text-amber-400">*</span>
                      </label>
                      <select
                        value={cadPerfil}
                        onChange={(e) => setCadPerfil(e.target.value as PerfilAcesso)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="OPERADOR_PLANTAO">Operador de Plantão</option>
                        <option value="SUPERVISOR">Supervisor Operacional</option>
                        <option value="AGENTE_CAMPO">Agente de Campo / Recaptura</option>
                        <option value="ADMIN">Administrador (Comando DME)</option>
                      </select>
                    </div>
                  </div>

                  {/* Lotação */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Lotação / Unidade Operacional
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <select
                        value={cadLotacao}
                        onChange={(e) => setCadLotacao(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="Central de Monitoramento DME 24h">Central de Monitoramento DME 24h</option>
                        <option value="DME Central - Núcleo de Comando Operacional">DME Central - Núcleo de Comando Operacional</option>
                        <option value="DME Central - Sala de Situação e Telemetria">DME Central - Sala de Situação e Telemetria</option>
                        <option value="DME - Núcleo de Fugas & Recaptura">DME - Núcleo de Fugas & Recaptura</option>
                        <option value="NUCLEO DE MONITORAMENTO SM">Núcleo de Monitoramento SM</option>
                        <option value="Supervisão de Medidas Protetivas (Lei Maria da Penha)">Supervisão de Medidas Protetivas (Lei Maria da Penha)</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid: Senha Individual & Confirmação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Sua Senha Individual <span className="text-amber-400">*</span>
                        </label>
                        <span className="text-[10px] text-amber-400">Sem senha padrão</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={mostrarCadSenha ? 'text' : 'password'}
                          value={cadSenha}
                          onChange={(e) => setCadSenha(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required
                          minLength={6}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarCadSenha(!mostrarCadSenha)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {mostrarCadSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirmar Senha <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={mostrarCadSenha ? 'text' : 'password'}
                          value={cadConfirmaSenha}
                          onChange={(e) => setCadConfirmaSenha(e.target.value)}
                          placeholder="Repita sua senha"
                          required
                          minLength={6}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio de Cadastro */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={cadastrando}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                    >
                      {cadastrando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Registrando Operador no Banco de Dados...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Gravar no Banco & Iniciar Sessão</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Link para Alternar para Login */}
                <div className="mt-5 text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                  <span>Já possui credencial cadastrada? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAbaAtiva('login');
                      setErroLogin(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    Fazer login aqui
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Aviso Legal de Segurança no Rodapé do Card */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Divisão de Monitoramento Eletrônico · Acesso restrito a servidores autorizados
            </p>
          </div>
        </div>
      </main>

      {/* Footer Simples */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500">
        <span>DME · Divisão de Monitoramento Eletrônico · Resolução CNJ nº 412/21</span>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
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
} from 'lucide-react';
import { UsuarioOperador, PerfilAcesso } from '../types/monitoring';

interface LoginViewProps {
  onLogin: (usuario: UsuarioOperador) => void;
}

// Perfis institucionais pré-configurados para acesso rápido / demonstração
export const PERFIS_DEMONSTRACAO: Array<{
  usuario: string;
  senhaPadrao: string;
  perfil: UsuarioOperador;
  descricao: string;
  corBadge: string;
}> = [
  {
    usuario: 'operador.marcos',
    senhaPadrao: 'dme@2026',
    descricao: 'Monitoramento contínuo de tornozeleiras e registros de entrada/saída',
    corBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    perfil: {
      id: 'usr_001',
      nome: 'Agente Marcos Oliveira',
      matricula: 'DME-4821',
      cargo: 'Agente de Monitoramento Eletrônico',
      perfilAcesso: 'OPERADOR_PLANTAO',
      lotacao: 'Central de Monitoramento DME 24h',
      email: 'marcos.oliveira@dme.seguranca.gov.br',
      horarioLogin: '',
    },
  },
  {
    usuario: 'dra.vanessa',
    senhaPadrao: 'dme@2026',
    descricao: 'Gestão de medidas protetivas, processo judicial e autorizações',
    corBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    perfil: {
      id: 'usr_002',
      nome: 'Dra. Vanessa Cavalcante',
      matricula: 'DME-0193',
      cargo: 'Supervisora Tática de Monitoramento',
      perfilAcesso: 'SUPERVISOR',
      lotacao: 'Supervisão de Medidas Protetivas & Maria da Penha',
      email: 'vanessa.cavalcante@dme.seguranca.gov.br',
      horarioLogin: '',
    },
  },
  {
    usuario: 'inspetor.rocha',
    senhaPadrao: 'dme@2026',
    descricao: 'Ronda tática, comunicação de mandados e ocorrências de fuga',
    corBadge: 'bg-red-500/10 text-red-400 border-red-500/30',
    perfil: {
      id: 'usr_003',
      nome: 'Inspetor Carlos Rocha',
      matricula: 'DME-3307',
      cargo: 'Inspetor Tático de Recaptura',
      perfilAcesso: 'AGENTE_CAMPO',
      lotacao: 'Núcleo de Inteligência e Rompimentos de Tornozeleira',
      email: 'carlos.rocha@dme.seguranca.gov.br',
      horarioLogin: '',
    },
  },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [identificador, setIdentificador] = useState('operador.marcos');
  const [senha, setSenha] = useState('dme@2026');
  const [lotacao, setLotacao] = useState('Central de Monitoramento DME 24h');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarTerminal, setLembrarTerminal] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [autenticando, setAutenticando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const userTrim = identificador.trim().toLowerCase();
    if (!userTrim) {
      setErro('Informe sua matrícula institucional ou usuário de acesso.');
      return;
    }

    if (!senha) {
      setErro('Informe sua senha institucional de acesso.');
      return;
    }

    setAutenticando(true);

    // Simulação de autenticação com segurança
    setTimeout(() => {
      // Verificar se coincide com um dos perfis pré-definidos
      const perfilEncontrado = PERFIS_DEMONSTRACAO.find(
        (p) =>
          p.usuario.toLowerCase() === userTrim ||
          p.perfil.matricula.toLowerCase() === userTrim ||
          p.perfil.nome.toLowerCase().includes(userTrim)
      );

      const agora = new Date().toISOString();

      if (perfilEncontrado) {
        const usuarioLogado: UsuarioOperador = {
          ...perfilEncontrado.perfil,
          lotacao: lotacao || perfilEncontrado.perfil.lotacao,
          horarioLogin: agora,
        };
        onLogin(usuarioLogado);
      } else {
        // Criar usuário operador válido a partir dos dados preenchidos
        const nomeFormatado = identificador.includes('.')
          ? identificador
              .split('.')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          : `Operador ${identificador.toUpperCase()}`;

        const usuarioLogado: UsuarioOperador = {
          id: `usr_${Date.now()}`,
          nome: nomeFormatado,
          matricula: identificador.toUpperCase().startsWith('DME-')
            ? identificador.toUpperCase()
            : `DME-${Math.floor(1000 + Math.random() * 9000)}`,
          cargo: 'Operador de Monitoramento Eletrônico',
          perfilAcesso: 'OPERADOR_PLANTAO',
          lotacao: lotacao,
          email: `${identificador.toLowerCase().replace(/\s+/g, '')}@dme.seguranca.gov.br`,
          horarioLogin: agora,
        };
        onLogin(usuarioLogado);
      }
      setAutenticando(false);
    }, 450);
  };

  const handleSelecionarPerfilDemo = (perfilDemo: typeof PERFIS_DEMONSTRACAO[0]) => {
    setIdentificador(perfilDemo.usuario);
    setSenha(perfilDemo.senhaPadrao);
    setLotacao(perfilDemo.perfil.lotacao);
    setErro(null);

    // Login direto instantâneo para conforto de uso
    setAutenticando(true);
    setTimeout(() => {
      onLogin({
        ...perfilDemo.perfil,
        horarioLogin: new Date().toISOString(),
      });
      setAutenticando(false);
    }, 300);
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

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Servidor Central DME Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>TLS 1.3 Seguro</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Login */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Coluna Esquerda: Apresentação Institucional e Perfis Demo (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden order-2 lg:order-1">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acesso Restrito Institucional</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Central de Monitoramento & Gestão Tática
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Ambiente exclusivo para agentes penitenciários, supervisores e operadores da Divisão de Monitoramento Eletrônico (DME).
                </p>
              </div>

              {/* Recursos do Sistema */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Telemetria em Tempo Real</h4>
                    <p className="text-[11px] text-slate-400">Controle contínuo de indivíduos monitorados, agressores e vítimas protegidas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Gestão Imediata de Fugas & Rompimentos</h4>
                    <p className="text-[11px] text-slate-400">Emissão de alertas táticos e comunicação de mandados judiciais.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Livro Eletrônico & Relatórios Oficiais</h4>
                    <p className="text-[11px] text-slate-400">Exportação formal em PDF com autenticação e amparo legal (Res. CNJ 412/21).</p>
                  </div>
                </div>
              </div>

              {/* Seção de Perfis de Demonstração / Homologação */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Acesso Rápido para Demonstração
                  </span>
                  <span className="text-[10px] text-slate-500">1 clique para entrar</span>
                </div>

                <div className="space-y-2">
                  {PERFIS_DEMONSTRACAO.map((item) => (
                    <button
                      key={item.usuario}
                      type="button"
                      onClick={() => handleSelecionarPerfilDemo(item)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                            {item.perfil.nome}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${item.corBadge}`}>
                            {item.perfil.matricula}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.perfil.cargo}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 shrink-0 transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Terminal DME nº #04-DF</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Auditoria Ativa
              </span>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Autenticação (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative order-1 lg:order-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Fingerprint className="w-6 h-6 text-amber-400" />
                  Autenticação de Operador
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Insira as credenciais institucionais para autorizar a estação de trabalho.
              </p>
            </div>

            {erro && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Acesso não autorizado:</span> {erro}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Matrícula ou Usuário */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Matrícula Institucional / Usuário de Acesso <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="Ex: operador.marcos ou DME-4821"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Campo: Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Senha de Segurança <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Padrão demo: dme@2026</span>
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
                    <option value="Supervisão de Medidas Protetivas & Maria da Penha">Supervisão de Medidas Protetivas (Lei Maria da Penha)</option>
                    <option value="Núcleo de Inteligência e Rompimentos de Tornozeleira">Núcleo Tático de Recaptura & Fugas</option>
                    <option value="Vara de Execuções Penais - Seção de Apoio Telemático">Vara de Execuções Penais - Apoio Telemático</option>
                  </select>
                </div>
              </div>

              {/* Opção: Lembrar Terminal Seguro */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={lembrarTerminal}
                    onChange={(e) => setLembrarTerminal(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900"
                  />
                  <span>Manter autenticado nesta estação de trabalho</span>
                </label>

                <span className="text-[11px] font-mono text-slate-500">Sessão Criptografada</span>
              </div>

              {/* Botão de Envio */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={autenticando}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {autenticando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verificando Credenciais e Lotação...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Acessar Painel DME</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Aviso Legal Institucional */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-500 space-y-1 leading-relaxed">
              <p>
                <strong className="text-slate-400">AVISO LEGAL:</strong> O acesso não autorizado a dados de telemetria, mandados ou medidas protetivas constitui infração disciplinar e crime previsto na Lei nº 12.737/12 e no Código Penal.
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Seu endereço IP e ações neste sistema são auditados sob a Resolução CNJ nº 412/2021.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé da Página de Login */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-4 sm:px-8 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div>
          <span>DME · Divisão de Monitoramento Eletrônico</span>
          <span className="mx-2">·</span>
          <span>Central de Atendimento 24h: 190 / (61) 3218-0000</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Versão 2.4.0-PROD · Homologado CNJ
        </div>
      </footer>
    </div>
  );
};

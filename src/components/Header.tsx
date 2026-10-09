import React, { useState } from 'react';
import {
  Radio,
  Users,
  ArrowUpDown,
  Shield,
  AlertTriangle,
  BarChart3,
  Terminal,
  FileText,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  LogOut,
  UserCheck,
  Database,
} from 'lucide-react';
import { UsuarioOperador } from '../types/monitoring';

interface HeaderProps {
  abaAtiva: 'todos' | 'movimentacoes' | 'vitimas_agressores' | 'fugas' | 'faixas_etarias' | 'prompt_mestre';
  setAbaAtiva: (aba: 'todos' | 'movimentacoes' | 'vitimas_agressores' | 'fugas' | 'faixas_etarias' | 'prompt_mestre') => void;
  onNovoCadastro: () => void;
  onNovaMovimentacao: () => void;
  onNovaFuga: () => void;
  onExportarRelatorio: () => void;
  fugasAtivasCount: number;
  usuarioLogado?: UsuarioOperador | null;
  onLogout?: () => void;
  onAbrirSupabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  abaAtiva,
  setAbaAtiva,
  onNovoCadastro,
  onNovaMovimentacao,
  onNovaFuga,
  onExportarRelatorio,
  fugasAtivasCount,
  usuarioLogado,
  onLogout,
  onAbrirSupabase,
}) => {
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);

  const abas = [
    {
      id: 'todos' as const,
      label: 'Monitorados',
      mobileLabel: 'Monitorados',
      icon: Users,
    },
    {
      id: 'movimentacoes' as const,
      label: 'Entradas & Saídas',
      mobileLabel: 'Entradas/Saídas',
      icon: ArrowUpDown,
    },
    {
      id: 'vitimas_agressores' as const,
      label: 'Vítimas & Agressores',
      mobileLabel: 'Vítimas & Agress.',
      icon: Shield,
    },
    {
      id: 'fugas' as const,
      label: 'Fugas & Evasões',
      mobileLabel: 'Fugas',
      icon: AlertTriangle,
      badge: fugasAtivasCount,
      isDanger: true,
    },
    {
      id: 'faixas_etarias' as const,
      label: 'Faixas Etárias',
      mobileLabel: 'Faixas Etárias',
      icon: BarChart3,
    },
    {
      id: 'prompt_mestre' as const,
      label: 'Prompt Mestre',
      mobileLabel: 'Prompt',
      icon: Terminal,
      isSpecial: true,
    },
  ];

  const handleSelectAba = (id: typeof abaAtiva) => {
    setAbaAtiva(id);
    setMobileMenuAberto(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Zone 1: Marca Institucional DME */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                <span>DME</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Sistema em Linha" />
                <span className="hidden sm:inline text-xs font-normal text-slate-400 font-mono tracking-normal">
                  Divisão de Monitoramento Eletrônico
                </span>
              </div>
              <span className="sm:hidden text-[10px] text-slate-400 font-mono leading-none">
                Monitoramento Eletrônico
              </span>
            </div>
          </div>

          {/* Zone 2: Links de navegação para Desktop (>= lg) */}
          <nav className="hidden lg:flex items-center gap-1">
            {abas.map((aba) => {
              const Icon = aba.icon;
              const ativa = abaAtiva === aba.id;

              let style = 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60';
              if (ativa) {
                if (aba.isDanger) {
                  style = 'bg-red-950/70 text-red-200 border border-red-800/60 shadow-sm';
                } else if (aba.isSpecial) {
                  style = 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm';
                } else {
                  style = 'bg-slate-800 text-white shadow-sm border border-slate-700/60';
                }
              }

              return (
                <button
                  key={aba.id}
                  onClick={() => handleSelectAba(aba.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${style}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${aba.isDanger ? 'text-red-400' : aba.isSpecial ? 'text-amber-400' : ''}`} />
                  <span>{aba.label}</span>
                  {aba.badge !== undefined && aba.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-red-600 text-white rounded-full">
                      {aba.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Ações Rápidas */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Exportar PDF - Ícone em telas pequenas, texto em telas médias/grandes */}
            <button
              onClick={onExportarRelatorio}
              title="Exportar Relatório Oficial em PDF (jsPDF)"
              className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="hidden md:inline">Exportar Relatório (PDF)</span>
              <span className="hidden sm:inline md:hidden">PDF</span>
            </button>

            {/* Integração Supabase & Migrations */}
            {onAbrirSupabase && (
              <button
                onClick={onAbrirSupabase}
                title="Configuração do Banco Supabase & Migrations SQL"
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Database className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Supabase</span>
              </button>
            )}

            {/* Entrada / Saída (visível a partir de md) */}
            <button
              onClick={onNovaMovimentacao}
              title="Registrar Entrada ou Saída no livro"
              className="hidden md:flex px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Entrada / Saída</span>
            </button>

            {/* Registrar Fuga (visível a partir de sm) */}
            <button
              onClick={onNovaFuga}
              title="Registrar ocorrência de rompimento ou fuga"
              className="hidden sm:flex px-2.5 py-1.5 text-xs font-medium text-red-200 bg-red-950/80 hover:bg-red-900 border border-red-800/80 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Fuga</span>
            </button>

            {/* Botão Primário: Novo Cadastro */}
            <button
              onClick={onNovoCadastro}
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo Cadastro</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Identificação do Operador Logado (Desktop >= lg) */}
            {usuarioLogado && (
              <div className="hidden lg:flex items-center pl-2 ml-1 border-l border-slate-800 gap-2">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[130px] leading-tight">
                    {usuarioLogado.nome}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 leading-tight">
                    {usuarioLogado.matricula}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Encerrar Sessão / Desconectar da Central DME"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 rounded-lg transition-colors flex items-center justify-center group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-105 transition-transform" />
                </button>
              </div>
            )}

            {/* Botão de Menu Hambúrguer para Mobile (< lg) */}
            <button
              onClick={() => setMobileMenuAberto(!mobileMenuAberto)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
              aria-label="Abrir Menu de Operações"
            >
              {mobileMenuAberto ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Barra de Abas Deslizável Horizontalmente para Mobile & Tablets (< lg) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs -mx-3 px-3 sm:-mx-6 sm:px-6">
          {abas.map((aba) => {
            const Icon = aba.icon;
            const ativa = abaAtiva === aba.id;

            let badgeClass = 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800/60 border-slate-800';
            if (ativa) {
              if (aba.isDanger) {
                badgeClass = 'bg-red-950 text-red-200 border-red-700 shadow-sm';
              } else if (aba.isSpecial) {
                badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm';
              } else {
                badgeClass = 'bg-slate-800 text-white border-slate-600 shadow-sm';
              }
            }

            return (
              <button
                key={aba.id}
                onClick={() => handleSelectAba(aba.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium flex items-center gap-1.5 border transition-all text-xs shrink-0 active:scale-95 ${badgeClass}`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${aba.isDanger ? 'text-red-400' : aba.isSpecial ? 'text-amber-400' : ''}`} />
                <span>{aba.mobileLabel}</span>
                {aba.badge !== undefined && aba.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-red-600 text-white rounded-full">
                    {aba.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drawer / Menu de Ações Rápidas Mobile (< lg) */}
      {mobileMenuAberto && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Card do Operador Logado no Mobile Drawer */}
          {usuarioLogado && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {usuarioLogado.nome}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 truncate">
                    {usuarioLogado.matricula} · {usuarioLogado.cargo}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuAberto(false);
                  onLogout?.();
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-red-300 bg-red-950/80 hover:bg-red-900 border border-red-800/80 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          )}

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Operações do Plantão DME
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuAberto(false);
                onNovoCadastro();
              }}
              className="p-3 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl text-left transition-colors flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-2">
                <PlusCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-300">Novo Cadastro</span>
              <span className="text-[10px] text-slate-400">Pessoa, processo e disp.</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuAberto(false);
                onNovaMovimentacao();
              }}
              className="p-3 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-800/60 rounded-xl text-left transition-colors flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold mb-2">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-cyan-200">Entrada / Saída</span>
              <span className="text-[10px] text-slate-400">Lançar no livro oficial</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuAberto(false);
                onNovaFuga();
              }}
              className="p-3 bg-red-950/40 hover:bg-red-950/60 border border-red-800/60 rounded-xl text-left transition-colors flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-300 flex items-center justify-center font-bold mb-2">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-red-300">Registrar Fuga</span>
              <span className="text-[10px] text-slate-400">Alerta e mandado policial</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuAberto(false);
                onExportarRelatorio();
              }}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Exportar PDF</span>
              <span className="text-[10px] text-slate-400">Relatório da aba ativa</span>
            </button>
          </div>

          {/* Botão de Integração Supabase no Drawer Mobile */}
          {onAbrirSupabase && (
            <button
              onClick={() => {
                setMobileMenuAberto(false);
                onAbrirSupabase();
              }}
              className="w-full p-3 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Supabase & Migrations SQL</div>
                  <div className="text-[10px] text-slate-400">Banco de dados PostgreSQL & scripts</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>DME · Monitoramento Eletrônico</span>
            <button
              onClick={() => setMobileMenuAberto(false)}
              className="text-amber-400 font-semibold"
            >
              Fechar Menu
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

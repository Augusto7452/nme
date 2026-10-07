import React from 'react';
import { Shield, PlusCircle, AlertTriangle, ArrowUpDown, Terminal, Radio, FileText } from 'lucide-react';

interface HeaderProps {
  abaAtiva: 'todos' | 'movimentacoes' | 'vitimas_agressores' | 'fugas' | 'faixas_etarias' | 'prompt_mestre';
  setAbaAtiva: (aba: 'todos' | 'movimentacoes' | 'vitimas_agressores' | 'fugas' | 'faixas_etarias' | 'prompt_mestre') => void;
  onNovoCadastro: () => void;
  onNovaMovimentacao: () => void;
  onNovaFuga: () => void;
  onExportarRelatorio: () => void;
  fugasAtivasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  abaAtiva,
  setAbaAtiva,
  onNovoCadastro,
  onNovaMovimentacao,
  onNovaFuga,
  onExportarRelatorio,
  fugasAtivasCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                DME
                <span className="text-xs font-normal text-slate-400 font-mono tracking-normal">
                  Divisão de Monitoramento Eletrônico
                </span>
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setAbaAtiva('todos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                abaAtiva === 'todos'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Monitorados
            </button>
            <button
              onClick={() => setAbaAtiva('movimentacoes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                abaAtiva === 'movimentacoes'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Entradas & Saídas
            </button>
            <button
              onClick={() => setAbaAtiva('vitimas_agressores')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                abaAtiva === 'vitimas_agressores'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Vítimas & Agressores
            </button>
            <button
              onClick={() => setAbaAtiva('fugas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                abaAtiva === 'fugas'
                  ? 'bg-red-950/60 text-red-300 border border-red-800/50'
                  : 'text-slate-400 hover:text-red-300 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Fugas & Evasões</span>
              {fugasAtivasCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono bg-red-600 text-white rounded">
                  {fugasAtivasCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('faixas_etarias')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                abaAtiva === 'faixas_etarias'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Faixas Etárias
            </button>
            <button
              onClick={() => setAbaAtiva('prompt_mestre')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                abaAtiva === 'prompt_mestre'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Prompt Mestre</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportarRelatorio}
              title="Exportar Relatório Oficial em PDF (jsPDF)"
              className="px-3 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Relatório (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onNovaMovimentacao}
              title="Registrar Entrada ou Saída no livro"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Entrada / Saída</span>
            </button>
            <button
              onClick={onNovaFuga}
              title="Registrar ocorrência de rompimento ou fuga"
              className="px-3 py-1.5 text-xs font-medium text-red-200 bg-red-950/80 hover:bg-red-900 border border-red-800/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Registrar Fuga</span>
            </button>
            <button
              onClick={onNovoCadastro}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Cadastro</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none text-xs">
          <button
            onClick={() => setAbaAtiva('todos')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              abaAtiva === 'todos' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Monitorados
          </button>
          <button
            onClick={() => setAbaAtiva('movimentacoes')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              abaAtiva === 'movimentacoes' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Entradas/Saídas
          </button>
          <button
            onClick={() => setAbaAtiva('vitimas_agressores')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              abaAtiva === 'vitimas_agressores' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Vítimas & Agressores
          </button>
          <button
            onClick={() => setAbaAtiva('fugas')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium flex items-center gap-1 ${
              abaAtiva === 'fugas' ? 'bg-red-900/60 text-red-300' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Fugas ({fugasAtivasCount})</span>
          </button>
          <button
            onClick={() => setAbaAtiva('faixas_etarias')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              abaAtiva === 'faixas_etarias' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Faixas Etárias
          </button>
          <button
            onClick={() => setAbaAtiva('prompt_mestre')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium text-amber-400 ${
              abaAtiva === 'prompt_mestre' ? 'bg-amber-500/20' : ''
            }`}
          >
            Prompt Mestre
          </button>
        </div>
      </div>
    </header>
  );
};

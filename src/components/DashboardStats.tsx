import React from 'react';
import { Users, ShieldAlert, UserCheck, AlertOctagon, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { IndividuoMonitorado } from '../types/monitoring';

interface DashboardStatsProps {
  individuos: IndividuoMonitorado[];
  onFiltrarStatus?: (status: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ individuos }) => {
  const totalGeral = individuos.length;
  const ativos = individuos.filter((i) => i.status === 'ATIVO').length;
  const vitimas = individuos.filter((i) => i.perfil === 'VITIMA_PROTEGIDA' && i.status === 'ATIVO').length;
  const agressores = individuos.filter((i) => i.perfil === 'AGRESSOR' && i.status === 'ATIVO').length;
  const foragidos = individuos.filter((i) => i.status === 'FORAGIDO').length;

  // Total de movimentações de entradas e saídas
  let totalEntradas = 0;
  let totalSaidas = 0;
  individuos.forEach((ind) => {
    ind.movimentacoes.forEach((mov) => {
      if (mov.tipo === 'ENTRADA') totalEntradas++;
      if (mov.tipo === 'SAIDA') totalSaidas++;
    });
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 no-print">
      {/* 1. Ativos */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Ativos no Sistema</span>
          <UserCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tabular-nums">{ativos}</span>
          <span className="text-xs text-slate-500 font-mono">/ {totalGeral} total</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Dispositivos em linha</div>
      </div>

      {/* 2. Vítimas Protegidas */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Vítimas Protegidas</span>
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-purple-300 tabular-nums">{vitimas}</span>
          <span className="text-xs text-slate-500 font-mono">ativas</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Botão pânico entregue</div>
      </div>

      {/* 3. Agressores */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Agressores (M. Penha)</span>
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">{agressores}</span>
          <span className="text-xs text-slate-500 font-mono">pareados</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Raio de exclusão ativo</div>
      </div>

      {/* 4. Foragidos / Rompimentos */}
      <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-red-300 mb-1">
          <span>Fugas / Evasões</span>
          <AlertOctagon className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-red-300 tabular-nums">{foragidos}</span>
          <span className="text-xs text-red-400/80 font-mono">foragidos</span>
        </div>
        <div className="text-[11px] text-red-300/80 mt-1">Alerta policial emitido</div>
      </div>

      {/* 5. Total de Entradas */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Registros de Entrada</span>
          <ArrowDownRight className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">{totalEntradas}</span>
          <span className="text-xs text-slate-500 font-mono">histórico</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Instalações / Acolhimentos</div>
      </div>

      {/* 6. Total de Saídas */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Registros de Saída</span>
          <ArrowUpRight className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-orange-300 tabular-nums">{totalSaidas}</span>
          <span className="text-xs text-slate-500 font-mono">histórico</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Desligamentos / Fugas</div>
      </div>
    </div>
  );
};

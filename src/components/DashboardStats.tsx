import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  UserCheck,
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  PieChart as PieChartIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { IndividuoMonitorado } from '../types/monitoring';

interface DashboardStatsProps {
  individuos: IndividuoMonitorado[];
  onFiltrarStatus?: (status: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  individuos,
  onFiltrarStatus,
}) => {
  const [painelGraficoAberto, setPainelGraficoAberto] = useState(true);
  const [statusAtivoHover, setStatusAtivoHover] = useState<string | null>(null);

  const totalGeral = individuos.length;
  const ativos = individuos.filter((i) => i.status === 'ATIVO').length;
  const foragidos = individuos.filter((i) => i.status === 'FORAGIDO').length;
  const desligados = individuos.filter((i) => i.status === 'DESLIGADO').length;
  const suspensos = individuos.filter(
    (i) => i.status === 'SUSPENSO' || i.status === 'RECAPTURA_PENDENTE'
  ).length;

  const vitimas = individuos.filter(
    (i) => i.perfil === 'VITIMA_PROTEGIDA' && i.status === 'ATIVO'
  ).length;
  const agressores = individuos.filter(
    (i) => i.perfil === 'AGRESSOR' && i.status === 'ATIVO'
  ).length;

  // Total de movimentações de entradas e saídas
  let totalEntradas = 0;
  let totalSaidas = 0;
  individuos.forEach((ind) => {
    ind.movimentacoes.forEach((mov) => {
      if (mov.tipo === 'ENTRADA') totalEntradas++;
      if (mov.tipo === 'SAIDA') totalSaidas++;
    });
  });

  // Proporções calculadas para o Gráfico de Rosca (Donut)
  const pctAtivos = totalGeral > 0 ? (ativos / totalGeral) * 100 : 0;
  const pctForagidos = totalGeral > 0 ? (foragidos / totalGeral) * 100 : 0;
  const pctDesligados = totalGeral > 0 ? (desligados / totalGeral) * 100 : 0;
  const pctSuspensos = totalGeral > 0 ? (suspensos / totalGeral) * 100 : 0;

  // Dados para o componente Recharts PieChart
  const dadosStatus = [
    {
      id: 'ATIVO',
      name: 'Ativos em Cumprimento',
      shortName: 'Ativos',
      value: ativos,
      percentual: pctAtivos.toFixed(1),
      color: '#10b981', // Emerald 500
      glowColor: 'rgba(16, 185, 129, 0.25)',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/40',
      textColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      icon: UserCheck,
      descricao: 'Dispositivos telemáticos transmitindo e em cumprimento cautelar regular.',
    },
    {
      id: 'FORAGIDO',
      name: 'Foragidos / Rompimentos',
      shortName: 'Foragidos',
      value: foragidos,
      percentual: pctForagidos.toFixed(1),
      color: '#ef4444', // Red 500
      glowColor: 'rgba(239, 68, 68, 0.25)',
      borderColor: 'border-red-500/40',
      bgColor: 'bg-red-950/40',
      textColor: 'text-red-400',
      barColor: 'bg-red-500',
      icon: AlertOctagon,
      descricao: 'Rompimento de perímetro, descarregamento ou fuga com mandado de prisão expedido.',
    },
    {
      id: 'DESLIGADO',
      name: 'Desligados do Sistema',
      shortName: 'Desligados',
      value: desligados,
      percentual: pctDesligados.toFixed(1),
      color: '#64748b', // Slate 500
      glowColor: 'rgba(100, 116, 139, 0.25)',
      borderColor: 'border-slate-700/50',
      bgColor: 'bg-slate-900/60',
      textColor: 'text-slate-400',
      barColor: 'bg-slate-500',
      icon: CheckCircle2,
      descricao: 'Extinção de pena, revogação judicial formal ou devolução do equipamento.',
    },
  ];

  if (suspensos > 0) {
    dadosStatus.push({
      id: 'SUSPENSO',
      name: 'Suspensos / Cautelares',
      shortName: 'Suspensos',
      value: suspensos,
      percentual: pctSuspensos.toFixed(1),
      color: '#f59e0b', // Amber 500
      glowColor: 'rgba(245, 158, 11, 0.25)',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/40',
      textColor: 'text-amber-400',
      barColor: 'bg-amber-500',
      icon: Activity,
      descricao: 'Suspensão temporária determinada pelo juízo ou pendência de recaptura.',
    });
  }

  // Dados filtrados com valor > 0 para a renderização limpa do gráfico
  const dadosGrafico = dadosStatus.filter((d) => d.value > 0);
  const dadosParaExibir =
    dadosGrafico.length > 0
      ? dadosGrafico
      : [
          {
            id: 'VAZIO',
            name: 'Sem registros cadastrados',
            shortName: 'Vazio',
            value: 1,
            percentual: '0',
            color: '#334155',
            glowColor: 'transparent',
            borderColor: 'border-slate-800',
            bgColor: 'bg-slate-900',
            textColor: 'text-slate-500',
            barColor: 'bg-slate-700',
            icon: Activity,
            descricao: 'Nenhum monitorado cadastrado no banco de dados atualmente.',
          },
        ];

  // Tooltip customizado com visual institucional e tema escuro
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/90 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-white text-xs">{data.name}</span>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-base font-black text-white tabular-nums">
              {data.value} {data.value === 1 ? 'indivíduo' : 'indivíduos'}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              ({data.percentual}% do total)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">
            {data.descricao}
          </p>
        </div>
      );
    }
    return null;
  };

  // Índices operacionais
  const taxaConformidade =
    ativos + foragidos > 0
      ? ((ativos / (ativos + foragidos)) * 100).toFixed(1)
      : '100.0';
  const taxaEvasao =
    totalGeral > 0 ? ((foragidos / totalGeral) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-3 mb-4 sm:mb-6 no-print">
      {/* 1. KPIs Numéricos Executivos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* 1. Ativos */}
        <div
          onClick={() => onFiltrarStatus?.('ATIVO')}
          className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-emerald-500/40 hover:bg-slate-850 transition-all cursor-pointer group"
          title="Clique para filtrar por status Ativo"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate group-hover:text-emerald-300 transition-colors">Ativos em Linha</span>
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">{ativos}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono truncate">/ {totalGeral} total</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400/80 font-mono mt-1 truncate">
            {pctAtivos.toFixed(0)}% do efetivo
          </div>
        </div>

        {/* 2. Vítimas Protegidas */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-purple-500/40 hover:bg-slate-850 transition-all cursor-pointer">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Vítimas Prot.</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-purple-300 tabular-nums">{vitimas}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono">ativas</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Botão de pânico</div>
        </div>

        {/* 3. Agressores */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-amber-500/40 hover:bg-slate-850 transition-all cursor-pointer">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Agressores</span>
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 tabular-nums">{agressores}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono">pareados</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Raio de exclusão</div>
        </div>

        {/* 4. Foragidos / Rompimentos */}
        <div
          onClick={() => onFiltrarStatus?.('FORAGIDO')}
          className="bg-red-950/40 border border-red-900/60 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-red-500 hover:bg-red-950/60 transition-all cursor-pointer group"
          title="Clique para filtrar por status Foragido"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-red-300 mb-1">
            <span className="truncate group-hover:text-red-200 transition-colors">Fugas / Evasões</span>
            <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-red-300 tabular-nums">{foragidos}</span>
            <span className="text-[10px] sm:text-xs text-red-400/80 font-mono">foragidos</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-red-400 font-mono mt-1 truncate">
            {pctForagidos.toFixed(0)}% de evasão
          </div>
        </div>

        {/* 5. Total de Entradas */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-cyan-500/40 hover:bg-slate-850 transition-all">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Entradas</span>
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tabular-nums">{totalEntradas}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono">histórico</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Ativações / Retornos</div>
        </div>

        {/* 6. Total de Saídas */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between hover:border-orange-500/40 hover:bg-slate-850 transition-all">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1">
            <span className="truncate">Saídas</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-orange-300 tabular-nums">{totalSaidas}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono">histórico</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Deslig. / Evasões</div>
        </div>
      </div>

      {/* 2. Painel Visual de Gráficos Recharts (Gráfico de Rosca de Status) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xl">
        {/* Barra de Título do Gráfico */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  Proporção de Indivíduos por Status Operacional
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Tempo Real
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Distribuição telemática entre Ativos, Foragidos e Desligados da Central DME
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPainelGraficoAberto(!painelGraficoAberto)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-850 border border-transparent hover:border-slate-700 transition-colors shrink-0"
            title={painelGraficoAberto ? 'Recolher gráfico' : 'Expandir gráfico'}
          >
            <span className="hidden sm:inline text-[11px]">
              {painelGraficoAberto ? 'Ocultar Gráfico' : 'Exibir Gráfico'}
            </span>
            {painelGraficoAberto ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Conteúdo do Gráfico de Rosca */}
        {painelGraficoAberto && (
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
              {/* Coluna da Rosca (Recharts) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[280px] h-[220px] sm:h-[230px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={dadosParaExibir}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={dadosGrafico.length > 1 ? 4 : 0}
                        dataKey="value"
                        nameKey="name"
                        stroke="#0f172a"
                        strokeWidth={3}
                        isAnimationActive={true}
                        animationDuration={650}
                        onMouseEnter={(_, index) => {
                          const item = dadosParaExibir[index];
                          if (item) setStatusAtivoHover(item.id);
                        }}
                        onMouseLeave={() => setStatusAtivoHover(null)}
                      >
                        {dadosParaExibir.map((entry) => (
                          <Cell
                            key={`donut-cell-${entry.id}`}
                            fill={entry.color}
                            opacity={
                              statusAtivoHover && statusAtivoHover !== entry.id ? 0.45 : 1
                            }
                            className="transition-opacity duration-200 cursor-pointer outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Núcleo Central do Gráfico de Rosca */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white tabular-nums leading-none tracking-tight">
                      {totalGeral}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Monitorados
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 mt-0.5 font-bold">
                      {pctAtivos.toFixed(0)}% Ativos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Ativos: <strong className="text-white">{ativos}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Fugas: <strong className="text-white">{foragidos}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Deslig.: <strong className="text-white">{desligados}</strong>
                  </span>
                </div>
              </div>

              {/* Coluna de Detalhamento e Barras de Proporção */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Detalhamento da Proporção & Efetivo</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Total: {totalGeral} indivíduos
                  </span>
                </div>

                {/* Cards de Status com Barras de Progresso */}
                <div className="space-y-2.5">
                  {dadosStatus.map((item) => {
                    const Icone = item.icon;
                    const isHovered = statusAtivoHover === item.id;
                    const pctNum = parseFloat(item.percentual);

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setStatusAtivoHover(item.id)}
                        onMouseLeave={() => setStatusAtivoHover(null)}
                        onClick={() => onFiltrarStatus?.(item.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-slate-800/80 border-slate-600 scale-[1.01]'
                            : `${item.bgColor} ${item.borderColor} hover:border-slate-600`
                        }`}
                        title={`Clique para filtrar pelo status ${item.shortName}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${item.color}20`, color: item.color }}
                            >
                              <Icone className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {item.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-2 font-mono shrink-0">
                            <span className="text-sm font-extrabold text-white tabular-nums">
                              {item.value}
                            </span>
                            <span className={`text-xs font-bold ${item.textColor}`}>
                              ({item.percentual}%)
                            </span>
                          </div>
                        </div>

                        {/* Barra de Proporção Visual */}
                        <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800/80">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${item.barColor}`}
                            style={{ width: `${Math.min(100, Math.max(pctNum > 0 ? 3 : 0, pctNum))}%` }}
                          />
                        </div>

                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                          {item.descricao}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Indicadores Operacionais de Auditoria */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Conformidade</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-300">
                      {taxaConformidade}%
                    </div>
                    <div className="text-[9px] text-slate-500">Ativos vs Rompimentos</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span>Taxa de Evasão</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-red-300">
                      {taxaEvasao}%
                    </div>
                    <div className="text-[9px] text-slate-500">Foragidos no total</div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <Activity className="w-3 h-3 text-amber-400" />
                      <span>Desligamentos</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-300">
                      {pctDesligados.toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-slate-500">Medidas extintas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

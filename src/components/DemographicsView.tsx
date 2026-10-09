import React, { useState } from 'react';
import {
  Users,
  PieChart,
  BarChart3,
  Filter,
  Shield,
  User,
  AlertTriangle,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';
import { IndividuoMonitorado, FaixaEtaria } from '../types/monitoring';
import {
  calcularIdade,
  obterFaixaEtaria,
  rotuloFaixaEtaria,
  rotuloPerfil,
  rotuloStatus,
  formatarData,
} from '../utils/ageUtils';

interface DemographicsViewProps {
  individuos: IndividuoMonitorado[];
  onSelecionarIndividuo: (individuo: IndividuoMonitorado) => void;
}

const FAIXAS: FaixaEtaria[] = ['18_24', '25_34', '35_49', '50_64', '65_MAIS'];

export const DemographicsView: React.FC<DemographicsViewProps> = ({
  individuos,
  onSelecionarIndividuo,
}) => {
  const [faixaFiltro, setFaixaFiltro] = useState<FaixaEtaria | 'TODAS'>('TODAS');
  const [modoVisualizacao, setModoVisualizacao] = useState<'auto' | 'cards' | 'tabela'>('auto');

  const total = individuos.length;

  // Contagem por faixa etária
  const estatisticasFaixas = FAIXAS.map((faixa) => {
    const doGrupo = individuos.filter((ind) => {
      const idade = calcularIdade(ind.dataNascimento);
      return obterFaixaEtaria(idade) === faixa;
    });

    const vitimas = doGrupo.filter((i) => i.perfil === 'VITIMA_PROTEGIDA').length;
    const agressores = doGrupo.filter((i) => i.perfil === 'AGRESSOR').length;
    const geral = doGrupo.filter((i) => i.perfil === 'MONITORADO_GERAL').length;
    const foragidos = doGrupo.filter((i) => i.status === 'FORAGIDO').length;

    const percentual = total > 0 ? ((doGrupo.length / total) * 100).toFixed(1) : '0';

    return {
      faixa,
      rotulo: rotuloFaixaEtaria(faixa),
      total: doGrupo.length,
      vitimas,
      agressores,
      geral,
      foragidos,
      percentual,
      individuos: doGrupo,
    };
  });

  // Lista filtrada para a tabela inferior
  const listaFiltrada =
    faixaFiltro === 'TODAS'
      ? individuos
      : individuos.filter((ind) => {
          const idade = calcularIdade(ind.dataNascimento);
          return obterFaixaEtaria(idade) === faixaFiltro;
        });

  // Top tipos penais
  const contagemPenal: Record<string, number> = {};
  individuos.forEach((ind) => {
    const tp = ind.tipoPenal || 'Não informado';
    contagemPenal[tp] = (contagemPenal[tp] || 0) + 1;
  });
  const rankingPenal = Object.entries(contagemPenal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header da Seção Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span>Estatísticas Demográficas por Faixa Etária & Tipo Penal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cálculo automático com base na data de nascimento e estratificação criminal
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 shrink-0">Filtrar:</span>
          <select
            value={faixaFiltro}
            onChange={(e) => setFaixaFiltro(e.target.value as any)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-xs"
          >
            <option value="TODAS">Todas as Faixas ({total})</option>
            {FAIXAS.map((f) => (
              <option key={f} value={f}>
                {rotuloFaixaEtaria(f)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Cards de Faixa Etária Responsivo (2 cols no mobile, 3 no tablet, 5 no desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {estatisticasFaixas.map((item) => {
          const selecionado = faixaFiltro === item.faixa;
          return (
            <div
              key={item.faixa}
              onClick={() => setFaixaFiltro(selecionado ? 'TODAS' : item.faixa)}
              className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selecionado
                  ? 'bg-amber-950/30 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1 sm:mb-2">
                  <span className="font-semibold text-slate-200 truncate">{item.rotulo}</span>
                  <span className="font-mono text-amber-400 font-bold shrink-0">{item.percentual}%</span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">{item.total}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-mono">pessoas</span>
                </div>

                {/* Barra de Progresso Visual */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2 sm:mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (item.total / (total || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Sub-divisões */}
              <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <div className="flex justify-between">
                  <span>Gerais:</span>
                  <span className="text-slate-200 font-semibold">{item.geral}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agressores:</span>
                  <span className="text-amber-400 font-semibold">{item.agressores}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vítimas:</span>
                  <span className="text-purple-300 font-semibold">{item.vitimas}</span>
                </div>
                {item.foragidos > 0 && (
                  <div className="flex justify-between text-red-400 font-bold">
                    <span>Foragidos:</span>
                    <span>{item.foragidos}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ranking dos Tipos Penais Mais Frequentes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-amber-400" />
          <span>Top Tipos Penais Registrados no Monitoramento</span>
        </h3>

        <div className="space-y-2.5">
          {rankingPenal.map(([tipo, qtd], index) => {
            const perc = total > 0 ? ((qtd / total) * 100).toFixed(1) : '0';
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium truncate pr-2" title={tipo}>
                    {tipo}
                  </span>
                  <span className="font-mono text-slate-400 shrink-0">
                    <strong className="text-amber-400">{qtd}</strong> ({perc}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400/80 rounded-full"
                    style={{ width: `${Math.min(100, (qtd / (total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista Filtrada de Indivíduos por Faixa com Cards no Mobile */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-white">
            Indivíduos da Faixa:{' '}
            <span className="text-amber-400">
              {faixaFiltro === 'TODAS' ? 'Todas as Idades' : rotuloFaixaEtaria(faixaFiltro)}
            </span>{' '}
            ({listaFiltrada.length})
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setModoVisualizacao('cards')}
              className={`p-1.5 rounded transition-colors ${
                modoVisualizacao === 'cards' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setModoVisualizacao('tabela')}
              className={`p-1.5 rounded transition-colors ${
                modoVisualizacao === 'tabela' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cards para Mobile */}
        <div
          className={`${
            modoVisualizacao === 'tabela'
              ? 'hidden'
              : modoVisualizacao === 'cards'
              ? 'grid'
              : 'grid md:hidden'
          } grid-cols-1 sm:grid-cols-2 gap-2.5`}
        >
          {listaFiltrada.map((ind) => {
            const idade = calcularIdade(ind.dataNascimento);
            return (
              <div
                key={ind.id}
                onClick={() => onSelecionarIndividuo(ind)}
                className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={ind.fotoUrl}
                    alt={ind.nomeCompleto}
                    referrerPolicy="no-referrer"
                    className="w-10 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-xs truncate">
                      {ind.nomeCompleto}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      CPF: {ind.cpf} · <strong className="text-amber-400">{idade} anos</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {ind.tipoPenal}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 p-1.5 bg-slate-800 text-slate-300 rounded-lg">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela para Desktop */}
        <div
          className={`${
            modoVisualizacao === 'cards'
              ? 'hidden'
              : modoVisualizacao === 'tabela'
              ? 'block'
              : 'hidden md:block'
          } overflow-x-auto`}
        >
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Pessoa</th>
                <th className="py-2.5 px-3">Data Nasc. / Idade</th>
                <th className="py-2.5 px-3">Perfil</th>
                <th className="py-2.5 px-3">Tipo Penal</th>
                <th className="py-2.5 px-3">Processo</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {listaFiltrada.map((ind) => {
                const idade = calcularIdade(ind.dataNascimento);
                return (
                  <tr
                    key={ind.id}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                    onClick={() => onSelecionarIndividuo(ind)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={ind.fotoUrl}
                          alt={ind.nomeCompleto}
                          referrerPolicy="no-referrer"
                          className="w-7 h-8 rounded object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-white">{ind.nomeCompleto}</div>
                          <div className="text-[10px] text-slate-400 font-mono">CPF: {ind.cpf}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <span className="font-bold text-amber-300">{idade} anos</span>
                      <div className="text-[10px] text-slate-500">{formatarData(ind.dataNascimento)}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {rotuloPerfil(ind.perfil)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-300" title={ind.tipoPenal}>
                      {ind.tipoPenal}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-300">
                      {ind.numeroProcesso}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-emerald-400">
                      {rotuloStatus(ind.status)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelecionarIndividuo(ind);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                      >
                        Ver Dossiê
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

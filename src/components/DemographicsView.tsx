import React, { useState } from 'react';
import { Users, PieChart, BarChart3, Filter, Shield, User, AlertTriangle } from 'lucide-react';
import { IndividuoMonitorado, FaixaEtaria } from '../types/monitoring';
import { calcularIdade, obterFaixaEtaria, rotuloFaixaEtaria, rotuloPerfil, rotuloStatus, formatarData } from '../utils/ageUtils';

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
    <div className="space-y-6">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Estatísticas Demográficas por Faixa Etária & Tipo Penal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cálculo automático com base na data de nascimento e estratificação criminal
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filtrar por:</span>
          <select
            value={faixaFiltro}
            onChange={(e) => setFaixaFiltro(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            <option value="TODAS">Todas as Faixas Etárias ({total})</option>
            {FAIXAS.map((f) => (
              <option key={f} value={f}>
                {rotuloFaixaEtaria(f)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Cards de Faixa Etária */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {estatisticasFaixas.map((item) => {
          const selecionado = faixaFiltro === item.faixa;
          return (
            <div
              key={item.faixa}
              onClick={() => setFaixaFiltro(selecionado ? 'TODAS' : item.faixa)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selecionado
                  ? 'bg-amber-950/20 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-200">{item.rotulo}</span>
                <span className="font-mono text-amber-400 font-bold">{item.percentual}%</span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black font-mono text-white tabular-nums">{item.total}</span>
                <span className="text-xs text-slate-500 font-mono">pessoas</span>
              </div>

              {/* Barra de Progresso Visual */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (item.total / (total || 1)) * 100)}%` }}
                />
              </div>

              {/* Sub-divisões */}
              <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
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
                  <div className="flex justify-between text-red-400 font-semibold">
                    <span>Foragidos:</span>
                    <span>{item.foragidos}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Box Distribuição de Tipos Penais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Top Tipos Penais no Sistema
          </h3>
          <div className="space-y-2">
            {rankingPenal.map(([tp, qtd], idx) => (
              <div key={idx} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                  <span className="truncate pr-2">{tp}</span>
                  <span className="font-mono text-amber-400 tabular-nums">{qtd}</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(qtd / (total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela dos indivíduos da Faixa Selecionada */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Pessoas Filtradas na Faixa: {faixaFiltro === 'TODAS' ? 'Todas as Faixas' : rotuloFaixaEtaria(faixaFiltro)} ({listaFiltrada.length})
            </h3>
            {faixaFiltro !== 'TODAS' && (
              <button
                onClick={() => setFaixaFiltro('TODAS')}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
              >
                Limpar filtro
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Nome / CPF</th>
                  <th className="py-2 px-3 font-semibold">Idade / Nasc.</th>
                  <th className="py-2 px-3 font-semibold">Perfil</th>
                  <th className="py-2 px-3 font-semibold">Tipo Penal</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {listaFiltrada.map((ind) => {
                  const idade = calcularIdade(ind.dataNascimento);
                  return (
                    <tr
                      key={ind.id}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      onClick={() => onSelecionarIndividuo(ind)}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{ind.nomeCompleto}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ind.cpf}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white font-mono">{idade} anos</div>
                        <div className="text-[11px] text-slate-400">{formatarData(ind.dataNascimento)}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ind.perfil === 'VITIMA_PROTEGIDA'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : ind.perfil === 'AGRESSOR'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rotuloPerfil(ind.perfil)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-300 max-w-xs truncate">{ind.tipoPenal}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{ind.numeroProcesso}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            ind.status === 'FORAGIDO'
                              ? 'text-red-400'
                              : ind.status === 'ATIVO'
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {rotuloStatus(ind.status)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelecionarIndividuo(ind);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                        >
                          Ver Ficha
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
    </div>
  );
};

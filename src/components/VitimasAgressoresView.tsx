import React, { useState } from 'react';
import { Shield, ShieldAlert, Users, ArrowUpDown, AlertCircle, PlusCircle, Radio, MapPin } from 'lucide-react';
import { IndividuoMonitorado } from '../types/monitoring';
import { formatarDataHora, calcularIdade, rotuloFaixaEtaria, obterFaixaEtaria } from '../utils/ageUtils';

interface VitimasAgressoresViewProps {
  individuos: IndividuoMonitorado[];
  onSelecionarIndividuo: (ind: IndividuoMonitorado) => void;
  onNovoCadastro: () => void;
  onNovaMovimentacao: (individuoId?: string) => void;
}

export const VitimasAgressoresView: React.FC<VitimasAgressoresViewProps> = ({
  individuos,
  onSelecionarIndividuo,
  onNovoCadastro,
  onNovaMovimentacao,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'AGRESSORES' | 'VITIMAS'>('TODOS');

  const agressores = individuos.filter((i) => i.perfil === 'AGRESSOR');
  const vitimas = individuos.filter((i) => i.perfil === 'VITIMA_PROTEGIDA');

  // Identificar pares vinculados
  const paresVinculados = agressores
    .map((agr) => {
      const vit = vitimas.find(
        (v) => v.id === agr.individuoVinculadoId || agr.id === v.individuoVinculadoId
      );
      return {
        agressor: agr,
        vitima: vit,
      };
    })
    .filter((p) => p.vitima !== undefined) as {
    agressor: IndividuoMonitorado;
    vitima: IndividuoMonitorado;
  }[];

  return (
    <div className="space-y-6">
      {/* Banner Explicativo */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-amber-950/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Módulo de Proteção à Mulher & Lei Maria da Penha (Lei 11.340/06)</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Gestão integrada de pares monitorados: registro independente de entrada e saída da vítima (entrega/devolução de botão de pânico) e do agressor (tornozeleira eletrônica), com controle do raio de exclusão e alertas de aproximação.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={onNovoCadastro}
            className="px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Vítima ou Agressor</span>
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total de Vítimas com Botão do Pânico</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{vitimas.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {vitimas.filter((v) => v.status === 'ATIVO').length} ativas no programa
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total de Agressores Monitorados</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{agressores.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {agressores.filter((a) => a.status === 'ATIVO').length} ativos com tornozeleira
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Pares Vinculados com Raio Dinâmico</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">{paresVinculados.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Geofencing bilateral ativo</div>
        </div>
      </div>

      {/* Seção 1: Pares Integrados (Agressor x Vítima) */}
      {paresVinculados.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            Pares Vinculados em Monitoramento Bilateral Ativo ({paresVinculados.length})
          </h3>

          <div className="space-y-4">
            {paresVinculados.map(({ agressor, vitima }, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden relative"
              >
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  {/* Lado do Agressor */}
                  <div
                    onClick={() => onSelecionarIndividuo(agressor)}
                    className="flex-1 flex items-start gap-3 p-3 bg-amber-950/20 border border-amber-900/50 rounded-xl cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <img
                      src={agressor.fotoUrl}
                      alt={agressor.nomeCompleto}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-lg object-cover border border-amber-600 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                          AGRESSOR
                        </span>
                        <span className="text-xs font-mono text-slate-400">{agressor.status}</span>
                      </div>
                      <div className="text-sm font-bold text-white truncate">{agressor.nomeCompleto}</div>
                      <div className="text-xs text-slate-400 font-mono">CPF: {agressor.cpf}</div>
                      <div className="text-xs text-amber-400 truncate">{agressor.tipoPenal}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Disp: {agressor.numeroTornozeleiraOuReceptor}
                      </div>
                    </div>
                  </div>

                  {/* Conector Central (Raio de Exclusão) */}
                  <div className="shrink-0 flex flex-col items-center justify-center px-2 py-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                      <span>Raio: {agressor.raioExclusaoMetros || 500} metros</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Proc: {agressor.numeroProcesso}
                    </div>
                  </div>

                  {/* Lado da Vítima */}
                  <div
                    onClick={() => onSelecionarIndividuo(vitima)}
                    className="flex-1 flex items-start gap-3 p-3 bg-purple-950/20 border border-purple-900/50 rounded-xl cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <img
                      src={vitima.fotoUrl}
                      alt={vitima.nomeCompleto}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-lg object-cover border border-purple-600 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                          VÍTIMA PROTEGIDA
                        </span>
                        <span className="text-xs font-mono text-slate-400">{vitima.status}</span>
                      </div>
                      <div className="text-sm font-bold text-white truncate">{vitima.nomeCompleto}</div>
                      <div className="text-xs text-slate-400 font-mono">CPF: {vitima.cpf}</div>
                      <div className="text-xs text-purple-300 truncate">Botão do Pânico Portátil</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Receptor: {vitima.numeroTornozeleiraOuReceptor}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linha de Histórico de Entradas / Saídas dos Dois */}
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="text-slate-400">
                    <span className="text-amber-400 font-semibold block mb-0.5">Última Movimentação Agressor:</span>
                    {agressor.movimentacoes.length > 0 ? (
                      <span>
                        {agressor.movimentacoes[agressor.movimentacoes.length - 1].tipo} em{' '}
                        {formatarDataHora(agressor.movimentacoes[agressor.movimentacoes.length - 1].dataHora)} (
                        {agressor.movimentacoes[agressor.movimentacoes.length - 1].motivo})
                      </span>
                    ) : (
                      'Sem movimentações'
                    )}
                  </div>
                  <div className="text-slate-400">
                    <span className="text-purple-300 font-semibold block mb-0.5">Última Movimentação Vítima:</span>
                    {vitima.movimentacoes.length > 0 ? (
                      <span>
                        {vitima.movimentacoes[vitima.movimentacoes.length - 1].tipo} em{' '}
                        {formatarDataHora(vitima.movimentacoes[vitima.movimentacoes.length - 1].dataHora)} (
                        {vitima.movimentacoes[vitima.movimentacoes.length - 1].motivo})
                      </span>
                    ) : (
                      'Sem movimentações'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 2: Todas as Vítimas e Agressores */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Listagem de Registros: Vítimas & Agressores ({vitimas.length + agressores.length})
          </h3>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filtroTipo === 'TODOS' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Todos ({vitimas.length + agressores.length})
            </button>
            <button
              onClick={() => setFiltroTipo('AGRESSORES')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filtroTipo === 'AGRESSORES' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400'
              }`}
            >
              Agressores ({agressores.length})
            </button>
            <button
              onClick={() => setFiltroTipo('VITIMAS')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filtroTipo === 'VITIMAS' ? 'bg-purple-950 text-purple-300 font-medium' : 'text-slate-400'
              }`}
            >
              Vítimas ({vitimas.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Perfil</th>
                <th className="py-2.5 px-3 font-semibold">Nome Completo</th>
                <th className="py-2.5 px-3 font-semibold">Faixa Etária</th>
                <th className="py-2.5 px-3 font-semibold">Processo Judicial</th>
                <th className="py-2.5 px-3 font-semibold">Equipamento</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[...agressores, ...vitimas]
                .filter((i) => {
                  if (filtroTipo === 'AGRESSORES') return i.perfil === 'AGRESSOR';
                  if (filtroTipo === 'VITIMAS') return i.perfil === 'VITIMA_PROTEGIDA';
                  return true;
                })
                .map((ind) => {
                  const idade = calcularIdade(ind.dataNascimento);
                  const faixa = obterFaixaEtaria(idade);
                  return (
                    <tr
                      key={ind.id}
                      className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                      onClick={() => onSelecionarIndividuo(ind)}
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            ind.perfil === 'VITIMA_PROTEGIDA'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {ind.perfil === 'VITIMA_PROTEGIDA' ? 'VÍTIMA' : 'AGRESSOR'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{ind.nomeCompleto}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ind.cpf}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white font-mono">{idade} anos</div>
                        <div className="text-[11px] text-slate-400">{rotuloFaixaEtaria(faixa)}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-amber-300">{ind.numeroProcesso}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{ind.tipoPenal}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {ind.numeroTornozeleiraOuReceptor || 'Pendente'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            ind.status === 'ATIVO' ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {ind.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNovaMovimentacao(ind.id);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                        >
                          Lançar Entrada/Saída
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

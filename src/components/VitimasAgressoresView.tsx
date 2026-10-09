import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Users,
  ArrowUpDown,
  AlertCircle,
  PlusCircle,
  Radio,
  MapPin,
  Edit3,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';
import { IndividuoMonitorado } from '../types/monitoring';
import {
  formatarDataHora,
  calcularIdade,
  rotuloFaixaEtaria,
  obterFaixaEtaria,
  rotuloStatus,
  formatarData,
} from '../utils/ageUtils';

interface VitimasAgressoresViewProps {
  individuos: IndividuoMonitorado[];
  onSelecionarIndividuo: (ind: IndividuoMonitorado) => void;
  onEditarCadastro: (ind: IndividuoMonitorado) => void;
  onNovoCadastro: () => void;
  onNovaMovimentacao: (individuoId?: string) => void;
}

export const VitimasAgressoresView: React.FC<VitimasAgressoresViewProps> = ({
  individuos,
  onSelecionarIndividuo,
  onEditarCadastro,
  onNovoCadastro,
  onNovaMovimentacao,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'AGRESSORES' | 'VITIMAS'>('TODOS');
  const [modoVisualizacao, setModoVisualizacao] = useState<'auto' | 'cards' | 'tabela'>('auto');

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

  // Lista para a tabela ou cards
  const listaExibicao =
    filtroTipo === 'AGRESSORES'
      ? agressores
      : filtroTipo === 'VITIMAS'
      ? vitimas
      : [...vitimas, ...agressores];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner Explicativo Responsivo */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-amber-950/40 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm sm:text-base">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
            <span>Módulo de Proteção à Mulher & Lei Maria da Penha (Lei 11.340/06)</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Gestão integrada de pares monitorados: registro independente de entrada e saída da vítima (entrega/devolução de botão de pânico) e do agressor (tornozeleira eletrônica), com controle do raio de exclusão e alertas de aproximação.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={onNovoCadastro}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Vítima / Agressor</span>
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas em Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total de Vítimas com Botão do Pânico</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300 mt-1">{vitimas.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {vitimas.filter((v) => v.status === 'ATIVO').length} ativas no programa
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total de Agressores Monitorados</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-1">{agressores.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {agressores.filter((a) => a.status === 'ATIVO').length} ativos com tornozeleira
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Pares Vinculados com Raio Dinâmico</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-1">{paresVinculados.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Geofencing bilateral ativo</div>
        </div>
      </div>

      {/* Seção 1: Pares Integrados (Agressor x Vítima) */}
      {paresVinculados.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <span>Pares Vinculados em Monitoramento Bilateral Ativo ({paresVinculados.length})</span>
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {paresVinculados.map(({ agressor, vitima }, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg overflow-hidden relative"
              >
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 lg:gap-6">
                  {/* Lado do Agressor */}
                  <div
                    onClick={() => onSelecionarIndividuo(agressor)}
                    className="flex-1 flex items-start gap-3 p-3 bg-amber-950/20 border border-amber-900/50 rounded-xl cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <img
                      src={agressor.fotoUrl}
                      alt={agressor.nomeCompleto}
                      referrerPolicy="no-referrer"
                      className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg object-cover border border-amber-600 shrink-0"
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
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        Disp: {agressor.numeroTornozeleiraOuReceptor || 'Pendente'}
                      </div>
                    </div>
                  </div>

                  {/* Conector Central (Raio de Exclusão) */}
                  <div className="shrink-0 flex flex-col items-center justify-center py-1 lg:py-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                      <span>Raio: {agressor.raioExclusaoMetros || 500} metros</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono text-center">
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
                      className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg object-cover border border-purple-600 shrink-0"
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
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        Receptor: {vitima.numeroTornozeleiraOuReceptor || 'Ativo'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linha de Histórico de Entradas / Saídas dos Dois */}
                <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                  <div className="text-slate-400">
                    <span className="text-amber-400 font-semibold block mb-0.5">Última Movimentação Agressor:</span>
                    {agressor.movimentacoes.length > 0 ? (
                      <span className="text-[11px]">
                        {agressor.movimentacoes[agressor.movimentacoes.length - 1].tipo} em{' '}
                        {formatarDataHora(agressor.movimentacoes[agressor.movimentacoes.length - 1].dataHora)} (
                        {agressor.movimentacoes[agressor.movimentacoes.length - 1].motivo})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Sem movimentações</span>
                    )}
                  </div>
                  <div className="text-slate-400">
                    <span className="text-purple-300 font-semibold block mb-0.5">Última Movimentação Vítima:</span>
                    {vitima.movimentacoes.length > 0 ? (
                      <span className="text-[11px]">
                        {vitima.movimentacoes[vitima.movimentacoes.length - 1].tipo} em{' '}
                        {formatarDataHora(vitima.movimentacoes[vitima.movimentacoes.length - 1].dataHora)} (
                        {vitima.movimentacoes[vitima.movimentacoes.length - 1].motivo})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Sem movimentações</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 2: Todas as Vítimas e Agressores com Cards para Mobile & Tabela para Desktop */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Listagem de Registros: Vítimas & Agressores ({vitimas.length + agressores.length})
          </h3>

          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setFiltroTipo('TODOS')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filtroTipo === 'TODOS' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
                }`}
              >
                Todos ({vitimas.length + agressores.length})
              </button>
              <button
                onClick={() => setFiltroTipo('AGRESSORES')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filtroTipo === 'AGRESSORES' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400'
                }`}
              >
                Agressores ({agressores.length})
              </button>
              <button
                onClick={() => setFiltroTipo('VITIMAS')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filtroTipo === 'VITIMAS' ? 'bg-purple-950 text-purple-300 font-medium' : 'text-slate-400'
                }`}
              >
                Vítimas ({vitimas.length})
              </button>
            </div>

            {/* Alternador de visualização */}
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
        </div>

        {/* Cards Responsivos de Vítimas e Agressores para Mobile */}
        <div
          className={`${
            modoVisualizacao === 'tabela'
              ? 'hidden'
              : modoVisualizacao === 'cards'
              ? 'grid'
              : 'grid lg:hidden'
          } grid-cols-1 md:grid-cols-2 gap-3`}
        >
          {listaExibicao.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500">
              Nenhum registro encontrado para este filtro.
            </div>
          ) : (
            listaExibicao.map((item) => {
              const isVitima = item.perfil === 'VITIMA_PROTEGIDA';
              const idade = calcularIdade(item.dataNascimento);
              const faixa = obterFaixaEtaria(idade);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelecionarIndividuo(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isVitima
                      ? 'bg-purple-950/10 border-purple-900/40 hover:border-purple-600'
                      : 'bg-amber-950/10 border-amber-900/40 hover:border-amber-600'
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={item.fotoUrl}
                        alt={item.nomeCompleto}
                        referrerPolicy="no-referrer"
                        className={`w-14 h-16 rounded-xl object-cover border shrink-0 ${
                          isVitima ? 'border-purple-600' : 'border-amber-600'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            isVitima
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {isVitima ? 'VÍTIMA PROTEGIDA' : 'AGRESSOR'}
                        </span>

                        <h4 className="font-bold text-white text-sm mt-1 truncate">
                          {item.nomeCompleto}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          CPF: {item.cpf} · {idade} anos ({rotuloFaixaEtaria(faixa)})
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs space-y-1">
                      <div className="text-slate-300 line-clamp-1">
                        {isVitima ? 'Botão do Pânico Móvel' : item.tipoPenal}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                        <span>Proc: {item.numeroProcesso}</span>
                        <span>Disp: {item.numeroTornozeleiraOuReceptor || 'Ativo'}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelecionarIndividuo(item)}
                      className="py-1.5 px-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Dossiê</span>
                    </button>
                    <button
                      onClick={() => onEditarCadastro(item)}
                      className="py-1.5 px-1 text-[11px] font-semibold bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded border border-blue-800/60 flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onNovaMovimentacao(item.id)}
                      className="py-1.5 px-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 flex items-center justify-center gap-1"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      <span>E / S</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabela para Desktop */}
        <div
          className={`${
            modoVisualizacao === 'cards'
              ? 'hidden'
              : modoVisualizacao === 'tabela'
              ? 'block'
              : 'hidden lg:block'
          } overflow-x-auto`}
        >
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Pessoa / Foto</th>
                <th className="py-2.5 px-3">Papel</th>
                <th className="py-2.5 px-3">Idade / Faixa</th>
                <th className="py-2.5 px-3">Dispositivo / Raio</th>
                <th className="py-2.5 px-3">Processo Judicial</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {listaExibicao.map((item) => {
                const isVitima = item.perfil === 'VITIMA_PROTEGIDA';
                const idade = calcularIdade(item.dataNascimento);
                const faixa = obterFaixaEtaria(idade);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                    onClick={() => onSelecionarIndividuo(item)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.fotoUrl}
                          alt={item.nomeCompleto}
                          referrerPolicy="no-referrer"
                          className={`w-9 h-10 rounded object-cover border ${
                            isVitima ? 'border-purple-500' : 'border-amber-500'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-white">{item.nomeCompleto}</div>
                          <div className="text-[11px] text-slate-400 font-mono">CPF: {item.cpf}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isVitima
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {isVitima ? 'VÍTIMA' : 'AGRESSOR'}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      <span className="font-bold text-white">{idade} anos</span>
                      <div className="text-[10px] text-slate-400">{rotuloFaixaEtaria(faixa)}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div>{item.numeroTornozeleiraOuReceptor || 'Pendente'}</div>
                      {item.raioExclusaoMetros && (
                        <div className="text-[10px] text-amber-400">Raio: {item.raioExclusaoMetros}m</div>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-amber-300 font-semibold">{item.numeroProcesso}</div>
                      <div className="text-[10px] text-slate-400">{item.varaJudicial}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono text-emerald-400 font-bold">
                      {rotuloStatus(item.status)}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap no-print">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelecionarIndividuo(item)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                          title="Dossiê"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditarCadastro(item)}
                          className="p-1.5 bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded border border-blue-800/60"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNovaMovimentacao(item.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700"
                          title="Entrada / Saída"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

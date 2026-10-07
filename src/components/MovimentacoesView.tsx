import React, { useState } from 'react';
import { ArrowUpDown, ArrowDownRight, ArrowUpRight, Search, Printer, Download, Filter, FileText } from 'lucide-react';
import { IndividuoMonitorado, TipoMovimentacao, PerfilTipo } from '../types/monitoring';
import { formatarDataHora, rotuloPerfil } from '../utils/ageUtils';

interface MovimentacoesViewProps {
  individuos: IndividuoMonitorado[];
  onNovaMovimentacao: () => void;
  onSelecionarIndividuo: (ind: IndividuoMonitorado) => void;
}

export const MovimentacoesView: React.FC<MovimentacoesViewProps> = ({
  individuos,
  onNovaMovimentacao,
  onSelecionarIndividuo,
}) => {
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | TipoMovimentacao>('TODOS');
  const [perfilFiltro, setPerfilFiltro] = useState<'TODOS' | PerfilTipo>('TODOS');
  const [busca, setBusca] = useState('');

  // Compilar todas as movimentações de todos os indivíduos com dados do indivíduo
  const todasMovimentacoes = individuos.flatMap((ind) =>
    ind.movimentacoes.map((mov) => ({
      ...mov,
      individuo: ind,
    }))
  );

  // Ordenar por data mais recente
  todasMovimentacoes.sort(
    (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
  );

  // Aplicar filtros
  const filtradas = todasMovimentacoes.filter((item) => {
    if (tipoFiltro !== 'TODOS' && item.tipo !== tipoFiltro) return false;
    if (perfilFiltro !== 'TODOS' && item.individuo.perfil !== perfilFiltro) return false;
    if (busca) {
      const termo = busca.toLowerCase();
      const matchNome = item.individuo.nomeCompleto.toLowerCase().includes(termo);
      const matchCpf = item.individuo.cpf.includes(termo);
      const matchProc = item.individuo.numeroProcesso.includes(termo);
      const matchMotivo = item.motivoDetalhado.toLowerCase().includes(termo);
      if (!matchNome && !matchCpf && !matchProc && !matchMotivo) return false;
    }
    return true;
  });

  const totalEntradas = todasMovimentacoes.filter((m) => m.tipo === 'ENTRADA').length;
  const totalSaidas = todasMovimentacoes.filter((m) => m.tipo === 'SAIDA').length;

  const handleExportCSV = () => {
    const headers = [
      'Tipo',
      'DataHora',
      'NomeCompleto',
      'CPF',
      'Perfil',
      'ProcessoJudicial',
      'Motivo',
      'MotivoDetalhado',
      'ResponsavelOperacional',
      'NumeroDocumento',
    ];

    const rows = filtradas.map((m) => [
      m.tipo,
      m.dataHora,
      `"${m.individuo.nomeCompleto}"`,
      m.individuo.cpf,
      m.individuo.perfil,
      m.individuo.numeroProcesso,
      m.motivo,
      `"${m.motivoDetalhado.replace(/"/g, '""')}"`,
      `"${m.responsavelOperacional}"`,
      m.numeroOficioOuMandado || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `livro-movimentacoes-cmep-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-amber-400" />
            Livro Eletrônico de Entradas & Saídas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro cronológico oficial de ativações, instalações, acolhimentos, revogações e desligamentos
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Livro</span>
          </button>
          <button
            onClick={onNovaMovimentacao}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* Contadores e Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 no-print">
        {/* Barra de Busca */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF, número do processo ou motivo..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filtro Tipo: Todas, Entradas, Saídas */}
        <div className="md:col-span-4 flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTipoFiltro('TODOS')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tipoFiltro === 'TODOS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({todasMovimentacoes.length})
          </button>
          <button
            onClick={() => setTipoFiltro('ENTRADA')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
              tipoFiltro === 'ENTRADA' ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Entradas ({totalEntradas})</span>
          </button>
          <button
            onClick={() => setTipoFiltro('SAIDA')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
              tipoFiltro === 'SAIDA' ? 'bg-orange-950 text-orange-200 border border-orange-800/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
            <span>Saídas ({totalSaidas})</span>
          </button>
        </div>

        {/* Filtro Perfil */}
        <div className="md:col-span-3">
          <select
            value={perfilFiltro}
            onChange={(e) => setPerfilFiltro(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="TODOS">Todos os Perfis</option>
            <option value="MONITORADO_GERAL">Monitorados Gerais</option>
            <option value="AGRESSOR">Agressores (M. Penha)</option>
            <option value="VITIMA_PROTEGIDA">Vítimas Protegidas</option>
          </select>
        </div>
      </div>

      {/* Tabela do Livro Oficial */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Pessoa / Perfil</th>
                <th className="py-3 px-4 font-semibold">Processo Judicial</th>
                <th className="py-3 px-4 font-semibold">Motivo Legal</th>
                <th className="py-3 px-4 font-semibold">Responsável / Doc.</th>
                <th className="py-3 px-4 font-semibold text-right no-print">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum registro de movimentação encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtradas.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => onSelecionarIndividuo(m.individuo)}
                  >
                    {/* Tipo Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {m.tipo === 'ENTRADA' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          ENTRADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-950 text-orange-300 border border-orange-800">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          SAÍDA
                        </span>
                      )}
                    </td>

                    {/* Data e Hora */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                      {formatarDataHora(m.dataHora)}
                    </td>

                    {/* Pessoa */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.individuo.fotoUrl}
                          alt={m.individuo.nomeCompleto}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-white">{m.individuo.nomeCompleto}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="font-mono">{m.individuo.cpf}</span>
                            <span>·</span>
                            <span className="text-amber-400">{rotuloPerfil(m.individuo.perfil)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Processo Judicial */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-amber-300">{m.individuo.numeroProcesso}</div>
                      <div className="text-[11px] text-slate-400">{m.individuo.varaJudicial}</div>
                    </td>

                    {/* Motivo */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-200">{m.motivo}</div>
                      <div className="text-[11px] text-slate-400 truncate" title={m.motivoDetalhado}>
                        {m.motivoDetalhado}
                      </div>
                    </td>

                    {/* Responsável e Documento */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-300">{m.responsavelOperacional}</div>
                      {m.numeroOficioOuMandado && (
                        <div className="text-[11px] text-slate-500 font-mono">Doc: {m.numeroOficioOuMandado}</div>
                      )}
                    </td>

                    {/* Ação */}
                    <td className="py-3 px-4 text-right whitespace-nowrap no-print">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelecionarIndividuo(m.individuo);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                      >
                        Ver Dossiê
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

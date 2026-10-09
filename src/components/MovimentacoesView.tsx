import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Printer,
  Download,
  Filter,
  FileText,
  Edit3,
  Eye,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';
import { IndividuoMonitorado, TipoMovimentacao, PerfilTipo, MovimentacaoRegistro } from '../types/monitoring';
import { formatarDataHora, rotuloPerfil } from '../utils/ageUtils';

interface MovimentacoesViewProps {
  individuos: IndividuoMonitorado[];
  onNovaMovimentacao: () => void;
  onSelecionarIndividuo: (ind: IndividuoMonitorado) => void;
  onEditarMovimentacao: (individuoId: string, mov: MovimentacaoRegistro) => void;
  onExportarPDF?: () => void;
}

export const MovimentacoesView: React.FC<MovimentacoesViewProps> = ({
  individuos,
  onNovaMovimentacao,
  onSelecionarIndividuo,
  onEditarMovimentacao,
  onExportarPDF,
}) => {
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | TipoMovimentacao>('TODOS');
  const [perfilFiltro, setPerfilFiltro] = useState<'TODOS' | PerfilTipo>('TODOS');
  const [busca, setBusca] = useState('');
  const [modoVisualizacao, setModoVisualizacao] = useState<'auto' | 'cards' | 'tabela'>('auto');

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

  const temFiltroAtivo = busca.trim() !== '' || tipoFiltro !== 'TODOS' || perfilFiltro !== 'TODOS';

  const limparFiltros = () => {
    setBusca('');
    setTipoFiltro('TODOS');
    setPerfilFiltro('TODOS');
  };

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
    link.setAttribute('download', `livro-movimentacoes-dme-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>Livro Eletrônico de Entradas & Saídas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro cronológico oficial de ativações, instalações, acolhimentos, revogações e desligamentos
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 no-print flex-wrap">
          {onExportarPDF && (
            <button
              onClick={onExportarPDF}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Gerar PDF Oficial do Livro de Movimentações"
            >
              <FileText className="w-3.5 h-3.5 text-blue-300" />
              <span>Exportar PDF</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="hidden sm:flex px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={onNovaMovimentacao}
            className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* Contadores e Filtros Responsivos */}
      <div className="space-y-3 no-print bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Barra de Busca */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, número do processo ou motivo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filtro Tipo: Todas, Entradas, Saídas */}
          <div className="md:col-span-4 flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
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
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos os Perfis</option>
              <option value="MONITORADO_GERAL">Monitorados Gerais</option>
              <option value="AGRESSOR">Agressores (M. Penha)</option>
              <option value="VITIMA_PROTEGIDA">Vítimas Protegidas</option>
            </select>
          </div>
        </div>

        {/* Linha de Status dos Filtros e Alternador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            <span>
              Exibindo <span className="font-bold text-white font-mono">{filtradas.length}</span> registros no livro
            </span>
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setModoVisualizacao('cards')}
                title="Visualização em Cards"
                className={`p-1.5 rounded transition-colors ${
                  modoVisualizacao === 'cards' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setModoVisualizacao('tabela')}
                title="Visualização em Tabela"
                className={`p-1.5 rounded transition-colors ${
                  modoVisualizacao === 'tabela' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Movimentação para Mobile (< lg) ou Modo Cards */}
      <div
        className={`${
          modoVisualizacao === 'tabela'
            ? 'hidden'
            : modoVisualizacao === 'cards'
            ? 'grid'
            : 'grid lg:hidden'
        } grid-cols-1 md:grid-cols-2 gap-3.5`}
      >
        {filtradas.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-2xl">
            Nenhum registro de movimentação encontrado com os filtros aplicados.
          </div>
        ) : (
          filtradas.map((m) => {
            const isEntrada = m.tipo === 'ENTRADA';
            return (
              <div
                key={m.id}
                onClick={() => onSelecionarIndividuo(m.individuo)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isEntrada
                    ? 'bg-slate-900/90 border-cyan-900/40 hover:border-cyan-600/70'
                    : 'bg-slate-900/90 border-orange-900/40 hover:border-orange-600/70'
                }`}
              >
                <div>
                  {/* Topo: Tipo Badge e Data/Hora */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {isEntrada ? (
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

                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {formatarDataHora(m.dataHora)}
                    </span>
                  </div>

                  {/* Informações da Pessoa */}
                  <div className="flex items-center gap-3">
                    <img
                      src={m.individuo.fotoUrl}
                      alt={m.individuo.nomeCompleto}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-sm truncate">
                        {m.individuo.nomeCompleto}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>CPF: {m.individuo.cpf}</span>
                        <span>·</span>
                        <span className="text-amber-400">{rotuloPerfil(m.individuo.perfil)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                        Proc: {m.individuo.numeroProcesso}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Motivo Legal */}
                  <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Motivo Legal:</span>
                      <span className="font-semibold text-slate-200 text-right">{m.motivo}</span>
                    </div>
                    {m.motivoDetalhado && (
                      <p className="text-[11px] text-slate-300 line-clamp-2" title={m.motivoDetalhado}>
                        {m.motivoDetalhado}
                      </p>
                    )}
                    <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Resp: {m.responsavelOperacional}</span>
                      {m.numeroOficioOuMandado && (
                        <span className="font-mono text-amber-300/80">Doc: {m.numeroOficioOuMandado}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div
                  className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEditarMovimentacao(m.individuo.id, m)}
                    className="py-2 px-2 text-xs font-semibold bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded-lg border border-blue-800/60 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Registro</span>
                  </button>

                  <button
                    onClick={() => onSelecionarIndividuo(m.individuo)}
                    className="py-2 px-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Dossiê</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabela do Livro Oficial para Desktop */}
      <div
        className={`${
          modoVisualizacao === 'cards'
            ? 'hidden'
            : modoVisualizacao === 'tabela'
            ? 'block'
            : 'hidden lg:block'
        } bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
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
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditarMovimentacao(m.individuo.id, m)}
                          title="Editar este registro de entrada ou saída"
                          className="px-2.5 py-1 text-[11px] font-semibold bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded border border-blue-800/60 transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => onSelecionarIndividuo(m.individuo)}
                          className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                        >
                          Dossiê
                        </button>
                      </div>
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

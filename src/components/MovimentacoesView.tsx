import React, { useState, useMemo } from 'react';
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
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';
import { IndividuoMonitorado, TipoMovimentacao, PerfilTipo, MovimentacaoRegistro } from '../types/monitoring';
import { formatarDataHora, rotuloPerfil } from '../utils/ageUtils';

interface MovimentacoesViewProps {
  individuos: IndividuoMonitorado[];
  onNovaMovimentacao: () => void;
  onSelecionarIndividuo: (ind: IndividuoMonitorado) => void;
  onEditarMovimentacao: (individuoId: string, mov: MovimentacaoRegistro) => void;
  onExportarPDF?: (movimentacoesFiltradas?: any[], infoFiltros?: string) => void;
}

const NOMES_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MovimentacoesView: React.FC<MovimentacoesViewProps> = ({
  individuos,
  onNovaMovimentacao,
  onSelecionarIndividuo,
  onEditarMovimentacao,
  onExportarPDF,
}) => {
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | TipoMovimentacao>('TODOS');
  const [perfilFiltro, setPerfilFiltro] = useState<'TODOS' | PerfilTipo>('TODOS');
  const [mesAnoFiltro, setMesAnoFiltro] = useState<string>('TODOS'); // 'TODOS' ou 'YYYY-MM'
  const [busca, setBusca] = useState('');
  const [modoVisualizacao, setModoVisualizacao] = useState<'auto' | 'cards' | 'tabela'>('auto');

  // Compilar todas as movimentações de todos os indivíduos com dados do indivíduo
  const todasMovimentacoes = useMemo(() => {
    const lista = individuos.flatMap((ind) =>
      ind.movimentacoes.map((mov) => ({
        ...mov,
        individuo: ind,
      }))
    );
    // Ordenar por data mais recente
    lista.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
    return lista;
  }, [individuos]);

  // Compilar lista de meses distintos presentes nas movimentações com contagens
  const mesesDisponiveis = useMemo(() => {
    const mapa = new Map<
      string,
      { chave: string; rotulo: string; ano: number; mes: number; total: number; entradas: number; saidas: number }
    >();

    todasMovimentacoes.forEach((item) => {
      try {
        const d = new Date(item.dataHora);
        if (isNaN(d.getTime())) return;
        const ano = d.getFullYear();
        const mesIdx = d.getMonth();
        const mesStr = String(mesIdx + 1).padStart(2, '0');
        const chave = `${ano}-${mesStr}`;

        const registro = mapa.get(chave) || {
          chave,
          rotulo: `${NOMES_MESES[mesIdx]} de ${ano}`,
          ano,
          mes: mesIdx + 1,
          total: 0,
          entradas: 0,
          saidas: 0,
        };

        registro.total += 1;
        if (item.tipo === 'ENTRADA') registro.entradas += 1;
        if (item.tipo === 'SAIDA') registro.saidas += 1;
        mapa.set(chave, registro);
      } catch {
        // Ignorar datas inválidas
      }
    });

    return Array.from(mapa.values()).sort((a, b) => b.chave.localeCompare(a.chave));
  }, [todasMovimentacoes]);

  // Formatar rótulo de um mês selecionado (ex: "2024-02" -> "Fevereiro de 2024")
  const obterRotuloMes = (chave: string) => {
    if (chave === 'TODOS') return 'Todos os Meses';
    const partes = chave.split('-');
    if (partes.length === 2) {
      const ano = partes[0];
      const mesNum = parseInt(partes[1], 10) - 1;
      const nomeMes = NOMES_MESES[mesNum] || partes[1];
      return `${nomeMes} de ${ano}`;
    }
    return chave;
  };

  // Mês corrente chave
  const mesAtualChave = useMemo(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Navegar mês anterior / próximo mês
  const navegarMes = (delta: -1 | 1) => {
    if (mesAnoFiltro === 'TODOS') {
      if (mesesDisponiveis.length > 0) {
        setMesAnoFiltro(mesesDisponiveis[0].chave);
      } else {
        setMesAnoFiltro(mesAtualChave);
      }
      return;
    }
    const [anoStr, mesStr] = mesAnoFiltro.split('-');
    let ano = parseInt(anoStr, 10);
    let mes = parseInt(mesStr, 10);

    mes += delta;
    if (mes < 1) {
      mes = 12;
      ano -= 1;
    } else if (mes > 12) {
      mes = 1;
      ano += 1;
    }
    const novaChave = `${ano}-${String(mes).padStart(2, '0')}`;
    setMesAnoFiltro(novaChave);
  };

  // Aplicar filtros
  const filtradas = useMemo(() => {
    return todasMovimentacoes.filter((item) => {
      if (tipoFiltro !== 'TODOS' && item.tipo !== tipoFiltro) return false;
      if (perfilFiltro !== 'TODOS' && item.individuo.perfil !== perfilFiltro) return false;

      // Filtro por Mês (YYYY-MM)
      if (mesAnoFiltro !== 'TODOS') {
        try {
          const d = new Date(item.dataHora);
          if (!isNaN(d.getTime())) {
            const chaveItem = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (chaveItem !== mesAnoFiltro) return false;
          } else {
            if (!item.dataHora.startsWith(mesAnoFiltro)) return false;
          }
        } catch {
          if (!item.dataHora.startsWith(mesAnoFiltro)) return false;
        }
      }

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
  }, [todasMovimentacoes, tipoFiltro, perfilFiltro, mesAnoFiltro, busca]);

  const totalEntradasGeral = todasMovimentacoes.filter((m) => m.tipo === 'ENTRADA').length;
  const totalSaidasGeral = todasMovimentacoes.filter((m) => m.tipo === 'SAIDA').length;

  const totalEntradasFiltradas = filtradas.filter((m) => m.tipo === 'ENTRADA').length;
  const totalSaidasFiltradas = filtradas.filter((m) => m.tipo === 'SAIDA').length;
  const saldoLiquidoFiltrado = totalEntradasFiltradas - totalSaidasFiltradas;

  const temFiltroAtivo =
    busca.trim() !== '' ||
    tipoFiltro !== 'TODOS' ||
    perfilFiltro !== 'TODOS' ||
    mesAnoFiltro !== 'TODOS';

  const limparFiltros = () => {
    setBusca('');
    setTipoFiltro('TODOS');
    setPerfilFiltro('TODOS');
    setMesAnoFiltro('TODOS');
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
    const sulfixoMes = mesAnoFiltro !== 'TODOS' ? `-${mesAnoFiltro}` : '';
    link.setAttribute('download', `livro-movimentacoes-dme${sulfixoMes}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!onExportarPDF) return;
    const filtroLabel =
      mesAnoFiltro !== 'TODOS'
        ? `Mês de Referência: ${obterRotuloMes(mesAnoFiltro)} (${filtradas.length} registros)`
        : `Todos os Períodos (${filtradas.length} registros)`;
    onExportarPDF(filtradas, filtroLabel);
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
              onClick={handleExportPDF}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Gerar PDF Oficial do Livro de Movimentações Filtradas"
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
              <span>Entradas ({totalEntradasGeral})</span>
            </button>
            <button
              onClick={() => setTipoFiltro('SAIDA')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
                tipoFiltro === 'SAIDA' ? 'bg-orange-950 text-orange-200 border border-orange-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
              <span>Saídas ({totalSaidasGeral})</span>
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

        {/* Linha Dedicada: Filtro de Entradas & Saídas por Mês */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 sm:p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Lado Esquerdo: Controles de Seleção do Mês */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Filtrar por Mês:</span>
            </div>

            {/* Menu Dropdown de Meses com Movimentações Registradas */}
            <select
              value={mesAnoFiltro}
              onChange={(e) => setMesAnoFiltro(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400 font-medium"
            >
              <option value="TODOS">Todos os Meses (Visão Geral)</option>
              {mesesDisponiveis.map((m) => (
                <option key={m.chave} value={m.chave}>
                  {m.rotulo} ({m.total} reg: {m.entradas}E / {m.saidas}S)
                </option>
              ))}
            </select>

            {/* Input Nativo HTML5 Mês (Permite escolher qualquer mês e ano livremente) */}
            <div className="relative flex items-center">
              <input
                type="month"
                value={mesAnoFiltro === 'TODOS' ? '' : mesAnoFiltro}
                onChange={(e) => setMesAnoFiltro(e.target.value || 'TODOS')}
                title="Selecionar Mês/Ano Específico no Calendário"
                className="bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Botões de Navegação Rápida entre Meses */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navegarMes(-1)}
                title="Mês Anterior"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navegarMes(1)}
                title="Próximo Mês"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Atalhos Rápidos */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMesAnoFiltro(mesAtualChave)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors border ${
                  mesAnoFiltro === mesAtualChave
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                Mês Atual
              </button>
              {mesAnoFiltro !== 'TODOS' && (
                <button
                  type="button"
                  onClick={() => setMesAnoFiltro('TODOS')}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                >
                  Ver Todos
                </button>
              )}
            </div>
          </div>

          {/* Lado Direito: KPIs e Saldo do Mês Selecionado */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {mesAnoFiltro !== 'TODOS' ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                <span className="text-slate-400">
                  <span className="font-bold text-amber-300">{obterRotuloMes(mesAnoFiltro)}</span>:
                </span>
                <span className="inline-flex items-center gap-1 text-cyan-300 font-bold font-mono">
                  <ArrowDownRight className="w-3 h-3 text-cyan-400" />
                  {totalEntradasFiltradas} ent.
                </span>
                <span className="text-slate-600">|</span>
                <span className="inline-flex items-center gap-1 text-orange-300 font-bold font-mono">
                  <ArrowUpRight className="w-3 h-3 text-orange-400" />
                  {totalSaidasFiltradas} saíd.
                </span>
                <span className="text-slate-600">|</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold font-mono ${
                    saldoLiquidoFiltrado >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                  title="Saldo Líquido (Entradas - Saídas)"
                >
                  {saldoLiquidoFiltrado >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  Saldo: {saldoLiquidoFiltrado > 0 ? `+${saldoLiquidoFiltrado}` : saldoLiquidoFiltrado}
                </span>
                <button
                  onClick={() => setMesAnoFiltro('TODOS')}
                  title="Remover filtro de mês"
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                Exibindo todo o período histórico ({todasMovimentacoes.length} movimentações no total)
              </span>
            )}
          </div>
        </div>

        {/* Linha de Status dos Filtros e Alternador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            <span>
              Exibindo <span className="font-bold text-white font-mono">{filtradas.length}</span> de{' '}
              <span className="font-mono text-slate-400">{todasMovimentacoes.length}</span> registros no livro
            </span>
            {mesAnoFiltro !== 'TODOS' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md text-[11px] font-medium">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>{obterRotuloMes(mesAnoFiltro)}</span>
                <button
                  onClick={() => setMesAnoFiltro('TODOS')}
                  className="hover:text-white ml-0.5"
                  title="Remover filtro de mês"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {tipoFiltro !== 'TODOS' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-md text-[11px] font-medium">
                <span>{tipoFiltro === 'ENTRADA' ? 'Apenas Entradas' : 'Apenas Saídas'}</span>
                <button
                  onClick={() => setTipoFiltro('TODOS')}
                  className="hover:text-white ml-0.5"
                  title="Remover filtro de tipo"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {perfilFiltro !== 'TODOS' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-[11px] font-medium">
                <span>{rotuloPerfil(perfilFiltro)}</span>
                <button
                  onClick={() => setPerfilFiltro('TODOS')}
                  className="hover:text-white ml-0.5"
                  title="Remover filtro de perfil"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold ml-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar todos os filtros</span>
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

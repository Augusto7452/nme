import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  User,
  Download,
  PlusCircle,
  Radio,
  Eye,
  Edit3,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';
import { IndividuoMonitorado, PerfilTipo, StatusMonitoramento, FaixaEtaria } from '../types/monitoring';
import {
  calcularIdade,
  obterFaixaEtaria,
  rotuloFaixaEtaria,
  rotuloPerfil,
  rotuloStatus,
  formatarData,
  formatarDataHora,
} from '../utils/ageUtils';

interface MonitoradosListViewProps {
  individuos: IndividuoMonitorado[];
  onSelecionarIndividuo: (ind: IndividuoMonitorado) => void;
  onEditarCadastro: (ind: IndividuoMonitorado) => void;
  onRegistrarMovimentacao: (individuoId: string) => void;
  onRegistrarFuga: (individuoId: string) => void;
  onVerAlertaFuga: (ind: IndividuoMonitorado) => void;
  onNovoCadastro: () => void;
}

export const MonitoradosListView: React.FC<MonitoradosListViewProps> = ({
  individuos,
  onSelecionarIndividuo,
  onEditarCadastro,
  onRegistrarMovimentacao,
  onRegistrarFuga,
  onVerAlertaFuga,
  onNovoCadastro,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<'TODOS' | PerfilTipo>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | StatusMonitoramento>('TODOS');
  const [filtroFaixa, setFiltroFaixa] = useState<'TODOS' | FaixaEtaria>('TODOS');
  // Modo de exibição: 'auto' usa Cards no mobile e Tabela no desktop, ou usuário pode alternar
  const [modoVisualizacao, setModoVisualizacao] = useState<'auto' | 'cards' | 'tabela'>('auto');

  // Filtragem
  const filtrados = individuos.filter((ind) => {
    if (filtroPerfil !== 'TODOS' && ind.perfil !== filtroPerfil) return false;
    if (filtroStatus !== 'TODOS' && ind.status !== filtroStatus) return false;
    if (filtroFaixa !== 'TODOS') {
      const idade = calcularIdade(ind.dataNascimento);
      if (obterFaixaEtaria(idade) !== filtroFaixa) return false;
    }
    if (busca) {
      const termo = busca.toLowerCase();
      const matchNome = ind.nomeCompleto.toLowerCase().includes(termo);
      const matchCpf = ind.cpf.includes(termo);
      const matchProc = ind.numeroProcesso.includes(termo);
      const matchPenal = ind.tipoPenal.toLowerCase().includes(termo);
      const matchDisp = ind.numeroTornozeleiraOuReceptor?.toLowerCase().includes(termo);
      if (!matchNome && !matchCpf && !matchProc && !matchPenal && !matchDisp) return false;
    }
    return true;
  });

  const temFiltroAtivo =
    busca.trim() !== '' ||
    filtroPerfil !== 'TODOS' ||
    filtroStatus !== 'TODOS' ||
    filtroFaixa !== 'TODOS';

  const limparFiltros = () => {
    setBusca('');
    setFiltroPerfil('TODOS');
    setFiltroStatus('TODOS');
    setFiltroFaixa('TODOS');
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'NomeCompleto',
      'CPF',
      'DataNascimento',
      'Idade',
      'FaixaEtaria',
      'Perfil',
      'Status',
      'ProcessoJudicial',
      'VaraJudicial',
      'Comarca',
      'TipoPenal',
      'TornozeleiraOuReceptor',
      'DataPrimeiraEntrada',
      'FugasRegistradas',
    ];

    const rows = filtrados.map((i) => {
      const idade = calcularIdade(i.dataNascimento);
      const faixa = rotuloFaixaEtaria(obterFaixaEtaria(idade));
      return [
        i.id,
        `"${i.nomeCompleto}"`,
        i.cpf,
        i.dataNascimento,
        idade,
        `"${faixa}"`,
        i.perfil,
        i.status,
        i.numeroProcesso,
        `"${i.varaJudicial}"`,
        `"${i.comarca}"`,
        `"${i.tipoPenal.replace(/"/g, '""')}"`,
        i.numeroTornozeleiraOuReceptor || '',
        i.dataPrimeiraEntrada,
        i.fugas.length,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `base-monitorados-dme-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca Responsiva */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Busca por texto */}
          <div className="sm:col-span-2 lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, tipo penal, processo ou tornozeleira..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filtro Perfil */}
          <div className="sm:col-span-1 lg:col-span-3">
            <select
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos os Perfis</option>
              <option value="MONITORADO_GERAL">Monitorados Gerais</option>
              <option value="AGRESSOR">Agressores (M. Penha)</option>
              <option value="VITIMA_PROTEGIDA">Vítimas Protegidas</option>
            </select>
          </div>

          {/* Filtro Status */}
          <div className="sm:col-span-1 lg:col-span-2">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Ativos</option>
              <option value="FORAGIDO">Foragidos / Evasão</option>
              <option value="DESLIGADO">Desligados</option>
            </select>
          </div>

          {/* Filtro Faixa Etária */}
          <div className="sm:col-span-2 lg:col-span-2">
            <select
              value={filtroFaixa}
              onChange={(e) => setFiltroFaixa(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todas as Faixas</option>
              <option value="18_24">18 a 24 anos</option>
              <option value="25_34">25 a 34 anos</option>
              <option value="35_49">35 a 49 anos</option>
              <option value="50_64">50 a 64 anos</option>
              <option value="65_MAIS">65 anos ou mais</option>
            </select>
          </div>
        </div>

        {/* Linha de contagem, alternador de visualização e ações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            <span>
              Exibindo <span className="font-bold text-white font-mono">{filtrados.length}</span> de{' '}
              <span className="font-mono">{individuos.length}</span> registros
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

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Alternador de exibição (Cards vs Tabela) */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setModoVisualizacao('cards')}
                title="Visualização em Cards"
                className={`p-1.5 rounded transition-colors ${
                  modoVisualizacao === 'cards' || (modoVisualizacao === 'auto' && 'sm:text-slate-400')
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setModoVisualizacao('tabela')}
                title="Visualização em Tabela"
                className={`p-1.5 rounded transition-colors ${
                  modoVisualizacao === 'tabela'
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={onNovoCadastro}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Cadastro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exibição em Cards Responsivos para Telas Pequenas ou Modo Cards */}
      <div
        className={`${
          modoVisualizacao === 'tabela'
            ? 'hidden'
            : modoVisualizacao === 'cards'
            ? 'grid'
            : 'grid lg:hidden'
        } grid-cols-1 md:grid-cols-2 gap-3.5`}
      >
        {filtrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-2xl">
            Nenhum indivíduo localizado com os parâmetros de pesquisa informados.
          </div>
        ) : (
          filtrados.map((ind) => {
            const idade = calcularIdade(ind.dataNascimento);
            const faixa = obterFaixaEtaria(idade);
            const isForagido = ind.status === 'FORAGIDO';

            return (
              <div
                key={ind.id}
                onClick={() => onSelecionarIndividuo(ind)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isForagido
                    ? 'bg-slate-900/90 border-red-800/80 shadow-md shadow-red-950/20 hover:border-red-600'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Topo do Card: Foto, Nome, CPF, Badges */}
                <div>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={ind.fotoUrl}
                        alt={ind.nomeCompleto}
                        referrerPolicy="no-referrer"
                        className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover border ${
                          isForagido ? 'border-red-500 ring-2 ring-red-500/40' : 'border-slate-700'
                        }`}
                      />
                      {isForagido && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ind.perfil === 'VITIMA_PROTEGIDA'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : ind.perfil === 'AGRESSOR'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {rotuloPerfil(ind.perfil)}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                            isForagido
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : ind.status === 'ATIVO'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rotuloStatus(ind.status)}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm mt-1 truncate">
                        {ind.nomeCompleto}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>CPF: {ind.cpf}</span>
                        <span>·</span>
                        <span className="text-amber-400 font-semibold">{idade} anos ({rotuloFaixaEtaria(faixa)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Processuais & Crime */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tipo Penal:</span>
                      <div className="text-slate-200 font-medium line-clamp-1" title={ind.tipoPenal}>
                        {ind.tipoPenal}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Processo:</span>
                        <span className="font-mono font-semibold text-amber-300 truncate block">
                          {ind.numeroProcesso}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Dispositivo:</span>
                        <span className="font-mono text-slate-300 truncate block">
                          {ind.numeroTornozeleiraOuReceptor || 'Sem disp.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação com Área de Toque Otimizada para Mobile */}
                <div
                  className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onSelecionarIndividuo(ind)}
                    title="Ver Dossiê Completo"
                    className="py-2 px-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossiê</span>
                  </button>

                  <button
                    onClick={() => onEditarCadastro(ind)}
                    title="Editar Cadastro"
                    className="py-2 px-1 text-[11px] font-semibold bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded-lg border border-blue-800/60 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => onRegistrarMovimentacao(ind.id)}
                    title="Registrar Entrada ou Saída"
                    className="py-2 px-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>E/S</span>
                  </button>

                  {isForagido ? (
                    <button
                      onClick={() => onVerAlertaFuga(ind)}
                      title="Ver Alerta de Fuga"
                      className="py-2 px-1 text-[11px] font-bold bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Alerta</span>
                    </button>
                  ) : ind.perfil !== 'VITIMA_PROTEGIDA' ? (
                    <button
                      onClick={() => onRegistrarFuga(ind.id)}
                      title="Registrar Fuga"
                      className="py-2 px-1 text-[11px] font-semibold bg-red-950/70 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/60 flex items-center justify-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Fuga</span>
                    </button>
                  ) : (
                    <div className="py-2 px-1 text-[10px] text-center text-purple-400 font-mono">
                      Vítima
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Exibição em Tabela para Desktop (ou quando modo = tabela) */}
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
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Monitorado / Foto</th>
                <th className="py-3 px-4 font-semibold">Idade / Faixa</th>
                <th className="py-3 px-4 font-semibold">Perfil</th>
                <th className="py-3 px-4 font-semibold">Tipo Penal Respondendo</th>
                <th className="py-3 px-4 font-semibold">Processo Judicial</th>
                <th className="py-3 px-4 font-semibold">Equipamento</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right no-print">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Nenhum indivíduo localizado com os parâmetros de pesquisa informados.
                  </td>
                </tr>
              ) : (
                filtrados.map((ind) => {
                  const idade = calcularIdade(ind.dataNascimento);
                  const faixa = obterFaixaEtaria(idade);
                  const isForagido = ind.status === 'FORAGIDO';

                  return (
                    <tr
                      key={ind.id}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isForagido ? 'bg-red-950/10' : ''
                      }`}
                      onClick={() => onSelecionarIndividuo(ind)}
                    >
                      {/* Foto e Nome */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={ind.fotoUrl}
                              alt={ind.nomeCompleto}
                              referrerPolicy="no-referrer"
                              className={`w-10 h-12 rounded-lg object-cover border ${
                                isForagido ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700'
                              }`}
                            />
                            {isForagido && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{ind.nomeCompleto}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                              <span>CPF: {ind.cpf}</span>
                              {ind.cidade && <span>· {ind.cidade}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Idade e Faixa Etária Calculada */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white font-mono">{idade} anos</div>
                        <div className="text-[11px] text-amber-400/90">{rotuloFaixaEtaria(faixa)}</div>
                      </td>

                      {/* Perfil */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            ind.perfil === 'VITIMA_PROTEGIDA'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : ind.perfil === 'AGRESSOR'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {rotuloPerfil(ind.perfil)}
                        </span>
                      </td>

                      {/* Tipo Penal */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-200 font-medium truncate" title={ind.tipoPenal}>
                          {ind.tipoPenal}
                        </div>
                        {ind.resumoTipificacao && (
                          <div className="text-[11px] text-slate-400 truncate" title={ind.resumoTipificacao}>
                            {ind.resumoTipificacao}
                          </div>
                        )}
                      </td>

                      {/* Processo Judicial */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-amber-300">{ind.numeroProcesso}</div>
                        <div className="text-[11px] text-slate-400">{ind.varaJudicial}</div>
                      </td>

                      {/* Equipamento */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                        <div>{ind.numeroTornozeleiraOuReceptor || 'Pendente'}</div>
                        {ind.raioExclusaoMetros && (
                          <div className="text-[10px] text-amber-400">Raio: {ind.raioExclusaoMetros}m</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                            isForagido
                              ? 'text-red-400'
                              : ind.status === 'ATIVO'
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isForagido && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />}
                          {rotuloStatus(ind.status)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap no-print">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelecionarIndividuo(ind)}
                            title="Ver Dossiê Completo"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditarCadastro(ind)}
                            title="Editar Cadastro"
                            className="p-1.5 bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded-lg border border-blue-800/60 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRegistrarMovimentacao(ind.id)}
                            title="Registrar Entrada ou Saída"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          {isForagido ? (
                            <button
                              onClick={() => onVerAlertaFuga(ind)}
                              title="Ver Alerta de Fuga / Mandado"
                              className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Alerta Fuga
                            </button>
                          ) : (
                            ind.perfil !== 'VITIMA_PROTEGIDA' && (
                              <button
                                onClick={() => onRegistrarFuga(ind.id)}
                                title="Registrar Ocorrência de Fuga"
                                className="p-1.5 bg-red-950/70 hover:bg-red-900 text-red-400 rounded-lg border border-red-800/60 transition-colors"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

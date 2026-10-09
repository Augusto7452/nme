import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Printer,
  Search,
  PlusCircle,
  ShieldAlert,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { IndividuoMonitorado, RegistroFuga } from '../types/monitoring';
import {
  formatarDataHora,
  calcularIdade,
  obterFaixaEtaria,
  rotuloFaixaEtaria,
} from '../utils/ageUtils';

interface FugasViewProps {
  individuos: IndividuoMonitorado[];
  onNovaFuga: () => void;
  onVerAlertaFuga: (individuo: IndividuoMonitorado, fuga: RegistroFuga) => void;
  onMarcarRecapturado: (individuoId: string, fugaId: string) => void;
  onExportarPDF?: () => void;
}

export const FugasView: React.FC<FugasViewProps> = ({
  individuos,
  onNovaFuga,
  onVerAlertaFuga,
  onMarcarRecapturado,
  onExportarPDF,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'FORAGIDO' | 'RECAPTURADO'>('FORAGIDO');

  // Compilar todas as fugas
  const todasFugas = individuos.flatMap((ind) =>
    ind.fugas.map((fuga) => ({
      fuga,
      individuo: ind,
    }))
  );

  todasFugas.sort(
    (a, b) => new Date(b.fuga.dataHoraFuga).getTime() - new Date(a.fuga.dataHoraFuga).getTime()
  );

  const filtradas = todasFugas.filter((item) => {
    if (filtroStatus !== 'TODOS' && item.fuga.statusFuga !== filtroStatus) return false;
    if (busca) {
      const termo = busca.toLowerCase();
      const matchNome = item.individuo.nomeCompleto.toLowerCase().includes(termo);
      const matchCpf = item.individuo.cpf.includes(termo);
      const matchLocal = item.fuga.localFuga.toLowerCase().includes(termo);
      const matchProc = item.individuo.numeroProcesso.includes(termo);
      if (!matchNome && !matchCpf && !matchLocal && !matchProc) return false;
    }
    return true;
  });

  const foragidosAtivos = todasFugas.filter((f) => f.fuga.statusFuga === 'FORAGIDO').length;
  const recapturadosTotal = todasFugas.filter((f) => f.fuga.statusFuga === 'RECAPTURADO').length;

  const temFiltroAtivo = busca.trim() !== '' || filtroStatus !== 'FORAGIDO';

  const limparFiltros = () => {
    setBusca('');
    setFiltroStatus('FORAGIDO');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner Principal de Fugas Responsivo */}
      <div className="bg-gradient-to-r from-red-950/60 via-red-900/30 to-slate-900 border border-red-800/80 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm sm:text-base">
            <AlertOctagon className="w-5 h-5 animate-pulse shrink-0" />
            <span>Painel Tático de Fugas & Rompimentos de Tornozeleira</span>
          </div>
          <p className="text-xs text-red-200/80 mt-1 max-w-2xl leading-relaxed">
            Monitoramento de evasões, violação física de cinta óptica, rompimento de perímetro e difusão de mandados de recaptura com foto e dados processuais para as forças de segurança.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print flex-wrap">
          {onExportarPDF && (
            <button
              onClick={onExportarPDF}
              className="px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-red-200 border border-red-800/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Exportar Lista Oficial de Foragidos em PDF"
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>Lista (PDF)</span>
            </button>
          )}
          <button
            onClick={onNovaFuga}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/40 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>+ Registrar Nova Fuga</span>
          </button>
        </div>
      </div>

      {/* Indicadores e Filtros Responsivos */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Barra de Busca */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar foragido por nome, CPF, local da fuga ou processo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Filtro Status em Botões Segmentados */}
          <div className="sm:col-span-6 flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFiltroStatus('FORAGIDO')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                filtroStatus === 'FORAGIDO'
                  ? 'bg-red-950 text-red-200 border border-red-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Ativos ({foragidosAtivos})</span>
            </button>
            <button
              onClick={() => setFiltroStatus('RECAPTURADO')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                filtroStatus === 'RECAPTURADO'
                  ? 'bg-emerald-950 text-emerald-200 border border-emerald-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recapturados ({recapturadosTotal})</span>
            </button>
            <button
              onClick={() => setFiltroStatus('TODOS')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filtroStatus === 'TODOS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({todasFugas.length})
            </button>
          </div>
        </div>

        {/* Linha de status dos filtros */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            Exibindo <span className="font-bold text-white font-mono">{filtradas.length}</span> registros de evasão
          </div>
          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar padrão</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards de Foragidos com Foto em Destaque Obrigatório */}
      {filtradas.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
          <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhuma ocorrência de fuga encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filtroStatus === 'FORAGIDO'
              ? 'Não há monitorados constando como foragidos com os filtros atuais.'
              : 'Nenhum registro correspondente aos filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
          {filtradas.map(({ fuga, individuo }) => {
            const idade = calcularIdade(individuo.dataNascimento);
            const faixa = obterFaixaEtaria(idade);
            const isForagido = fuga.statusFuga === 'FORAGIDO';

            return (
              <div
                key={fuga.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isForagido
                    ? 'bg-slate-900/90 border-red-900/80 hover:border-red-600 shadow-lg shadow-red-950/20'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4 text-center sm:text-left">
                    {/* Foto do Monitorado em Destaque Obrigatório */}
                    <div className="relative shrink-0">
                      <img
                        src={individuo.fotoUrl}
                        alt={individuo.nomeCompleto}
                        referrerPolicy="no-referrer"
                        className={`w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-xl border-2 shadow-md ${
                          isForagido ? 'border-red-600' : 'border-slate-700 opacity-80'
                        }`}
                      />
                      <div
                        className={`absolute bottom-2 left-2 right-2 text-center text-[10px] font-black uppercase py-0.5 rounded shadow ${
                          isForagido ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isForagido ? 'FORAGIDO' : 'RECAPTURADO'}
                      </div>
                    </div>

                    {/* Informações da Evasão */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {individuo.nomeCompleto}
                        </h3>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mt-0.5">
                          <span className="font-mono">CPF: {individuo.cpf}</span>
                          <span>·</span>
                          <span className="text-amber-400">{idade} anos ({rotuloFaixaEtaria(faixa)})</span>
                        </div>
                      </div>

                      {/* Tipo Penal & Processo */}
                      <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
                        <div className="text-amber-400 font-semibold truncate">
                          {individuo.tipoPenal}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5 truncate">
                          Processo: {individuo.numeroProcesso}
                        </div>
                      </div>

                      {/* Dados da Fuga: Data da Fuga e Local da Fuga */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-red-300 font-medium justify-center sm:justify-start">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-red-400" />
                          <span>Data da Fuga:</span>
                          <strong className="font-mono text-white">
                            {formatarDataHora(fuga.dataHoraFuga)}
                          </strong>
                        </div>

                        <div className="flex items-start gap-1.5 text-slate-300 justify-center sm:justify-start">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-red-400 mt-0.5" />
                          <div>
                            <span className="text-slate-400">Local da Fuga: </span>
                            <span className="text-white font-medium">{fuga.localFuga}</span>
                          </div>
                        </div>

                        {fuga.circunstancias && (
                          <div className="text-[11px] text-slate-400 line-clamp-2" title={fuga.circunstancias}>
                            Circunstâncias: {fuga.circunstancias}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação na Fuga Responsivos com Grandes Áreas de Toque */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 mt-3 border-t border-slate-800/80 no-print">
                  <button
                    onClick={() => onVerAlertaFuga(individuo, fuga)}
                    className="flex-1 py-2 px-3 text-xs font-semibold bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ficha de Alerta / Mandado</span>
                  </button>

                  {isForagido && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Confirmar recaptura de ${individuo.nomeCompleto}? O status será atualizado e lançado retorno no livro.`
                          )
                        ) {
                          onMarcarRecapturado(individuo.id, fuga.id);
                        }
                      }}
                      className="flex-1 sm:flex-initial py-2 px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Recapturado</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

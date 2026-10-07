import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, MapPin, Calendar, Clock, CheckCircle2, Printer, Search, PlusCircle, ShieldAlert } from 'lucide-react';
import { IndividuoMonitorado, RegistroFuga } from '../types/monitoring';
import { formatarDataHora, calcularIdade, obterFaixaEtaria, rotuloFaixaEtaria } from '../utils/ageUtils';

interface FugasViewProps {
  individuos: IndividuoMonitorado[];
  onNovaFuga: () => void;
  onVerAlertaFuga: (individuo: IndividuoMonitorado, fuga: RegistroFuga) => void;
  onMarcarRecapturado: (individuoId: string, fugaId: string) => void;
}

export const FugasView: React.FC<FugasViewProps> = ({
  individuos,
  onNovaFuga,
  onVerAlertaFuga,
  onMarcarRecapturado,
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

  return (
    <div className="space-y-6">
      {/* Banner Principal de Fugas */}
      <div className="bg-gradient-to-r from-red-950/60 via-red-900/30 to-slate-900 border border-red-800/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-base">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span>Painel Tático de Fugas & Rompimentos de Tornozeleira</span>
          </div>
          <p className="text-xs text-red-200/80 mt-1 max-w-2xl leading-relaxed">
            Monitoramento de evasões, violação física de cinta óptica, rompimento de perímetro e difusão de mandados de recaptura com foto e dados processuais para as forças de segurança.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={onNovaFuga}
            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-900/40"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>+ Registrar Nova Fuga</span>
          </button>
        </div>
      </div>

      {/* Indicadores e Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 no-print">
        {/* Barra de Busca */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar foragido por nome, CPF, local da fuga ou processo..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filtro Status */}
        <div className="sm:col-span-6 flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFiltroStatus('FORAGIDO')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              filtroStatus === 'FORAGIDO'
                ? 'bg-red-950 text-red-200 border border-red-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Foragidos Ativos ({foragidosAtivos})</span>
          </button>
          <button
            onClick={() => setFiltroStatus('RECAPTURADO')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
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
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filtroStatus === 'TODOS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({todasFugas.length})
          </button>
        </div>
      </div>

      {/* Cards de Foragidos com Foto em Destaque */}
      {filtradas.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
          <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhuma ocorrência de fuga encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filtroStatus === 'FORAGIDO'
              ? 'Não há monitorados constando como foragidos com os filtros atuais.'
              : 'Nenhum registro correspondente aos filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtradas.map(({ fuga, individuo }) => {
            const idade = calcularIdade(individuo.dataNascimento);
            const faixa = obterFaixaEtaria(idade);
            const isForagido = fuga.statusFuga === 'FORAGIDO';

            return (
              <div
                key={fuga.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isForagido
                    ? 'bg-slate-900/90 border-red-900/80 hover:border-red-600 shadow-lg shadow-red-950/20'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Foto do Monitorado em Destaque Obrigatório */}
                  <div className="relative shrink-0">
                    <img
                      src={individuo.fotoUrl}
                      alt={individuo.nomeCompleto}
                      referrerPolicy="no-referrer"
                      className={`w-28 h-36 object-cover rounded-xl border-2 shadow-md ${
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
                  <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {individuo.nomeCompleto}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-0.5">
                        <span className="font-mono">CPF: {individuo.cpf}</span>
                        <span>·</span>
                        <span>{idade} anos ({rotuloFaixaEtaria(faixa)})</span>
                      </div>
                    </div>

                    {/* Tipo Penal & Processo */}
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
                      <div className="text-amber-400 font-semibold truncate">
                        {individuo.tipoPenal}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
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

                      <div className="text-[11px] text-slate-400 line-clamp-2" title={fuga.circunstancias}>
                        Circunstâncias: {fuga.circunstancias}
                      </div>
                    </div>

                    {/* Botões de Ação na Fuga */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 no-print flex-wrap justify-center sm:justify-start">
                      <button
                        onClick={() => onVerAlertaFuga(individuo, fuga)}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg flex items-center gap-1.5 transition-colors"
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
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar Recapturado</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

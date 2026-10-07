import React from 'react';
import { X, Printer, ArrowUpDown, AlertTriangle, Shield, User, MapPin, Calendar, Clock, FileText, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { IndividuoMonitorado, MovimentacaoRegistro } from '../types/monitoring';
import { calcularIdade, obterFaixaEtaria, rotuloFaixaEtaria, formatarDataHora, formatarData, rotuloPerfil, rotuloStatus } from '../utils/ageUtils';

interface FichaIndividuoModalProps {
  isOpen: boolean;
  onClose: () => void;
  individuo: IndividuoMonitorado | null;
  onEditarCadastro: (individuo: IndividuoMonitorado) => void;
  onRegistrarMovimentacao: (individuoId: string) => void;
  onEditarMovimentacao: (individuoId: string, mov: MovimentacaoRegistro) => void;
  onRegistrarFuga: (individuoId: string) => void;
  onVerAlertaFuga: (individuo: IndividuoMonitorado) => void;
  onExcluirCadastro?: (individuoId: string) => void;
}

export const FichaIndividuoModal: React.FC<FichaIndividuoModalProps> = ({
  isOpen,
  onClose,
  individuo,
  onEditarCadastro,
  onRegistrarMovimentacao,
  onEditarMovimentacao,
  onRegistrarFuga,
  onVerAlertaFuga,
  onExcluirCadastro,
}) => {
  if (!isOpen || !individuo) return null;

  const idade = calcularIdade(individuo.dataNascimento);
  const faixa = obterFaixaEtaria(idade);

  const handlePrint = () => {
    window.print();
  };

  const handleExcluir = () => {
    if (!onExcluirCadastro) return;
    if (confirm(`Tem certeza que deseja excluir o cadastro de ${individuo.nomeCompleto} e todo o seu histórico? Esta ação é irreversível.`)) {
      onExcluirCadastro(individuo.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header no-print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dossiê Individual de Monitoramento</h2>
              <p className="text-xs text-slate-400">
                Ficha de identificação penal, processo, equipamento e linha do tempo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditarCadastro(individuo)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Editar todos os dados deste cadastro"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Cadastro</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header Card com Foto e Perfil */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
            {/* Foto Oficial */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="relative w-40 h-48 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
                <img
                  src={individuo.fotoUrl}
                  alt={individuo.nomeCompleto}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow ${
                    individuo.status === 'FORAGIDO'
                      ? 'bg-red-600 text-white'
                      : individuo.status === 'ATIVO'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {rotuloStatus(individuo.status)}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-2">ID: {individuo.id}</span>
              <button
                onClick={() => onEditarCadastro(individuo)}
                className="no-print mt-1 text-[11px] text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Alterar foto / dados</span>
              </button>
            </div>

            {/* Informações Principais */}
            <div className="sm:col-span-8 space-y-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white">{individuo.nomeCompleto}</h1>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      individuo.perfil === 'VITIMA_PROTEGIDA'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : individuo.perfil === 'AGRESSOR'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {rotuloPerfil(individuo.perfil)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono">CPF: {individuo.cpf}</span>
                  <span>·</span>
                  <span>Nascimento: {formatarData(individuo.dataNascimento)}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-semibold">{idade} anos ({rotuloFaixaEtaria(faixa)})</span>
                </div>
              </div>

              {/* Box Processo e Tipo Penal */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Processo Judicial (CNJ):</span>
                  <span className="font-mono font-bold text-amber-300">{individuo.numeroProcesso}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vara / Comarca:</span>
                  <span className="text-white font-medium">{individuo.varaJudicial} · {individuo.comarca}</span>
                </div>
                <div className="pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-0.5 font-semibold">
                    Tipo Penal Respondendo:
                  </span>
                  <span className="text-sm font-semibold text-white block">{individuo.tipoPenal}</span>
                  {individuo.resumoTipificacao && (
                    <span className="text-xs text-slate-400 mt-0.5 block">{individuo.resumoTipificacao}</span>
                  )}
                </div>
              </div>

              {/* Informações de Equipamento */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Dispositivo / Tornozeleira:</span>
                  <span className="font-mono font-bold text-white">
                    {individuo.numeroTornozeleiraOuReceptor || 'Nenhum associado'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">IMEI Telemetria:</span>
                  <span className="font-mono text-slate-300">
                    {individuo.imeiDispositivo || 'Sem registro de IMEI'}
                  </span>
                </div>
              </div>

              {/* Vínculo de Par (Vítima ou Agressor) */}
              {individuo.nomeIndividuoVinculado && (
                <div className="p-2.5 bg-purple-950/20 border border-purple-900/40 rounded-lg text-xs">
                  <span className="text-purple-300 font-semibold block">
                    {individuo.perfil === 'AGRESSOR' ? 'Vítima Protegida Vinculada:' : 'Agressor Vinculado:'}
                  </span>
                  <span className="text-white font-medium">{individuo.nomeIndividuoVinculado}</span>
                  {individuo.raioExclusaoMetros && (
                    <span className="text-slate-400 ml-2">
                      · Raio de exclusão: <strong className="text-amber-400">{individuo.raioExclusaoMetros}m</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Endereço e Contato */}
              {(individuo.enderecoResidencial || individuo.telefoneContato) && (
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Endereço Residencial:</span>
                    <span>{individuo.enderecoResidencial} {individuo.cidade ? `(${individuo.cidade}/${individuo.estado})` : ''}</span>
                  </div>
                  {individuo.telefoneContato && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Telefone:</span>
                      <span className="font-mono text-white">{individuo.telefoneContato}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção de Fugas (se houver) */}
          {individuo.fugas.length > 0 && (
            <div className="space-y-3 bg-red-950/30 border border-red-900/60 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Ocorrência de Fuga / Rompimento Registrada
                </h3>
                <button
                  onClick={() => onVerAlertaFuga(individuo)}
                  className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  Ver Ficha de Alerta & Mandado
                </button>
              </div>

              {individuo.fugas.map((fuga) => (
                <div key={fuga.id} className="p-3 bg-slate-900/90 rounded-lg border border-red-900/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Status da Fuga: {fuga.statusFuga}</span>
                    <span className="font-mono text-red-400">{formatarDataHora(fuga.dataHoraFuga)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Local da Ocorrência: </span>
                    <span className="text-slate-200">{fuga.localFuga}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Circunstâncias: </span>
                    <span className="text-slate-200">{fuga.circunstancias}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Histórico de Movimentações (Livro Eletrônico) com EDICAO de Entrada e Saída */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-amber-400" />
                Histórico de Entradas e Saídas ({individuo.movimentacoes.length} registros)
              </h3>
              <button
                onClick={() => onRegistrarMovimentacao(individuo.id)}
                className="no-print text-xs text-amber-400 hover:text-amber-300 font-medium underline"
              >
                + Lançar nova entrada ou saída
              </button>
            </div>

            <div className="space-y-2">
              {individuo.movimentacoes.map((mov) => (
                <div
                  key={mov.id}
                  className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        mov.tipo === 'ENTRADA'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span className={mov.tipo === 'ENTRADA' ? 'text-cyan-300' : 'text-orange-300'}>
                          {mov.tipo}
                        </span>
                        <span className="text-slate-400 font-normal">·</span>
                        <span>{mov.motivo}</span>
                      </div>
                      <div className="text-slate-300 mt-0.5">{mov.motivoDetalhado}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-2">
                        <span>Resp: {mov.responsavelOperacional}</span>
                        {mov.numeroOficioOuMandado && <span>· Doc: {mov.numeroOficioOuMandado}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center">
                    <div className="font-mono text-slate-400 whitespace-nowrap text-right">
                      {formatarDataHora(mov.dataHora)}
                    </div>
                    {/* Botão de Editar a Entrada ou Saída */}
                    <button
                      onClick={() => onEditarMovimentacao(individuo.id, mov)}
                      title="Editar este registro de entrada ou saída"
                      className="no-print px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer no-print */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditarCadastro(individuo)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-200 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Editar Cadastro</span>
            </button>
            {individuo.status !== 'FORAGIDO' && individuo.perfil !== 'VITIMA_PROTEGIDA' && (
              <button
                onClick={() => onRegistrarFuga(individuo.id)}
                className="px-3 py-1.5 text-xs font-semibold text-red-200 bg-red-950/80 hover:bg-red-900 border border-red-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Registrar Fuga</span>
              </button>
            )}
            <button
              onClick={() => onRegistrarMovimentacao(individuo.id)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Lançar Entrada / Saída</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onExcluirCadastro && (
              <button
                onClick={handleExcluir}
                className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                title="Excluir cadastro permanentemente"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                <span>Excluir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

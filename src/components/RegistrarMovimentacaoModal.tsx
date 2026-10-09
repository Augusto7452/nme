import React, { useState, useEffect } from 'react';
import { X, ArrowUpDown, ArrowDownRight, ArrowUpRight, Calendar, User, FileText, Edit3, Trash2 } from 'lucide-react';
import { IndividuoMonitorado, TipoMovimentacao, MotivoEntrada, MotivoSaida, MovimentacaoRegistro } from '../types/monitoring';

interface RegistrarMovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  individuos: IndividuoMonitorado[];
  individuoPreSelecionadoId?: string;
  movimentacaoParaEditar?: {
    individuoId: string;
    movimentacao: MovimentacaoRegistro;
  } | null;
  onSalvarMovimentacao: (
    individuoId: string,
    tipo: TipoMovimentacao,
    dados: {
      dataHora: string;
      motivo: MotivoEntrada | MotivoSaida;
      motivoDetalhado: string;
      responsavelOperacional: string;
      numeroOficioOuMandado?: string;
      observacoes?: string;
    }
  ) => void;
  onEditarMovimentacao?: (
    individuoId: string,
    movimentacaoId: string,
    tipo: TipoMovimentacao,
    dados: {
      dataHora: string;
      motivo: MotivoEntrada | MotivoSaida;
      motivoDetalhado: string;
      responsavelOperacional: string;
      numeroOficioOuMandado?: string;
      observacoes?: string;
    }
  ) => void;
  onExcluirMovimentacao?: (individuoId: string, movimentacaoId: string) => void;
}

export const RegistrarMovimentacaoModal: React.FC<RegistrarMovimentacaoModalProps> = ({
  isOpen,
  onClose,
  individuos,
  individuoPreSelecionadoId,
  movimentacaoParaEditar,
  onSalvarMovimentacao,
  onEditarMovimentacao,
  onExcluirMovimentacao,
}) => {
  const agora = new Date();
  const dataHojeStr = agora.toISOString().split('T')[0];
  const horaAgoraStr = agora.toTimeString().slice(0, 5);

  const isEdicao = !!movimentacaoParaEditar;

  const [individuoId, setIndividuoId] = useState(
    individuoPreSelecionadoId || (individuos.length > 0 ? individuos[0].id : '')
  );
  const [tipo, setTipo] = useState<TipoMovimentacao>('ENTRADA');
  const [dataMovimentacao, setDataMovimentacao] = useState(dataHojeStr);
  const [horaMovimentacao, setHoraMovimentacao] = useState(horaAgoraStr);
  const [motivoEntrada, setMotivoEntrada] = useState<MotivoEntrada>('INSTALACAO_INICIAL');
  const [motivoSaida, setMotivoSaida] = useState<MotivoSaida>('REVOGACAO_MEDIDA');
  const [motivoDetalhado, setMotivoDetalhado] = useState('');
  const [responsavelOperacional, setResponsavelOperacional] = useState('Agente Policial Penal');
  const [numeroOficio, setNumeroOficio] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (movimentacaoParaEditar) {
      setIndividuoId(movimentacaoParaEditar.individuoId);
      setTipo(movimentacaoParaEditar.movimentacao.tipo);

      try {
        const d = new Date(movimentacaoParaEditar.movimentacao.dataHora);
        setDataMovimentacao(d.toISOString().split('T')[0]);
        setHoraMovimentacao(d.toTimeString().slice(0, 5));
      } catch {
        setDataMovimentacao(dataHojeStr);
        setHoraMovimentacao(horaAgoraStr);
      }

      if (movimentacaoParaEditar.movimentacao.tipo === 'ENTRADA') {
        setMotivoEntrada(movimentacaoParaEditar.movimentacao.motivo as MotivoEntrada);
      } else {
        setMotivoSaida(movimentacaoParaEditar.movimentacao.motivo as MotivoSaida);
      }

      setMotivoDetalhado(movimentacaoParaEditar.movimentacao.motivoDetalhado || '');
      setResponsavelOperacional(movimentacaoParaEditar.movimentacao.responsavelOperacional || 'Agente Policial Penal');
      setNumeroOficio(movimentacaoParaEditar.movimentacao.numeroOficioOuMandado || '');
      setObservacoes(movimentacaoParaEditar.movimentacao.observacoes || '');
    } else {
      setIndividuoId(individuoPreSelecionadoId || (individuos.length > 0 ? individuos[0].id : ''));
      setTipo('ENTRADA');
      setDataMovimentacao(dataHojeStr);
      setHoraMovimentacao(horaAgoraStr);
      setMotivoEntrada('INSTALACAO_INICIAL');
      setMotivoSaida('REVOGACAO_MEDIDA');
      setMotivoDetalhado('');
      setResponsavelOperacional('Agente Policial Penal');
      setNumeroOficio('');
      setObservacoes('');
    }
  }, [movimentacaoParaEditar, individuoPreSelecionadoId, isOpen]);

  if (!isOpen) return null;

  const individuoSelecionado = individuos.find((i) => i.id === individuoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!individuoId) {
      alert('Selecione um indivíduo.');
      return;
    }

    const dataHoraIso = new Date(`${dataMovimentacao}T${horaMovimentacao}:00`).toISOString();
    const motivoFinal = tipo === 'ENTRADA' ? motivoEntrada : motivoSaida;

    const dados = {
      dataHora: dataHoraIso,
      motivo: motivoFinal,
      motivoDetalhado: motivoDetalhado || `Registro de ${tipo.toLowerCase()} no sistema de monitoramento eletrônico.`,
      responsavelOperacional,
      numeroOficioOuMandado: numeroOficio,
      observacoes,
    };

    if (isEdicao && movimentacaoParaEditar && onEditarMovimentacao) {
      onEditarMovimentacao(individuoId, movimentacaoParaEditar.movimentacao.id, tipo, dados);
    } else {
      onSalvarMovimentacao(individuoId, tipo, dados);
    }

    onClose();
  };

  const handleExcluir = () => {
    if (!isEdicao || !movimentacaoParaEditar || !onExcluirMovimentacao) return;
    if (confirm('Deseja realmente excluir este registro de movimentação do livro eletrônico?')) {
      onExcluirMovimentacao(individuoId, movimentacaoParaEditar.movimentacao.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[96vh] sm:max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isEdicao
                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              {isEdicao ? <Edit3 className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {isEdicao ? 'Editar Registro de Entrada / Saída' : 'Novo Registro de Entrada / Saída'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {isEdicao ? 'Alteração de dados no livro eletrônico' : 'Lançamento formal no livro de movimentações'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Seleção do Indivíduo */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Pessoa Monitorada <span className="text-red-400">*</span>
            </label>
            <select
              value={individuoId}
              onChange={(e) => setIndividuoId(e.target.value)}
              disabled={isEdicao}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 disabled:opacity-60"
            >
              {individuos.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.nomeCompleto} ({ind.perfil === 'VITIMA_PROTEGIDA' ? 'Vítima' : ind.perfil === 'AGRESSOR' ? 'Agressor' : 'Monitorado'}) - Proc: {ind.numeroProcesso}
                </option>
              ))}
            </select>
          </div>

          {/* Card Resumo do Indivíduo Selecionado */}
          {individuoSelecionado && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
              <img
                src={individuoSelecionado.fotoUrl}
                alt={individuoSelecionado.nomeCompleto}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {individuoSelecionado.nomeCompleto}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-mono">{individuoSelecionado.cpf}</span>
                  <span>·</span>
                  <span className="text-amber-400 truncate">{individuoSelecionado.tipoPenal}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Disp: {individuoSelecionado.numeroTornozeleiraOuReceptor || 'Sem disp.'} · Status atual: {individuoSelecionado.status}
                </div>
              </div>
            </div>
          )}

          {/* Tipo de Movimentação: ENTRADA ou SAÍDA */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tipo de Registro <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTipo('ENTRADA')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  tipo === 'ENTRADA'
                    ? 'bg-cyan-950/40 border-cyan-400 text-white'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${tipo === 'ENTRADA' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs text-white">Registro de ENTRADA</div>
                  <div className="text-[10px] text-slate-400">Ativação, retorno ou acolhimento</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipo('SAIDA')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  tipo === 'SAIDA'
                    ? 'bg-orange-950/40 border-orange-400 text-white'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${tipo === 'SAIDA' ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-800 text-slate-500'}`}>
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs text-white">Registro de SAÍDA</div>
                  <div className="text-[10px] text-slate-400">Desligamento, revogação ou fuga</div>
                </div>
              </button>
            </div>
          </div>

          {/* Data, Hora e Motivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Data do Registro <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dataMovimentacao}
                onChange={(e) => setDataMovimentacao(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hora do Registro <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                required
                value={horaMovimentacao}
                onChange={(e) => setHoraMovimentacao(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Motivo Específico da {tipo === 'ENTRADA' ? 'Entrada' : 'Saída'} <span className="text-red-400">*</span>
              </label>
              {tipo === 'ENTRADA' ? (
                <select
                  value={motivoEntrada}
                  onChange={(e) => setMotivoEntrada(e.target.value as MotivoEntrada)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="INSTALACAO_INICIAL">Instalação Inicial do Dispositivo</option>
                  <option value="MEDIDA_PROTETIVA_CONCEDIDA">Medida Protetiva Concedida (Entrega Botão Pânico)</option>
                  <option value="RETORNO_RECAPTURA">Retorno por Recaptura de Foragido</option>
                  <option value="TRANSFERENCIA_ENTRADA">Transferência de Entrada (Outra Comarca/Estado)</option>
                  <option value="SUBSTITUICAO_EQUIPAMENTO">Substituição por Defeito / Manutenção</option>
                  <option value="OUTRO">Outro Motivo Legal</option>
                </select>
              ) : (
                <select
                  value={motivoSaida}
                  onChange={(e) => setMotivoSaida(e.target.value as MotivoSaida)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="REVOGACAO_MEDIDA">Revogação Judicial da Medida Cautelar</option>
                  <option value="EXTINCAO_PENA">Extinção de Punibilidade / Cumprimento Integral</option>
                  <option value="RECOLHIMENTO_FECHADO">Regressão de Regime / Recolhimento ao Fechado</option>
                  <option value="TRANSFERENCIA_SAIDA">Transferência para Outra Comarca</option>
                  <option value="DESLIGAMENTO_VOLUNTARIO_VITIMA">Desligamento a Pedido da Vítima</option>
                  <option value="FUGA_ROMPIMENTO">Fuga / Rompimento de Tornozeleira</option>
                  <option value="OBITO">Óbito</option>
                  <option value="OUTRO">Outro Motivo</option>
                </select>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Detalhamento dos Fatos / Justificativa
              </label>
              <input
                type="text"
                value={motivoDetalhado}
                onChange={(e) => setMotivoDetalhado(e.target.value)}
                placeholder="Ex: Desativação conforme decisão do juiz plantonista às 14h30"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Responsável Operacional</label>
              <input
                type="text"
                value={responsavelOperacional}
                onChange={(e) => setResponsavelOperacional(e.target.value)}
                placeholder="Ex: Agente Ferreira - Matr. 4921"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nº Mandado / Ofício</label>
              <input
                type="text"
                value={numeroOficio}
                onChange={(e) => setNumeroOficio(e.target.value)}
                placeholder="Ex: OF-VEC-2024/091"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
            {isEdicao && onExcluirMovimentacao ? (
              <button
                type="button"
                onClick={handleExcluir}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Registro</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                  isEdicao
                    ? 'bg-blue-500 hover:bg-blue-400 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {isEdicao ? <Edit3 className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
                <span>{isEdicao ? 'Salvar Edição do Registro' : 'Confirmar Lançamento'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

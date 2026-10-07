import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Calendar, Clock, ShieldAlert, FileText, Send } from 'lucide-react';
import { IndividuoMonitorado, RegistroFuga } from '../types/monitoring';

interface RegistrarFugaModalProps {
  isOpen: boolean;
  onClose: () => void;
  individuos: IndividuoMonitorado[];
  individuoPreSelecionadoId?: string;
  onSalvarFuga: (fugaData: {
    individuoId: string;
    dataHoraFuga: string;
    localFuga: string;
    coordenadasAproximadas?: string;
    circunstancias: string;
    mandadoPrisaoNumero?: string;
    orgaosComunicados: string[];
    observacoes?: string;
  }) => void;
}

export const RegistrarFugaModal: React.FC<RegistrarFugaModalProps> = ({
  isOpen,
  onClose,
  individuos,
  individuoPreSelecionadoId,
  onSalvarFuga,
}) => {
  const agora = new Date();
  const dataHojeStr = agora.toISOString().split('T')[0];
  const horaAgoraStr = agora.toTimeString().slice(0, 5);

  // Monitorados aptos para registro de fuga (não vítimas e não já foragidos se possível)
  const candidatos = individuos.filter((i) => i.perfil !== 'VITIMA_PROTEGIDA');

  const [individuoId, setIndividuoId] = useState(
    individuoPreSelecionadoId || (candidatos.length > 0 ? candidatos[0].id : '')
  );
  const [dataFuga, setDataFuga] = useState(dataHojeStr);
  const [horaFuga, setHoraFuga] = useState(horaAgoraStr);
  const [localFuga, setLocalFuga] = useState('');
  const [coordenadas, setCoordenadas] = useState('');
  const [circunstancias, setCircunstancias] = useState(
    'Rompimento de cinta de tornozeleira eletrônica detectado por sensor óptico.'
  );
  const [mandadoPrisaoNumero, setMandadoPrisaoNumero] = useState('');
  const [comunicarPM, setComunicarPM] = useState(true);
  const [comunicarPC, setComunicarPC] = useState(true);
  const [comunicarVEC, setComunicarVEC] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  if (!isOpen) return null;

  const monitoradoSelecionado = individuos.find((i) => i.id === individuoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!individuoId) {
      alert('Selecione o monitorado.');
      return;
    }
    if (!localFuga) {
      alert('Informe o local da fuga (endereço ou ponto de referência).');
      return;
    }

    const dataHoraIso = new Date(`${dataFuga}T${horaFuga}:00`).toISOString();
    const orgaos: string[] = [];
    if (comunicarPM) orgaos.push('Polícia Militar (COPOM / 190)');
    if (comunicarPC) orgaos.push('Polícia Civil (Divisão de Capturas)');
    if (comunicarVEC) orgaos.push('Vara de Execuções Penais');

    onSalvarFuga({
      individuoId,
      dataHoraFuga: dataHoraIso,
      localFuga,
      coordenadasAproximadas: coordenadas,
      circunstancias,
      mandadoPrisaoNumero: mandadoPrisaoNumero || 'MP-PENDENTE-EXPEDICAO',
      orgaosComunicados: orgaos,
      observacoes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-red-800/60 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header de Alerta Vermelho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/60 bg-red-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-200">
                Registro de Ocorrência de Fuga / Rompimento de Tornozeleira
              </h2>
              <p className="text-xs text-red-300/80">
                Emissão de alerta de evasão, registro do local, data da fuga e foto para difusão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seleção do Monitorado com Foto em Destaque */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
              Selecione o Monitorado em Evasão <span className="text-red-400">*</span>
            </label>
            <select
              value={individuoId}
              onChange={(e) => setIndividuoId(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 mb-4"
            >
              {candidatos.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.nomeCompleto} - CPF: {ind.cpf} - Disp: {ind.numeroTornozeleiraOuReceptor || 'TX'} (
                  {ind.status})
                </option>
              ))}
            </select>

            {/* Ficha Visual do Monitorado com a Foto */}
            {monitoradoSelecionado && (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
                <div className="relative">
                  <img
                    src={monitoradoSelecionado.fotoUrl}
                    alt={monitoradoSelecionado.nomeCompleto}
                    referrerPolicy="no-referrer"
                    className="w-24 h-28 object-cover rounded-lg border-2 border-red-600 shadow-md"
                  />
                  <span className="absolute bottom-1 right-1 bg-red-600 text-[9px] font-bold text-white px-1 py-0.5 rounded">
                    ALERTA
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="text-base font-bold text-white">{monitoradoSelecionado.nomeCompleto}</div>
                  <div className="text-xs text-slate-300 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-mono">CPF: {monitoradoSelecionado.cpf}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-semibold">{monitoradoSelecionado.tipoPenal}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Proc: {monitoradoSelecionado.numeroProcesso} ({monitoradoSelecionado.varaJudicial})
                  </div>
                  <div className="text-[11px] text-red-300 font-mono">
                    Tornozeleira ID: {monitoradoSelecionado.numeroTornozeleiraOuReceptor || 'N/A'} · IMEI:{' '}
                    {monitoradoSelecionado.imeiDispositivo || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dados da Fuga: Data, Hora e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                Data da Fuga <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dataFuga}
                onChange={(e) => setDataFuga(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                Hora da Fuga / Último Contato <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                required
                value={horaFuga}
                onChange={(e) => setHoraFuga(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                Local da Fuga (Último Endereço / Ponto Conhecido) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={localFuga}
                onChange={(e) => setLocalFuga(e.target.value)}
                placeholder="Ex: Av. Marechal Tito, 4800, próximo à estação CPTM, Bairro Itaim Paulista"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Coordenadas GPS Aproximadas (Latitude, Longitude)
              </label>
              <input
                type="text"
                value={coordenadas}
                onChange={(e) => setCoordenadas(e.target.value)}
                placeholder="Ex: -23.501924, -46.429184"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nº Mandado de Prisão / Comunicação Oficial
              </label>
              <input
                type="text"
                value={mandadoPrisaoNumero}
                onChange={(e) => setMandadoPrisaoNumero(e.target.value)}
                placeholder="Ex: MP-VEC-00912/2024"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Circunstâncias da Fuga & Modus Operandi <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={circunstancias}
                onChange={(e) => setCircunstancias(e.target.value)}
                placeholder="Descreva o alarme disparado (corte de fibra ótica, rompimento mecânico, perda de sinal deliberada, fuga do domicílio durante o período noturno, etc.)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Órgãos de Segurança a Comunicar */}
            <div className="sm:col-span-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Difusão Imediata de Alerta para Forças Policiais:
              </label>
              <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comunicarPM}
                    onChange={(e) => setComunicarPM(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0"
                  />
                  <span>Polícia Militar (COPOM / 190)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comunicarPC}
                    onChange={(e) => setComunicarPC(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0"
                  />
                  <span>Polícia Civil (DEIC / Divisão de Capturas)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comunicarVEC}
                    onChange={(e) => setComunicarVEC(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0"
                  />
                  <span>Vara de Execuções Penais (Ofício Eletrônico)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Registrar Fuga & Emitir Alerta Policial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

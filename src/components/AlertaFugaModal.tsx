import React from 'react';
import { X, Printer, CheckCircle2, AlertOctagon, MapPin, Calendar, Clock, FileText, User } from 'lucide-react';
import { IndividuoMonitorado, RegistroFuga } from '../types/monitoring';
import { calcularIdade, rotuloFaixaEtaria, obterFaixaEtaria, formatarDataHora, formatarData } from '../utils/ageUtils';

interface AlertaFugaModalProps {
  isOpen: boolean;
  onClose: () => void;
  individuo: IndividuoMonitorado | null;
  fuga: RegistroFuga | null;
  onMarcarRecapturado?: (individuoId: string, fugaId: string) => void;
}

export const AlertaFugaModal: React.FC<AlertaFugaModalProps> = ({
  isOpen,
  onClose,
  individuo,
  fuga,
  onMarcarRecapturado,
}) => {
  if (!isOpen || !individuo) return null;

  const idade = calcularIdade(individuo.dataNascimento);
  const faixa = obterFaixaEtaria(idade);

  const handlePrint = () => {
    window.print();
  };

  const registroFuga = fuga || individuo.fugas[individuo.fugas.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-red-800 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[96vh] sm:max-h-[92vh] flex flex-col">
        {/* Header no-print */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-red-900/60 bg-red-950/60 shrink-0 no-print">
          <div className="flex items-center gap-2 min-w-0">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-red-200 truncate">
              FICHA OFICIAL DE ALERTA DE FUGA & DIFUSÃO POLICIAL
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Documento / Ficha Oficial */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 bg-slate-900 text-slate-100 print:bg-white print:text-black">
          {/* Cabeçalho Institucional */}
          <div className="border-b-2 border-red-600 pb-4 text-center">
            <div className="text-xs uppercase tracking-widest text-red-400 font-bold print:text-red-700">
              SECRETARIA DE ADMINISTRAÇÃO PENITENCIÁRIA · DME (DIVISÃO DE MONITORAMENTO ELETRÔNICO)
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black mt-1">
              COMUNICADO DE EVASÃO & ROMPIMENTO DE TORNOZELEIRA
            </h1>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Mandado de Recaptura nº: <span className="font-mono font-bold text-white print:text-black">{registroFuga?.mandadoPrisaoNumero || 'URGENTE-VEC'}</span> · Emissão: {formatarDataHora(new Date().toISOString())}
            </div>
          </div>

          {/* Destaque: Foto e Dados Principais do Foragido */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-slate-950/70 print:bg-slate-100 p-5 rounded-xl border border-red-900/40 print:border-slate-300">
            {/* Foto Oficial */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="relative w-44 h-52 rounded-xl overflow-hidden border-2 border-red-600 shadow-xl bg-slate-800">
                <img
                  src={individuo.fotoUrl}
                  alt={individuo.nomeCompleto}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                  FORAGIDO
                </div>
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 mt-2 text-center font-mono">
                ID SISTEMA: {individuo.id}
              </div>
            </div>

            {/* Informações Civis & Jurídicas */}
            <div className="sm:col-span-8 space-y-3">
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 uppercase font-semibold">Nome Completo:</span>
                <div className="text-lg font-bold text-white print:text-black">{individuo.nomeCompleto}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">CPF:</span>
                  <span className="font-mono font-bold text-white print:text-black">{individuo.cpf}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Data de Nascimento / Idade:</span>
                  <span className="font-mono font-bold text-white print:text-black">
                    {formatarData(individuo.dataNascimento)} ({idade} anos · {rotuloFaixaEtaria(faixa)})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Número do Processo Judicial:</span>
                  <span className="font-mono font-bold text-amber-400 print:text-blue-700">{individuo.numeroProcesso}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Vara / Comarca:</span>
                  <span className="font-semibold text-white print:text-black">{individuo.varaJudicial} - {individuo.comarca}</span>
                </div>
              </div>

              <div className="p-3 bg-red-950/40 print:bg-red-50 rounded-lg border border-red-900/60 print:border-red-200">
                <span className="text-xs font-semibold text-red-300 print:text-red-800 uppercase block">
                  Tipo Penal que Responde:
                </span>
                <div className="text-sm font-bold text-white print:text-black mt-0.5">
                  {individuo.tipoPenal}
                </div>
                {individuo.resumoTipificacao && (
                  <div className="text-xs text-slate-300 print:text-slate-700 mt-1">
                    {individuo.resumoTipificacao}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dados Específicos da Fuga */}
          {registroFuga && (
            <div className="space-y-3 bg-slate-950/40 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
              <h3 className="font-bold text-sm text-red-300 print:text-red-700 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertOctagon className="w-4 h-4" />
                Dados Operacionais da Fuga & Rompimento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Data e Hora da Fuga:</span>
                  <span className="text-sm font-bold text-white print:text-black font-mono">
                    {formatarDataHora(registroFuga.dataHoraFuga)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Equipamento Violado:</span>
                  <span className="text-sm font-bold text-white print:text-black font-mono">
                    Tornozeleira ID: {individuo.numeroTornozeleiraOuReceptor || 'TX-SN'} · IMEI: {individuo.imeiDispositivo || 'N/A'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Local da Fuga / Último Ponto Conhecido:</span>
                  <span className="text-sm font-semibold text-amber-300 print:text-black">
                    {registroFuga.localFuga}
                  </span>
                  {registroFuga.coordenadasAproximadas && (
                    <span className="block text-[11px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
                      Coordenadas GPS: {registroFuga.coordenadasAproximadas}
                    </span>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Circunstâncias / Modus Operandi:</span>
                  <p className="text-slate-200 print:text-slate-800 mt-0.5 leading-relaxed">
                    {registroFuga.circunstancias}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 print:text-slate-600 block font-medium">Órgãos de Segurança Acionados:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {registroFuga.orgaoComunicado?.map((org, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-800 print:bg-slate-200 text-slate-300 print:text-slate-800 rounded font-mono text-[11px]"
                      >
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orientações para a Abordagem */}
          <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-200 print:text-black">
            <span className="font-bold uppercase block mb-1">Determinação Legal de Captura:</span>
            Em cumprimento de mandado de prisão por evasão de monitoramento eletrônico, determinação de condução imediata à autoridade policial judiciária de plantão e comunicação urgente à Divisão de Monitoramento Eletrônico (DME).
          </div>
        </div>

        {/* Footer com botão de Recaptura */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 no-print">
          <div className="text-xs text-slate-400">
            Status atual: <span className="text-red-400 font-bold font-mono">FORAGIDO</span>
          </div>

          <div className="flex items-center gap-3">
            {onMarcarRecapturado && registroFuga && (
              <button
                onClick={() => {
                  if (confirm(`Confirmar a recaptura de ${individuo.nomeCompleto}? O status retornará para Ativo.`)) {
                    onMarcarRecapturado(individuo.id, registroFuga.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Recaptura com Sucesso</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

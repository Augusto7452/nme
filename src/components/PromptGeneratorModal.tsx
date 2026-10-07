import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Sparkles, BookOpen, FileCode2 } from 'lucide-react';
import { MASTER_PROMPT_TEXT } from '../data/masterPrompt';

interface PromptGeneratorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({
  isOpen = true,
  onClose,
  inline = false,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [incluirRegrasJuridicas, setIncluirRegrasJuridicas] = useState(true);
  const [incluirIoT, setIncluirIoT] = useState(true);
  const [incluirAPI, setIncluirAPI] = useState(true);

  if (!inline && !isOpen) return null;

  const gerarTextoPrompt = () => {
    let texto = MASTER_PROMPT_TEXT;
    if (incluirRegrasJuridicas) {
      texto += `\n\n### REQUISITOS NORMATIVOS ADICIONAIS:
- Conformidade estrita com a Resolução CNJ nº 412/2021 (diretrizes para monitoração eletrônica de pessoas);
- Lei nº 11.340/2006 (Lei Maria da Penha) e Lei nº 14.994/2024 (Pacote Anti-Feminicídio);
- Proteção da integridade de dados e cadeia de custódia das evidências telemétricas.`;
    }
    if (incluirIoT) {
      texto += `\n\n### TELEMETRIA & HARDWARE IOT:
- Protocolo TCP/MQTT com antenas GNSS (GPS + Glonass) e sinal celular (GSM/LTE/4G);
- Detecção instantânea de violação de perímetro (Geo-fencing), corte de cinta de fibra ótica e violação mecânica do case;
- Envio de alertas com latência máxima de 3 segundos para o painel de despacho da DME.`;
    }
    if (incluirAPI) {
      texto += `\n\n### INTEGRAÇÃO COM SISTEMAS EXTERNOS:
- API RESTful para integração com o BNMP (Banco Nacional de Monitoramento de Prisões / CNJ);
- Webhook para acionamento automático de despachos no COPOM (190) e Polícia Penal;
- Exportação de dossiês periciais em PDF com assinatura digital.`;
    }
    return texto;
  };

  const handleCopiar = async () => {
    const texto = gerarTextoPrompt();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleBaixar = () => {
    const texto = gerarTextoPrompt();
    const blob = new Blob([texto], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompt-mestre-monitoramento-eletronico-dme.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Prompt Mestre de Engenharia & Termo de Referência</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Este é o <strong>prompt técnico completo e formatado</strong> gerado exatamente conforme os seus requisitos: registro de entradas e saídas de monitorados, vítimas e agressores, faixa etária calculada, tipo penal respondendo, número de processo CNJ, registro de fuga com local e data, e foto do monitorado.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopiar}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-md ${
              copiado
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiado ? 'Prompt Copiado!' : 'Copiar Prompt'}</span>
          </button>
          <button
            onClick={handleBaixar}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar .md</span>
          </button>
        </div>
      </div>

      {/* Opções de Personalização do Prompt */}
      <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="font-semibold text-white text-[11px] uppercase tracking-wider">
          Módulos Extras no Prompt:
        </span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={incluirRegrasJuridicas}
            onChange={(e) => setIncluirRegrasJuridicas(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
          />
          <span>Regras CNJ & Lei Maria da Penha</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={incluirIoT}
            onChange={(e) => setIncluirIoT(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
          />
          <span>Telemetria Hardware & IoT</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={incluirAPI}
            onChange={(e) => setIncluirAPI(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
          />
          <span>Integração BNMP & COPOM</span>
        </label>
      </div>

      {/* Caixa de Código do Prompt */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <FileCode2 className="w-4 h-4 text-amber-400" />
            <span>especificacao-sistema-monitoramento.md</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {gerarTextoPrompt().length} caracteres
          </span>
        </div>

        <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[550px] select-all">
          {gerarTextoPrompt()}
        </pre>
      </div>
    </div>
  );

  if (inline) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Prompt Técnico Mestre de Criação do App</h2>
              <p className="text-xs text-slate-400">
                Copie ou exporte a especificação solicitada para IA ou Engenharia de Software
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6">{content}</div>
      </div>
    </div>
  );
};

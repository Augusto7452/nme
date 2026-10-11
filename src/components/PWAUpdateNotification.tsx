import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export const PWAUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let autoReloadTimer: ReturnType<typeof setTimeout> | null = null;

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ version?: string }>;
      if (customEvent.detail?.version) {
        setVersion(customEvent.detail.version);
      }
      setUpdateAvailable(true);
      setIsUpdating(true);

      // Dispara atualização automática garantindo reload forçado
      autoReloadTimer = setTimeout(() => {
        handleApplyUpdate();
      }, 1200);
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    return () => {
      window.removeEventListener('pwa-update-available', handleUpdate);
      if (autoReloadTimer) clearTimeout(autoReloadTimer);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    } catch (e) {
      console.warn('Erro ao aplicar atualização do SW:', e);
    }
    // Forçar recarga da página para carregar os novos bundles da Vercel
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-in slide-in-from-top duration-300">
      <div className="bg-slate-900/98 border border-amber-500/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white ring-1 ring-amber-500/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Nova Versão Detectada {version ? `(v${version})` : ''}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h5>
            <p className="text-[11px] text-slate-300 truncate">
              Atualizando automaticamente para a versão mais recente...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Atualizando...' : 'Recarregar Agora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

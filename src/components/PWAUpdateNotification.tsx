import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export const PWAUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    return () => {
      window.removeEventListener('pwa-update-available', handleUpdate);
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
    // Recarregar a página para obter a versão mais recente dos scripts
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-in slide-in-from-top duration-300">
      <div className="bg-slate-900/98 border border-amber-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white ring-1 ring-amber-500/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Nova Versão Disponível</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h5>
            <p className="text-[11px] text-slate-300 truncate">
              Novas funcionalidades prontas para carregar.
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
            <span>{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Ignorar por enquanto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

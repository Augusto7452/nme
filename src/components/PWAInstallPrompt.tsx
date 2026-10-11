import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

const DISMISSED_BANNER_KEY = 'cmep_pwa_install_dismissed_v1';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    // Se já estiver instalado em modo standalone, nunca exibe o banner
    if (isInstalled) {
      setIsBannerVisible(false);
      return;
    }

    // Verifica se o usuário dispensou o banner nesta sessão
    const dismissed = sessionStorage.getItem(DISMISSED_BANNER_KEY);
    if (!dismissed && (isInstallable || isIOS)) {
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem(DISMISSED_BANNER_KEY, 'true');
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsBannerVisible(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Banner / Popup Flutuante de Notificação de Instalação */}
      {isBannerVisible && (
        <div className="fixed bottom-4 right-4 z-[80] max-w-sm w-full bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-white">Instalar Aplicativo CMEP</h4>
                <button
                  onClick={handleDismissBanner}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors -mr-1 -mt-1"
                  title="Fechar notificação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Instale o sistema para acesso direto da área de trabalho ou celular, suporte offline e inicialização rápida.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleTriggerInstall}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'Como Instalar no iOS' : 'Instalar Agora'}</span>
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Agora não
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guiado para Instalação no iOS (Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Instalar no iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block">1. Toque em Compartilhar</span>
                  <span>Na barra inferior do Safari, clique no ícone de compartilhamento (quadrado com seta).</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white block">2. Adicionar à Tela de Início</span>
                  <span>Role para baixo nas opções e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>O ícone do CMEP aparecerá direto na sua tela inicial como um app nativo.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Botão discreto para inserção direta no Header ou Menu
 */
export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar CMEP no dispositivo"
        className="px-2.5 py-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Instalar App</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Instalar no iOS</h3>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              No Safari, toque no botão <strong>Compartilhar</strong> e selecione <strong>Adicionar à Tela de Início</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

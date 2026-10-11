/**
 * Registro do Service Worker do PWA com detecção ativa de atualizações
 */

export function registrarServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          // Checar atualizações periodicamente (a cada 5 minutos)
          setInterval(() => {
            registration.update().catch(() => {});
          }, 5 * 60 * 1000);

          // Checar atualizações sempre que a página ganhar foco / visibilidade
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              registration.update().catch(() => {});
            }
          });

          // Monitorar ciclo de instalação
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[PWA] Nova versão detectada e pronta para ativação.');
                    window.dispatchEvent(new CustomEvent('pwa-update-available'));
                  } else {
                    console.log('[PWA] Conteúdo em cache para uso offline.');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', error);
        });

      // Quando o novo service worker assume o controle, recarregar suavemente a página
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}


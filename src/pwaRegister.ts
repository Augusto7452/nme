/**
 * Registro do Service Worker do PWA
 */

export function registrarServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Monitorar atualizações
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('Novo conteúdo disponível; feche e reabra o app para atualizar.');
                  } else {
                    console.log('Conteúdo em cache para uso offline.');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('Falha ao registrar Service Worker do PWA:', error);
        });
    });
  }
}

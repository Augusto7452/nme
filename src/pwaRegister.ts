/**
 * Registro e Checagem Automática de Atualizações do Service Worker (PWA)
 * Detecta novos deploys na Vercel e força o reload imediato da aplicação.
 */

const STORAGE_VERSION_KEY = 'dme_manifest_version';

// Função para checar versão remota do manifest.json com cache-busting
async function checarVersaoManifest(registration?: ServiceWorkerRegistration | null): Promise<void> {
  try {
    const timestamp = Date.now();
    const res = await fetch(`/manifest.json?_t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) return;

    const manifest = await res.json();
    const novaVersao = manifest?.version;

    if (!novaVersao) return;

    const versaoArmazenada = localStorage.getItem(STORAGE_VERSION_KEY);

    if (versaoArmazenada && versaoArmazenada !== novaVersao) {
      console.log(`[PWA] Nova versão detectada na Vercel: ${novaVersao} (Anterior: ${versaoArmazenada}). Forçando atualização...`);
      localStorage.setItem(STORAGE_VERSION_KEY, novaVersao);

      // Pede ao Service Worker para atualizar imediatamente
      if (registration) {
        try {
          await registration.update();
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        } catch {
          // ignora falha pontual de rede
        }
      }

      // Notifica e força recarga da página
      window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { version: novaVersao } }));

      // Forçar recarga automática
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return;
    }

    // Salva a versão atual no primeiro carregamento
    if (!versaoArmazenada) {
      localStorage.setItem(STORAGE_VERSION_KEY, novaVersao);
    }
  } catch (err) {
    // Falha silenciosa se offline
  }
}

export function registrarServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  let refreshing = false;

  // Forçar recarga quando o novo Service Worker assume o controle da página
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Novo Service Worker ativo. Recarregando aplicação...');
      window.location.reload();
    }
  });

  // Escutar mensagens diretas do Service Worker (ex: SW_UPDATED)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      console.log('[PWA] Notificação de nova versão recebida do Service Worker. Recarregando...');
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com sucesso.');

        // Checar versão do manifest logo após o carregamento
        checarVersaoManifest(registration);

        // Checar atualizações periodicamente (a cada 30 segundos)
        setInterval(() => {
          registration.update().catch(() => {});
          checarVersaoManifest(registration);
        }, 30 * 1000);

        // Checar atualizações quando o usuário focar ou retornar à aba
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
            checarVersaoManifest(registration);
          }
        });

        window.addEventListener('focus', () => {
          registration.update().catch(() => {});
          checarVersaoManifest(registration);
        });

        window.addEventListener('online', () => {
          registration.update().catch(() => {});
          checarVersaoManifest(registration);
        });

        // Monitorar ciclo de instalação de uma nova versão do Service Worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] Nova versão instalada na Vercel! Forçando ativação imediata...');
                  // Força o novo worker a assumir imediatamente sem esperar
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });

                  window.dispatchEvent(new CustomEvent('pwa-update-available'));

                  // Se após 1 segundo não houve controllerchange, forçar reload direto
                  setTimeout(() => {
                    if (!refreshing) {
                      refreshing = true;
                      window.location.reload();
                    }
                  }, 1200);
                } else {
                  console.log('[PWA] Aplicativo pronto para uso offline.');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', error);
      });
  });
}

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, dataService } from '../../../lib/supabase';
import { useAdminStore } from '../../../store/useAdminStore';

export const useAdminInit = () => {
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  // 1. Ciclo de Vida de Autenticação, Carregamento Inicial e Realtime Supabase (executa estritamente UMA vez)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let unsubscribeRealtime: (() => void) | null = null;

    const inicializarAdmin = async () => {
      const store = useAdminStore.getState();

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userId = session.user.id;
          const email = session.user.email || 'operador@anjosdapraia.org';
          const metaNome = session.user.user_metadata?.nome || 'Operador Central';

          store.setOperadorSession({
            operadorUserId: userId,
            operadorEmail: email,
            operadorNome: metaNome,
          });

          // Verificar dados do operador no Supabase
          const op = await dataService.obterOperador(userId);
          if (op) {
            if (op.status === 'bloqueado') {
              store.mostrarToast('erro', 'Acesso bloqueado pela coordenação.');
              await supabase.auth.signOut();
              navigate('/login', { replace: true });
              return;
            }

            store.setOperadorSession({
              operadorNome: op.nome || metaNome,
              operadorRole: op.role || 'operador',
              operadorStatus: op.status || 'ativo',
              operadorTendaId: op.tenda_id || null,
            });

            if (op.tenda_id) {
              const todasTendas = await dataService.listarTendas();
              const tendaAssociada = todasTendas.find(t => t.id === op.tenda_id);
              if (tendaAssociada) {
                store.setTendaOperador(tendaAssociada.nome);
                useAdminStore.setState({ tendaOperadorObj: tendaAssociada });
              }
            }
          }
        } else {
          navigate('/login', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar sessão do operador:', err);
        navigate('/login', { replace: true });
        return;
      }

      // Carregar dados das ocorrências, cadastros e equipe
      await Promise.all([
        store.carregarDados(),
        store.carregarOperadoresEConvites(),
      ]);

      // Assinar atualizações em tempo real via Supabase Realtime
      unsubscribeRealtime = dataService.subscribeOcorrencias((oco?: any) => {
        store.sincronizarOcorrenciaRealtime(oco);
      });
    };

    inicializarAdmin();

    return () => {
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
    };
  }, [navigate]);

  // 2. Solicitação de Permissão para Notificações Web Nativas
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 3. Gerenciamento do Ciclo de Vida PWA e Detecção Standalone
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const store = useAdminStore.getState();

    const checkIsRunningStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        store.setAppJaInstalado(true);
      }
    };

    checkIsRunningStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        store.setAppJaInstalado(true);
      }
    };

    try {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } catch {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      store.setDeferredPrompt(e);
      store.setPwaInstalavel(true);
      store.setAppJaInstalado(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      store.setPwaInstalavel(false);
      store.setDeferredPrompt(null);
      store.setAppJaInstalado(true);
      store.mostrarToast('sucesso', 'Aplicativo Anjos da Praia instalado com sucesso!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      try {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } catch {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);
};

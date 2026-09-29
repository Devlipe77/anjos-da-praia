import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, dataService } from '../../../lib/supabase';
import { useAdminStore } from '../../../store/useAdminStore';

export const useAdminInit = () => {
  const navigate = useNavigate();

  const {
    mostrarToast,
    carregarDados,
    carregarOperadoresEConvites,
    sincronizarOcorrenciaRealtime,
    setOperadorSession,
    setTendaOperador,
    setPwaInstalavel,
    setAppJaInstalado,
    setDeferredPrompt,
    loading,
    secaoAtiva,
  } = useAdminStore();

  // 1. Ciclo de Vida de Autenticação, Carregamento Inicial e Realtime Supabase
  useEffect(() => {
    let unsubscribeRealtime: (() => void) | null = null;

    const inicializarAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userId = session.user.id;
          const email = session.user.email || 'operador@anjosdapraia.org';
          const metaNome = session.user.user_metadata?.nome || 'Operador Central';

          setOperadorSession({
            operadorUserId: userId,
            operadorEmail: email,
            operadorNome: metaNome,
          });

          // Verificar dados do operador no Supabase
          const op = await dataService.obterOperador(userId);
          if (op) {
            if (op.status === 'bloqueado') {
              mostrarToast('erro', 'Acesso bloqueado pela coordenação.');
              await supabase.auth.signOut();
              navigate('/login', { replace: true });
              return;
            }

            setOperadorSession({
              operadorNome: op.nome || metaNome,
              operadorRole: op.role || 'operador',
              operadorStatus: op.status || 'ativo',
              operadorTendaId: op.tenda_id || null,
            });

            if (op.tenda_id) {
              const todasTendas = await dataService.listarTendas();
              const tendaAssociada = todasTendas.find(t => t.id === op.tenda_id);
              if (tendaAssociada) {
                setTendaOperador(tendaAssociada.nome);
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
        carregarDados(),
        carregarOperadoresEConvites(),
      ]);

      // Assinar atualizações em tempo real via Supabase Realtime
      unsubscribeRealtime = dataService.subscribeOcorrencias((oco?: any) => {
        sincronizarOcorrenciaRealtime(oco);
      });
    };

    inicializarAdmin();

    return () => {
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
    };
  }, [
    navigate,
    mostrarToast,
    carregarDados,
    carregarOperadoresEConvites,
    sincronizarOcorrenciaRealtime,
    setOperadorSession,
    setTendaOperador,
  ]);

  // 2. Solicitação de Permissão para Notificações Web Nativas
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 3. Gerenciamento do Ciclo de Vida PWA e Detecção Standalone
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar se já está rodando standalone (PWA instalado)
    const checkIsRunningStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        setAppJaInstalado(true);
      }
    };

    checkIsRunningStandalone();

    // Ouvir alterações dinâmicas de display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setAppJaInstalado(true);
      }
    };

    try {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } catch {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    // Capturar evento beforeinstallprompt nativo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstalavel(true);
      setAppJaInstalado(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Evento disparado quando o app é instalado com sucesso
    const handleAppInstalled = () => {
      setPwaInstalavel(false);
      setDeferredPrompt(null);
      setAppJaInstalado(true);
      mostrarToast('sucesso', 'Aplicativo Anjos da Praia instalado com sucesso!');
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
  }, [setAppJaInstalado, setPwaInstalavel, setDeferredPrompt, mostrarToast]);

  return {
    loading,
    secaoAtiva,
  };
};

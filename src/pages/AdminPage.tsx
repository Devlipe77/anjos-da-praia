import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Printer, 
  Bell, 
  PlusCircle, 
  Search, 
  Phone, 
  MessageCircle, 
  Navigation, 
  CheckCircle, 
  Clock, 
  QrCode, 
  Edit3, 
  Trash2, 
  LogOut, 
  Menu, 
  X, 
  RefreshCw, 
  LifeBuoy, 
  Sparkles,
  Filter,
  Calendar,
  Tent,
  AlertTriangle,
  User as UserIcon,
  UserCheck,
  Check,
  Flame,
  Crosshair,
  FileSpreadsheet,
  FileDown,
  Camera,
  BellRing,
  Volume2,
  VolumeX,
  Download,
  Smartphone,
  Laptop,
  ShieldCheck,
  History,
  Lock,
  Share2,
  Copy,
  KeyRound,
  Ticket,
  UserMinus,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import { dataService, supabase } from '../lib/supabase';
import { PulseiraCadastro, Ocorrencia, Tenda, StatusOcorrencia, traduzirErroSupabase, Praia, Operador, ConviteOperador } from '../types';
import { MapView } from '../components/MapView';
import { StatusBadge } from '../components/StatusBadge';
import { QRCodeModal, QRScannerModal } from '../components/QRCodeModal';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Seção ativa do menu lateral
  const [secaoAtiva, setSecaoAtiva] = useState<'dashboard' | 'monitoramento' | 'pulseiras' | 'tendas' | 'impressao' | 'relatorios' | 'usuarios'>('dashboard');
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Estados de dados principais
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [cadastros, setCadastros] = useState<PulseiraCadastro[]>([]);
  const [tendas, setTendas] = useState<Tenda[]>([]);
  const [operadoresLista, setOperadoresLista] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);

  // Operador atual logado
  const [operadorUserId, setOperadorUserId] = useState<string | null>(null);
  const [operadorEmail, setOperadorEmail] = useState<string>('operador@anjosdapraia.org');
  const [operadorNome, setOperadorNome] = useState<string>('Operador Central');
  const [operadorRole, setOperadorRole] = useState<'admin' | 'operador' | string>('operador');
  const [operadorStatus, setOperadorStatus] = useState<'ativo' | 'bloqueado' | string>('ativo');
  const [operadorTendaId, setOperadorTendaId] = useState<string | null>(null);
  const [tendaOperador, setTendaOperador] = useState<string>('Posto Praia do Morro');

  // Filtros de busca de pulseiras
  const [termoBuscaPulseira, setTermoBuscaPulseira] = useState('');

  // Filtros Operacionais de Monitoramento & Mapa
  const [filtroMonitorStatus, setFiltroMonitorStatus] = useState<'todos' | 'ativos' | 'concluidos'>('ativos');
  const [filtroMonitorSituacao, setFiltroMonitorSituacao] = useState<string>('todas');
  const [filtroMonitorTendaId, setFiltroMonitorTendaId] = useState<string>('todas');
  const [filtroMonitorBusca, setFiltroMonitorBusca] = useState<string>('');

  // Filtros do Dashboard
  const [filtroDashTendaId, setFiltroDashTendaId] = useState<string>('todas');
  const [filtroDashStatus, setFiltroDashStatus] = useState<'todos' | 'ativos' | 'concluidos'>('todos');
  const [filtroDashSituacao, setFiltroDashSituacao] = useState<string>('todas');

  // Filtros da Tela de Relatórios
  const [filtroRelatorioPraia, setFiltroRelatorioPraia] = useState<string>('todas');
  const [filtroRelatorioStatus, setFiltroRelatorioStatus] = useState<'todos' | 'ativos' | 'concluidos'>('todos');
  const [filtroRelatorioSituacao, setFiltroRelatorioSituacao] = useState<string>('todas');
  const [filtroRelatorioPeriodo, setFiltroRelatorioPeriodo] = useState<'tudo' | 'hoje' | '7dias' | '30dias'>('tudo');
  const [filtroRelatorioBusca, setFiltroRelatorioBusca] = useState<string>('');

  // Modais de Cadastro / Edição / Exclusão de Pulseira
  const [modalNovaPulseira, setModalNovaPulseira] = useState(false);
  const [modalEdicaoPulseira, setModalEdicaoPulseira] = useState<PulseiraCadastro | null>(null);
  const [modalExclusaoPulseira, setModalExclusaoPulseira] = useState<PulseiraCadastro | null>(null);

  // Modais de Tendas
  const [modalNovaTenda, setModalNovaTenda] = useState(false);
  const [modalEdicaoTenda, setModalEdicaoTenda] = useState<Tenda | null>(null);
  const [modalExclusaoTenda, setModalExclusaoTenda] = useState<Tenda | null>(null);

  // Modal de Exclusão de Ocorrência (Cancelar alarme falso)
  const [modalExclusaoOcorrencia, setModalExclusaoOcorrencia] = useState<Ocorrencia | null>(null);

  // Modal de Linha do Tempo / Histórico de Auditoria da Ocorrência
  const [modalHistoricoOcorrencia, setModalHistoricoOcorrencia] = useState<Ocorrencia | null>(null);

  // Modais de Operadores & Convites
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [formUsuarioNome, setFormUsuarioNome] = useState('');
  const [formUsuarioEmail, setFormUsuarioEmail] = useState('');
  const [formUsuarioSenha, setFormUsuarioSenha] = useState('');
  const [formUsuarioTendaId, setFormUsuarioTendaId] = useState('');
  const [formUsuarioRole, setFormUsuarioRole] = useState<'operador' | 'admin'>('operador');
  const [salvandoNovoUsuario, setSalvandoNovoUsuario] = useState(false);
  const [erroModalUsuario, setErroModalUsuario] = useState<string | null>(null);

  const [modalEdicaoOperador, setModalEdicaoOperador] = useState<Operador | null>(null);
  const [modalExclusaoOperador, setModalExclusaoOperador] = useState<Operador | null>(null);
  const [modalNovoConvite, setModalNovoConvite] = useState(false);
  const [convitesLista, setConvitesLista] = useState<ConviteOperador[]>([]);
  const [formConviteValidadeHoras, setFormConviteValidadeHoras] = useState(24);
  const [formConviteTendaId, setFormConviteTendaId] = useState('');
  const [formConviteRole, setFormConviteRole] = useState<'operador' | 'admin'>('operador');
  const [formConviteUsos, setFormConviteUsos] = useState(1);
  const [conviteGeradoRecente, setConviteGeradoRecente] = useState<ConviteOperador | null>(null);

  // Modal QR Code individual
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrNumero, setQrNumero] = useState('');
  const [qrCrianca, setQrCrianca] = useState<string | undefined>('');

  // Formulário Nova Pulseira
  const [formPulseiraNumero, setFormPulseiraNumero] = useState('');
  const [formPulseiraResponsavel, setFormPulseiraResponsavel] = useState('');
  const [formPulseiraTelefone, setFormPulseiraTelefone] = useState('');
  const [formPulseiraCrianca, setFormPulseiraCrianca] = useState('');
  const [formPulseiraPraia, setFormPulseiraPraia] = useState('Praia do Morro');
  const [formPulseiraObs, setFormPulseiraObs] = useState('');
  const [erroModalPulseira, setErroModalPulseira] = useState<string | null>(null);

  // Formulário Nova Tenda
  const [formTendaNome, setFormTendaNome] = useState('');
  const [formTendaPraia, setFormTendaPraia] = useState('Praia do Morro');
  const [formTendaLat, setFormTendaLat] = useState('-20.6590');
  const [formTendaLng, setFormTendaLng] = useState('-40.4950');
  const [formTendaResp, setFormTendaResp] = useState('');
  const [formTendaTel, setFormTendaTel] = useState('');
  const [erroModalTenda, setErroModalTenda] = useState<string | null>(null);

  // Configuração de Lote de Impressão
  const [loteInicio, setLoteInicio] = useState(1001);
  const [loteQuantidade, setLoteQuantidade] = useState(12);
  const [tipoImpressao, setTipoImpressao] = useState<'individual' | 'geral'>('individual');

  // Notificações Toast no Topo
  const [toast, setToast] = useState<{ tipo: 'erro' | 'sucesso'; mensagem: string } | null>(null);

  const showToast = (mensagem: string, tipo: 'erro' | 'sucesso' = 'erro') => {
    setToast({ tipo, mensagem });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Lista de Praias Oficiais de Guarapari
  const [praiasCadastradas, setPraiasCadastradas] = useState<Praia[]>([]);
  const [formTendaPraiaId, setFormTendaPraiaId] = useState<string | undefined>(undefined);

  // Lista de fallback completa com 32 praias oficiais de Guarapari com coordenadas reais
  const PRAIAS_GUARAPARI_PADRAO: Praia[] = useMemo(() => [
    { nome: 'Praia do Morro', regiao: 'Praia do Morro', latitude_padrao: -20.6552, longitude_padrao: -40.4880 },
    { nome: 'Praia das Castanheiras', regiao: 'Centro', latitude_padrao: -20.6720, longitude_padrao: -40.4975 },
    { nome: 'Praia da Areia Preta', regiao: 'Centro', latitude_padrao: -20.6765, longitude_padrao: -40.5005 },
    { nome: 'Praia dos Namorados', regiao: 'Centro', latitude_padrao: -20.6708, longitude_padrao: -40.4962 },
    { nome: 'Praia do Meio', regiao: 'Centro', latitude_padrao: -20.6740, longitude_padrao: -40.4990 },
    { nome: 'Praia das Virtudes', regiao: 'Centro', latitude_padrao: -20.6701, longitude_padrao: -40.4948 },
    { nome: 'Praia da Fonte', regiao: 'Centro', latitude_padrao: -20.6715, longitude_padrao: -40.4935 },
    { nome: 'Prainha de Muquiçaba', regiao: 'Muquiçaba', latitude_padrao: -20.6610, longitude_padrao: -40.5040 },
    { nome: 'Praia do Riacho', regiao: 'Ipiranga', latitude_padrao: -20.6900, longitude_padrao: -40.5120 },
    { nome: 'Praia de Bacutia', regiao: 'Enseada Azul', latitude_padrao: -20.7180, longitude_padrao: -40.5210 },
    { nome: 'Praia de Peracanga', regiao: 'Enseada Azul', latitude_padrao: -20.7130, longitude_padrao: -40.5190 },
    { nome: 'Praia de Guaibura', regiao: 'Enseada Azul', latitude_padrao: -20.7070, longitude_padrao: -40.5160 },
    { nome: 'Praia dos Padres', regiao: 'Enseada Azul', latitude_padrao: -20.7230, longitude_padrao: -40.5240 },
    { nome: 'Praia de Mucunã', regiao: 'Enseada Azul', latitude_padrao: -20.7095, longitude_padrao: -40.5175 },
    { nome: 'Praia de Meaípe', regiao: 'Meaípe', latitude_padrao: -20.7420, longitude_padrao: -40.5280 },
    { nome: 'Praia de Maimbá', regiao: 'Sul', latitude_padrao: -20.7550, longitude_padrao: -40.5350 },
    { nome: 'Praia de Porto Grande', regiao: 'Sul', latitude_padrao: -20.7620, longitude_padrao: -40.5420 },
    { nome: 'Praia de Ubu (Divisa)', regiao: 'Sul', latitude_padrao: -20.7890, longitude_padrao: -40.5750 },
    { nome: 'Praia da Cerca', regiao: 'Norte', latitude_padrao: -20.6480, longitude_padrao: -40.4820 },
    { nome: 'Praia de Santa Mônica', regiao: 'Santa Mônica', latitude_padrao: -20.6280, longitude_padrao: -40.4680 },
    { nome: 'Praia de Setiba', regiao: 'Setiba', latitude_padrao: -20.6120, longitude_padrao: -40.4500 },
    { nome: 'Praia de Setiba Pina', regiao: 'Setiba', latitude_padrao: -20.6080, longitude_padrao: -40.4460 },
    { nome: 'Praia de Setibão', regiao: 'Setiba', latitude_padrao: -20.6020, longitude_padrao: -40.4410 },
    { nome: 'Praia de Una', regiao: 'Norte', latitude_padrao: -20.5850, longitude_padrao: -40.4320 },
    { nome: 'Três Praias', regiao: 'Norte', latitude_padrao: -20.6380, longitude_padrao: -40.4720 },
    { nome: 'Praia dos Adventistas', regiao: 'Norte', latitude_padrao: -20.6330, longitude_padrao: -40.4690 },
    { nome: 'Praia do Morcego', regiao: 'Norte', latitude_padrao: -20.6410, longitude_padrao: -40.4750 },
    { nome: 'Praia de Mateus Lopes', regiao: 'Norte', latitude_padrao: -20.6360, longitude_padrao: -40.4710 },
    { nome: 'Praia do Ermitão', regiao: 'Morro da Pescaria', latitude_padrao: -20.6500, longitude_padrao: -40.4740 },
    { nome: 'Praia da Areia Vermelha', regiao: 'Morro da Pescaria', latitude_padrao: -20.6520, longitude_padrao: -40.4760 },
    { nome: 'Praia da Raposa', regiao: 'Morro da Pescaria', latitude_padrao: -20.6540, longitude_padrao: -40.4790 },
    { nome: 'Prainha dos Pescadores', regiao: 'Morro da Pescaria', latitude_padrao: -20.6560, longitude_padrao: -40.4810 }
  ], []);

  // Lista unificada de praias para os selects (combos)
  const listaPraiasAtivas = useMemo(() => {
    return praiasCadastradas.length > 0 ? praiasCadastradas : PRAIAS_GUARAPARI_PADRAO;
  }, [praiasCadastradas, PRAIAS_GUARAPARI_PADRAO]);

  // Presets de Praias e Coordenadas de Guarapari
  const PRESETS_GUARAPARI = [
    { nome: 'Praia do Morro (Central)', praia: 'Praia do Morro', lat: -20.6552, lng: -40.4880 },
    { nome: 'Pedra do Siribeira', praia: 'Praia do Morro', lat: -20.6525, lng: -40.4850 },
    { nome: 'Castanheiras', praia: 'Praia das Castanheiras', lat: -20.6720, lng: -40.4975 },
    { nome: 'Areia Preta', praia: 'Praia da Areia Preta', lat: -20.6765, lng: -40.5005 },
    { nome: 'Meaípe', praia: 'Praia de Meaípe', lat: -20.7420, lng: -40.5280 },
    { nome: 'Bacutia', praia: 'Praia de Bacutia', lat: -20.7180, lng: -40.5210 },
    { nome: 'Setiba', praia: 'Praia de Setiba', lat: -20.6120, lng: -40.4500 },
  ];

  // Estado de captura de GPS para tendas
  const [capturandoGpsTenda, setCapturandoGpsTenda] = useState(false);

  const handleCapturarGpsDispositivo = (callback: (lat: number, lng: number) => void) => {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não suportada neste navegador.');
      return;
    }
    setCapturandoGpsTenda(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCapturandoGpsTenda(false);
        callback(
          parseFloat(pos.coords.latitude.toFixed(6)),
          parseFloat(pos.coords.longitude.toFixed(6))
        );
      },
      (err) => {
        setCapturandoGpsTenda(false);
        console.warn('GPS não capturado:', err);
        alert('Não foi possível obter o GPS com precisão. Verifique a permissão de localização do navegador.');
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  };

  // Som de Alerta & Notificações Nativas
  const [somAtivado, setSomAtivado] = useState(true);
  const [scannerAdminAberto, setScannerAdminAberto] = useState(false);

  // Suporte à Instalação PWA (Desktop e Mobile)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalavel, setPwaInstalavel] = useState(false);
  const [appJaInstalado, setAppJaInstalado] = useState(false);

  useEffect(() => {
    // 1. Detectar se a janela atual JÁ está rodando no modo aplicativo PWA instalado
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

    // 2. Ouvir mudança de display-mode dinamicamente (se o usuário abrir o app)
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

    // 3. Capturar o evento nativo beforeinstallprompt do Chrome/Edge/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstalavel(true);
      setAppJaInstalado(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Evento disparado imediatamente após a instalação ser concluída no SO
    const handleAppInstalled = () => {
      setPwaInstalavel(false);
      setDeferredPrompt(null);
      setAppJaInstalado(true);
      showToast('Aplicativo Anjos da Praia instalado com sucesso!', 'sucesso');
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

  const handleInstalarPWA = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setPwaInstalavel(false);
          setAppJaInstalado(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Erro ao acionar prompt de instalação:', err);
      }
    } else {
      // Instrução específica conforme o sistema operacional mobile ou desktop
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);

      if (isIOS) {
        alert('Para instalar no iPhone/iPad:\n1. Toque no botão "Compartilhar" (ícone de quadrado com seta para cima no Safari)\n2. Role para baixo e toque em "Adicionar à Tela de Início" (+).');
      } else if (isAndroid) {
        alert('Para instalar no Android:\n1. Toque nos três pontinhos (⋮) no canto superior do Chrome\n2. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
      } else {
        alert('Para instalar no Computador (Chrome/Edge):\n1. Clique no ícone de instalação (computadorzinho com seta) na barra de endereços do navegador\n2. Ou clique nos três pontinhos (⋮) > "Instalar Anjos da Praia".');
      }
    }
  };

  // Solicitar permissão para Notificações Web nativas no carregamento
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Disparo de sirene/alerta sonoro tático para novos chamados
  const tocarBipAlerta = () => {
    if (!somAtivado) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Bip duplo de atenção
      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + dur);
      };

      playTone(880, 0, 0.2);
      playTone(1174, 0.25, 0.3); // Nota Ré aguda (alerta CBMES)
    } catch (e) {
      console.warn('Audio não suportado ou bloqueado pelo navegador.');
    }
  };

  const dispararNotificacaoPush = (titulo: string, corpo: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(titulo, {
          body: corpo,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Falha ao exibir notificação nativa:', e);
      }
    }
  };

  // Carregar dados de produção
  const carregarDados = async (tocarSom = false) => {
    try {
      const [ocos, cads, tens, ops, prs, convs] = await Promise.all([
        dataService.listarOcorrencias(),
        dataService.listarCadastros(),
        dataService.listarTendas(),
        dataService.listarOperadores(),
        dataService.listarPraias(),
        dataService.listarConvites()
      ]);

      if (prs && prs.length > 0) {
        setPraiasCadastradas(prs);
      }

      // Enriquecer ocorrências com o cadastro da pulseira
      if (ocos.length > 0 && cads.length > 0) {
        const cadsMap = new Map<string, PulseiraCadastro>();
        cads.forEach(c => cadsMap.set(c.numero_pulseira, c));
        ocos.forEach(o => {
          o.cadastro = cadsMap.get(o.numero_pulseira);
        });
      }

      // Calcular tenda mais próxima
      if (ocos.length > 0 && tens.length > 0) {
        ocos.forEach(o => {
          o.tendaMaisProxima = dataService.calcularTendaMaisProxima(
            Number(o.latitude),
            Number(o.longitude),
            tens
          );
        });
      }

      setOcorrencias(ocos);
      setCadastros(cads);
      setTendas(tens);
      setOperadoresLista(ops);
      setConvitesLista(convs);

      // Reconciliar o nome da tenda do operador caso já tenhamos o tenda_id
      if (operadorTendaId) {
        const found = tens.find(t => t.id === operadorTendaId);
        if (found) setTendaOperador(found.nome);
      }

      if (ocos.length > 0 && !selectedOcorrencia) {
        setSelectedOcorrencia(ocos[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar sessão do operador e dados na tabela operadores
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setOperadorUserId(session.user.id);
        setOperadorEmail(session.user.email || 'operador@anjosdapraia.org');
        const metaNome = session.user.user_metadata?.nome;
        if (metaNome) setOperadorNome(metaNome);

        // Buscar dados do operador no Supabase
        const op = await dataService.obterOperador(session.user.id);
        if (op) {
          if (op.nome) setOperadorNome(op.nome);
          if (op.role) setOperadorRole(op.role);
          if (op.status) setOperadorStatus(op.status);

          // Se estiver bloqueado, desloga imediatamente
          if (op.status === 'bloqueado') {
            await dataService.fazerLogout();
            navigate('/login', { replace: true });
            return;
          }

          if (op.tenda_id) {
            setOperadorTendaId(op.tenda_id);
            // Se já carregou tendas, encontra o nome
            const todasTendas = await dataService.listarTendas();
            const tendaAssociada = todasTendas.find(t => t.id === op.tenda_id);
            if (tendaAssociada) {
              setTendaOperador(tendaAssociada.nome);
            }
          }
        }
      } else {
        navigate('/login', { replace: true });
      }
    });

    carregarDados();

    // Escuta em tempo real via Supabase Realtime
    const unsubscribe = dataService.subscribeOcorrencias(() => {
      carregarDados(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await dataService.fazerLogout();
    navigate('/login', { replace: true });
  };

  // Cadastros filtrados
  const cadastrosFiltrados = useMemo(() => {
    const q = termoBuscaPulseira.toLowerCase().trim();
    if (!q) return cadastros;
    return cadastros.filter(c => 
      c.numero_pulseira.toLowerCase().includes(q) ||
      c.nome_responsavel.toLowerCase().includes(q) ||
      (c.nome_crianca && c.nome_crianca.toLowerCase().includes(q)) ||
      c.telefone_contato.includes(q)
    );
  }, [cadastros, termoBuscaPulseira]);

  // Contadores globais
  const chamadosAtivos = useMemo(() => ocorrencias.filter(o => o.status !== 'Reencontro realizado'), [ocorrencias]);
  const chamadosConcluidos = useMemo(() => ocorrencias.filter(o => o.status === 'Reencontro realizado'), [ocorrencias]);

  // 1. Ocorrências Filtradas no Monitoramento / Mapa
  const ocorrenciasMonitoramento = useMemo(() => {
    return ocorrencias.filter(o => {
      // Filtro de Status
      if (filtroMonitorStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
      if (filtroMonitorStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

      // Filtro de Situação / Etapa
      if (filtroMonitorSituacao !== 'todas' && o.status !== filtroMonitorSituacao) return false;

      // Filtro de Tenda
      if (filtroMonitorTendaId !== 'todas') {
        const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
        if (tendaIdOco !== filtroMonitorTendaId) return false;
      }

      // Filtro de Busca Texto (Pulseira, Criança, Responsável, Telefone)
      if (filtroMonitorBusca.trim()) {
        const q = filtroMonitorBusca.toLowerCase().trim();
        const pulseiraMatch = o.numero_pulseira.toLowerCase().includes(q);
        const criancaMatch = o.cadastro?.nome_crianca?.toLowerCase().includes(q);
        const respMatch = o.cadastro?.nome_responsavel?.toLowerCase().includes(q);
        const telMatch = o.cadastro?.telefone_contato?.includes(q);
        if (!pulseiraMatch && !criancaMatch && !respMatch && !telMatch) return false;
      }

      return true;
    });
  }, [ocorrencias, filtroMonitorStatus, filtroMonitorSituacao, filtroMonitorTendaId, filtroMonitorBusca]);

  // 2. Ocorrências Filtradas no Dashboard
  const ocorrenciasDashboard = useMemo(() => {
    return ocorrencias.filter(o => {
      if (filtroDashStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
      if (filtroDashStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

      // Filtro de Situação / Etapa
      if (filtroDashSituacao !== 'todas' && o.status !== filtroDashSituacao) return false;

      if (filtroDashTendaId !== 'todas') {
        const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
        if (tendaIdOco !== filtroDashTendaId) return false;
      }
      return true;
    });
  }, [ocorrencias, filtroDashStatus, filtroDashSituacao, filtroDashTendaId]);

  // KPIs do Dashboard Reativos ao Filtro de Tenda
  const dashCadastrosCount = useMemo(() => {
    if (filtroDashTendaId === 'todas') return cadastros.length;
    return cadastros.filter(c => c.tenda_id === filtroDashTendaId).length;
  }, [cadastros, filtroDashTendaId]);

  const dashAtivosCount = useMemo(() => {
    return ocorrenciasDashboard.filter(o => o.status !== 'Reencontro realizado').length;
  }, [ocorrenciasDashboard]);

  const dashConcluidosCount = useMemo(() => {
    return ocorrenciasDashboard.filter(o => o.status === 'Reencontro realizado').length;
  }, [ocorrenciasDashboard]);

  // 3. Ocorrências Filtradas na Tela de Relatórios
  const ocorrenciasRelatorios = useMemo(() => {
    const agora = new Date().getTime();
    return ocorrencias.filter(o => {
      // Filtro de Praia
      if (filtroRelatorioPraia !== 'todas') {
        const praiaOco = o.cadastro?.praia_origem || o.tendaMaisProxima?.tenda?.praia;
        if (praiaOco !== filtroRelatorioPraia) return false;
      }

      // Filtro de Status
      if (filtroRelatorioStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
      if (filtroRelatorioStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

      // Filtro de Situação / Etapa
      if (filtroRelatorioSituacao !== 'todas' && o.status !== filtroRelatorioSituacao) return false;

      // Filtro de Período
      if (filtroRelatorioPeriodo !== 'tudo') {
        const dataOco = new Date(o.horario_alerta).getTime();
        const diffHoras = (agora - dataOco) / (1000 * 60 * 60);
        if (filtroRelatorioPeriodo === 'hoje' && diffHoras > 24) return false;
        if (filtroRelatorioPeriodo === '7dias' && diffHoras > 24 * 7) return false;
        if (filtroRelatorioPeriodo === '30dias' && diffHoras > 24 * 30) return false;
      }

      // Filtro de Busca
      if (filtroRelatorioBusca.trim()) {
        const q = filtroRelatorioBusca.toLowerCase().trim();
        const pulseiraMatch = o.numero_pulseira.toLowerCase().includes(q);
        const criancaMatch = o.cadastro?.nome_crianca?.toLowerCase().includes(q);
        const respMatch = o.cadastro?.nome_responsavel?.toLowerCase().includes(q);
        const telMatch = o.cadastro?.telefone_contato?.includes(q);
        if (!pulseiraMatch && !criancaMatch && !respMatch && !telMatch) return false;
      }

      return true;
    });
  }, [ocorrencias, filtroRelatorioPraia, filtroRelatorioStatus, filtroRelatorioSituacao, filtroRelatorioPeriodo, filtroRelatorioBusca]);

  // Submeter nova pulseira
  const handleCadastrarPulseira = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPulseiraNumero.trim() || !formPulseiraResponsavel.trim() || !formPulseiraTelefone.trim()) return;

    try {
      const nova = await dataService.cadastrarPulseira({
        numero_pulseira: formPulseiraNumero.trim(),
        nome_responsavel: formPulseiraResponsavel.trim(),
        telefone_contato: formPulseiraTelefone.trim(),
        nome_crianca: formPulseiraCrianca.trim() || undefined,
        praia_origem: formPulseiraPraia,
        observacoes: formPulseiraObs.trim() || undefined,
      });

      setCadastros([nova, ...cadastros]);
      setModalNovaPulseira(false);
      setFormPulseiraNumero('');
      setFormPulseiraResponsavel('');
      setFormPulseiraTelefone('');
      setFormPulseiraCrianca('');
      setFormPulseiraObs('');
      setErroModalPulseira(null);
      showToast('Pulseira cadastrada com sucesso!', 'sucesso');
    } catch (err: any) {
      const msg = traduzirErroSupabase(err);
      setErroModalPulseira(msg);
      showToast(msg, 'erro');
    }
  };

  // Salvar edição de pulseira
  const handleSalvarEdicaoPulseira = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicaoPulseira?.id) return;

    try {
      const atualizada = await dataService.atualizarPulseira(modalEdicaoPulseira.id, {
        nome_responsavel: modalEdicaoPulseira.nome_responsavel,
        telefone_contato: modalEdicaoPulseira.telefone_contato,
        nome_crianca: modalEdicaoPulseira.nome_crianca,
        praia_origem: modalEdicaoPulseira.praia_origem,
        observacoes: modalEdicaoPulseira.observacoes,
      });

      setCadastros(cadastros.map(c => c.id === atualizada.id ? atualizada : c));
      setModalEdicaoPulseira(null);
      showToast('Cadastro atualizado com sucesso!', 'sucesso');
    } catch (err: any) {
      showToast(traduzirErroSupabase(err), 'erro');
    }
  };

  // Confirmar exclusão de pulseira
  const handleExcluirPulseira = async () => {
    if (!modalExclusaoPulseira?.id) return;
    try {
      await dataService.excluirPulseira(modalExclusaoPulseira.id);
      setCadastros(cadastros.filter(c => c.id !== modalExclusaoPulseira.id));
      setModalExclusaoPulseira(null);
      showToast('Pulseira removida com sucesso.', 'sucesso');
    } catch (err: any) {
      showToast(traduzirErroSupabase(err), 'erro');
    }
  };

  // Mudar status de ocorrência
  const handleMudarStatus = async (ocoId: string, novoStatus: StatusOcorrencia, ocoAtual?: Ocorrencia) => {
    if (ocoAtual && ocoAtual.status === 'Reencontro realizado') {
      showToast('Esta ocorrência já foi finalizada e não pode ser alterada.', 'erro');
      return;
    }

    try {
      await dataService.atualizarStatusOcorrencia(
        ocoId, 
        novoStatus, 
        operadorNome, 
        undefined, 
        undefined, 
        ocoAtual?.historico_status
      );
      if (novoStatus === 'Reencontro realizado') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      await carregarDados();
      showToast(`Status atualizado para: ${novoStatus}`, 'sucesso');
    } catch (err: any) {
      showToast(traduzirErroSupabase(err), 'erro');
    }
  };

  // Excluir ocorrência (cancelar alarme falso)
  const handleExcluirOcorrencia = async () => {
    if (!modalExclusaoOcorrencia?.id) return;
    try {
      await dataService.excluirOcorrencia(modalExclusaoOcorrencia.id);
      setOcorrencias(ocorrencias.filter(o => o.id !== modalExclusaoOcorrencia.id));
      setModalExclusaoOcorrencia(null);
      showToast('Ocorrência removida do sistema.', 'sucesso');
    } catch (err: any) {
      showToast(traduzirErroSupabase(err), 'erro');
    }
  };

  // Submeter nova tenda
  const handleCadastrarTenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTendaNome.trim() || !formTendaPraia.trim()) return;

    try {
      const nova = await dataService.criarTenda({
        nome: formTendaNome.trim(),
        praia: formTendaPraia.trim(),
        praia_id: formTendaPraiaId || null,
        latitude: parseFloat(formTendaLat) || -20.6590,
        longitude: parseFloat(formTendaLng) || -40.4950,
        responsavel_posto: formTendaResp.trim() || undefined,
        telefone_posto: formTendaTel.trim() || undefined,
        ativa: true,
      });

      setTendas([...tendas, nova]);
      setModalNovaTenda(false);
      setFormTendaNome('');
      setFormTendaResp('');
      setFormTendaTel('');
      setFormTendaPraiaId(undefined);
      setErroModalTenda(null);
      showToast('Posto cadastrado com sucesso!', 'sucesso');
    } catch (err: any) {
      const msg = traduzirErroSupabase(err);
      setErroModalTenda(msg);
      showToast(msg, 'erro');
    }
  };

  // Salvar edição de tenda
  const handleSalvarEdicaoTenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicaoTenda?.id) return;

    try {
      const atualizada = await dataService.atualizarTenda(modalEdicaoTenda.id, {
        nome: modalEdicaoTenda.nome,
        praia: modalEdicaoTenda.praia,
        praia_id: modalEdicaoTenda.praia_id || null,
        latitude: parseFloat(String(modalEdicaoTenda.latitude)) || 0,
        longitude: parseFloat(String(modalEdicaoTenda.longitude)) || 0,
        responsavel_posto: modalEdicaoTenda.responsavel_posto,
        telefone_posto: modalEdicaoTenda.telefone_posto,
        ativa: modalEdicaoTenda.ativa,
      });

      setTendas(tendas.map(t => t.id === atualizada.id ? atualizada : t));
      setModalEdicaoTenda(null);
      showToast('Posto atualizado com sucesso!', 'sucesso');
    } catch (err: any) {
      showToast(traduzirErroSupabase(err), 'erro');
    }
  };

  // Excluir tenda
  const handleExcluirTenda = async () => {
    if (!modalExclusaoTenda?.id) return;
    try {
      await dataService.excluirTenda(modalExclusaoTenda.id);
      setTendas(tendas.filter(t => t.id !== modalExclusaoTenda.id));
      setModalExclusaoTenda(null);
      showToast('Posto excluído com sucesso.', 'sucesso');
    } catch (err: any) {
      showToast(traduzirErroSupabase(err), 'erro');
    }
  };

  const formatarWhatsapp = (tel: string) => {
    const limpo = tel.replace(/\D/g, '');
    return limpo.startsWith('55') ? limpo : `55${limpo}`;
  };

  // Formatação completa e exata da data e hora: dd/mm/aaaa hh:mm:ss
  const formatarDataHora = (dataIso?: string | null) => {
    if (!dataIso) return '-';
    try {
      const d = new Date(dataIso);
      if (isNaN(d.getTime())) return dataIso;
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const horas = String(d.getHours()).padStart(2, '0');
      const minutos = String(d.getMinutes()).padStart(2, '0');
      const segundos = String(d.getSeconds()).padStart(2, '0');
      return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    } catch {
      return dataIso;
    }
  };

  // Exportação de Relatório Geral em formato CSV para a Associação e Parceiros
  const exportarRelatorioCSV = () => {
    try {
      const listaParaExportar = secaoAtiva === 'relatorios' ? ocorrenciasRelatorios : ocorrencias;

      const headers = [
        'ID Ocorrencia',
        'Numero Pulseira',
        'Crianca',
        'Responsavel',
        'Telefone',
        'Status',
        'Horario Alerta',
        'Latitude',
        'Longitude',
        'Tenda Mais Proxima',
        'Distancia (m)'
      ];

      const linhas = listaParaExportar.map(oco => [
        `"${oco.id || ''}"`,
        `"${oco.numero_pulseira || ''}"`,
        `"${oco.cadastro?.nome_crianca || 'Nao identificado'}"`,
        `"${oco.cadastro?.nome_responsavel || ''}"`,
        `"${oco.cadastro?.telefone_contato || ''}"`,
        `"${oco.status || ''}"`,
        `"${oco.horario_alerta ? new Date(oco.horario_alerta).toLocaleString('pt-BR') : ''}"`,
        `"${oco.latitude || ''}"`,
        `"${oco.longitude || ''}"`,
        `"${oco.tendaMaisProxima?.tenda?.nome || 'N/A'}"`,
        `"${oco.tendaMaisProxima?.distanciaMetros || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...linhas.map(l => l.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_anjos_da_praia_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Relatório CSV exportado com sucesso!', 'sucesso');
    } catch (e: any) {
      showToast('Erro ao gerar relatório CSV: ' + e.message, 'erro');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#1A1D1F]">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR LATERAL FIXO (MENU À ESQUERDA) */}
      {/* ========================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
        sidebarAberta ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo & Identidade */}
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-md p-1.5 overflow-hidden">
                <img 
                  src="https://agpynfhvmyaiupynrznx.supabase.co/storage/v1/object/public/padrao/wings.png" 
                  alt="Anjos da Praia Logo" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-contain filter brightness-0 invert" 
                />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-[#1A1D1F] leading-none">
                  ANJOS DA PRAIA
                </div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mt-0.5">
                  Guarapari • ES
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSidebarAberta(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#6B7280] hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Posto Ativo Indicator */}
          <div className="px-4 py-3 bg-[#F9F1E7] border-b border-[#E5E7EB] flex items-center gap-2 text-xs">
            <Tent className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Posto em Operação:</span>
              <span className="font-extrabold text-[#1A1D1F] truncate block">{tendaOperador}</span>
            </div>
          </div>

          {/* Itens de Navegação */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => { setSecaoAtiva('dashboard'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'dashboard'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard (Home)</span>
              </div>
            </button>

            <button
              onClick={() => { setSecaoAtiva('monitoramento'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'monitoramento'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Monitoramento & Mapa</span>
              </div>
              {chamadosAtivos.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  secaoAtiva === 'monitoramento' ? 'bg-white text-[#FF6B35]' : 'bg-[#DC2626] text-white animate-pulse'
                }`}>
                  {chamadosAtivos.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setSecaoAtiva('pulseiras'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'pulseiras'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Pulseiras & Cadastros</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-[#6B7280] font-bold px-1.5 py-0.5 rounded-full">
                {cadastros.length}
              </span>
            </button>

            <button
              onClick={() => { setSecaoAtiva('tendas'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'tendas'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tent className="w-4 h-4" />
                <span>Tendas & Postos</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-[#6B7280] font-bold px-1.5 py-0.5 rounded-full">
                {tendas.length}
              </span>
            </button>

            <button
              onClick={() => { setSecaoAtiva('impressao'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'impressao'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4" />
                <span>Emissão em Lote</span>
              </div>
            </button>

            <button
              onClick={() => { setSecaoAtiva('relatorios'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'relatorios'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Relatórios & Praias</span>
              </div>
            </button>

            <button
              onClick={() => { setSecaoAtiva('usuarios'); setSidebarAberta(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                secaoAtiva === 'usuarios'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9F1E7] hover:text-[#1A1D1F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Equipe & Usuários</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                operadorRole === 'admin' ? 'bg-[#EFF6FF] text-[#0B6EFD]' : 'bg-slate-100 text-[#6B7280]'
              }`}>
                {operadoresLista.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Rodapé do Operador Logado */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0B6EFD] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-xs font-bold text-[#1A1D1F] truncate" title={operadorNome}>
                {operadorNome}
              </div>
              <div className="text-[10px] text-[#6B7280] truncate" title={operadorEmail}>
                {operadorEmail}
              </div>
              <div className="pt-0.5">
                <span 
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold text-white shadow-xs tracking-wide ${
                    operadorRole === 'admin' 
                      ? 'bg-[#0B6EFD]' 
                      : 'bg-slate-600'
                  }`}
                  title={operadorRole === 'admin' ? 'Perfil: Coordenador Geral' : 'Perfil: Voluntário / Operador'}
                >
                  {operadorRole === 'admin' ? (
                    <>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Coordenador</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>Voluntário</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-white hover:bg-red-50 text-[#DC2626] border border-[#E5E7EB] hover:border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. ÁREA PRINCIPAL DE CONTEÚDO (DIREITA) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Topbar Superior */}
        <header className="min-h-16 py-2.5 bg-white border-b border-[#E5E7EB] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarAberta(true)}
              className="lg:hidden p-2 rounded-xl text-[#6B7280] hover:bg-slate-100 flex-shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-xs sm:text-base md:text-lg font-black text-[#1A1D1F] tracking-tight truncate">
              {secaoAtiva === 'dashboard' && 'Visão Geral da Operação'}
              {secaoAtiva === 'monitoramento' && 'Central de Monitoramento'}
              {secaoAtiva === 'pulseiras' && 'Gerenciamento de Pulseiras'}
              {secaoAtiva === 'tendas' && 'Postos de Atendimento'}
              {secaoAtiva === 'impressao' && 'Emissão de Pulseiras'}
              {secaoAtiva === 'relatorios' && 'Relatórios e Indicadores'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Botão de Instalar Aplicativo (PWA) */}
            {!appJaInstalado && (
              <button
                onClick={handleInstalarPWA}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#FFF4EE] hover:bg-[#FFE8DC] text-[#FF6B35] border border-[#FFD8C2] rounded-xl text-xs font-bold transition-colors shadow-sm"
                title="Instalar Anjos da Praia como aplicativo no computador ou celular"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
              </button>
            )}

            {/* Botão de Scanner de Câmera no Admin */}
            <button
              onClick={() => setScannerAdminAberto(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] border border-[#E5E7EB] rounded-xl text-xs font-bold transition-colors"
              title="Ler QR Code da pulseira pela câmera do dispositivo"
            >
              <Camera className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span className="hidden md:inline">Ler Pulseira</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={exportarRelatorioCSV}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              title="Exportar dados consolidados em planilha CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Status do Supabase Realtime */}
            <span className="hidden md:inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping"></span>
              <span>Supabase Realtime Ativo</span>
            </span>

            {/* Alternador de Sirene / Som de Alerta (ao lado do status e sincronizar) */}
            <button
              onClick={() => setSomAtivado(!somAtivado)}
              className={`p-2 rounded-xl border transition-colors ${
                somAtivado 
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]' 
                  : 'bg-slate-100 text-[#6B7280] border-[#E5E7EB]'
              }`}
              title={somAtivado ? 'Alerta sonoro ativado' : 'Alerta sonoro mudo'}
            >
              {somAtivado ? <Volume2 className="w-4 h-4 text-[#FF6B35]" /> : <VolumeX className="w-4 h-4 text-[#6B7280]" />}
            </button>

            {/* Sincronizar dados */}
            <button
              onClick={() => carregarDados()}
              className="p-2 rounded-xl text-[#6B7280] hover:bg-slate-100 border border-[#E5E7EB] transition-colors"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Toast Notificação de Retorno */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-3 duration-200 shadow-2xl">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              toast.tipo === 'erro'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className={`p-1.5 rounded-xl ${toast.tipo === 'erro' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {toast.tipo === 'erro' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-black text-sm mb-0.5">
                  {toast.tipo === 'erro' ? 'Atenção Operacional' : 'Operação Concluída'}
                </div>
                <p className="leading-relaxed font-medium">{toast.mensagem}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo Dinâmico da Seção (Expandido para 100% da tela) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">

          {/* ===================================================== */}
          {/* SEÇÃO 1: 📊 DASHBOARD (HOME DO ADMIN) */}
          {/* ===================================================== */}
          {secaoAtiva === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Barra de Filtro Rápido do Dashboard */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#0B6EFD]">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1A1D1F]">Filtro de Operação</span>
                    <p className="text-[10px] text-[#6B7280]">Restrinja a visão geral a uma tenda ou status específico</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Seletor de Tenda / Praia */}
                  <div className="relative">
                    <select
                      value={filtroDashTendaId}
                      onChange={(e) => setFiltroDashTendaId(e.target.value)}
                      className="text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
                    >
                      <option value="todas">📍 Toda Guarapari (Geral)</option>
                      {operadorTendaId && (
                        <option value={operadorTendaId}>⭐ Meu Posto Atual</option>
                      )}
                      {tendas.map(t => (
                        <option key={t.id} value={t.id}>{t.nome} ({t.praia})</option>
                      ))}
                    </select>
                  </div>

                  {/* Seletor de Situação / Etapa */}
                  <div className="relative">
                    <select
                      value={filtroDashSituacao}
                      onChange={(e) => setFiltroDashSituacao(e.target.value)}
                      className="text-xs font-bold py-1.5 px-3 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
                      title="Filtrar por etapa ou situação da ocorrência"
                    >
                      <option value="todas">📋 Todas as Situações</option>
                      <option value="Criança localizada">⚠️ Criança localizada</option>
                      <option value="Equipe a caminho">🏃 Equipe a caminho</option>
                      <option value="Criança recebida">🛡️ Criança na tenda</option>
                      <option value="Responsáveis localizados">👤 Pais contatados</option>
                      <option value="Reencontro realizado">🎉 Reencontro realizado</option>
                    </select>
                  </div>

                  {/* Pílulas de Status */}
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setFiltroDashStatus('todos')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        filtroDashStatus === 'todos' ? 'bg-white text-[#1A1D1F] shadow-xs' : 'text-[#6B7280]'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFiltroDashStatus('ativos')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        filtroDashStatus === 'ativos' ? 'bg-[#FF6B35] text-white shadow-xs' : 'text-[#6B7280]'
                      }`}
                    >
                      🔥 Ativos ({chamadosAtivos.length})
                    </button>
                    <button
                      onClick={() => setFiltroDashStatus('concluidos')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        filtroDashStatus === 'concluidos' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#6B7280]'
                      }`}
                    >
                      ✅ Concluídos
                    </button>
                  </div>

                  {(filtroDashTendaId !== 'todas' || filtroDashStatus !== 'todos' || filtroDashSituacao !== 'todas') && (
                    <button
                      onClick={() => {
                        setFiltroDashTendaId('todas');
                        setFiltroDashStatus('todos');
                        setFiltroDashSituacao('todas');
                      }}
                      className="text-xs font-bold text-[#DC2626] hover:underline px-1"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* KPIs Principais Reativos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#6B7280] text-xs font-bold uppercase mb-2">
                    <span>Crianças Cadastradas</span>
                    <Users className="w-4 h-4 text-[#0B6EFD]" />
                  </div>
                  <div className="text-3xl font-black text-[#1A1D1F]">{dashCadastrosCount}</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    {filtroDashTendaId === 'todas' ? 'Total em todas as tendas' : 'Cadastradas neste posto'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#B45309] text-xs font-bold uppercase mb-2">
                    <span>Alertas em Aberto</span>
                    <Bell className="w-4 h-4 text-[#FF6B35]" />
                  </div>
                  <div className="text-3xl font-black text-[#FF6B35]">{dashAtivosCount}</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">Aguardando reencontro</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#15803D] text-xs font-bold uppercase mb-2">
                    <span>Reencontros Feitos</span>
                    <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="text-3xl font-black text-[#16A34A]">{dashConcluidosCount}</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Taxa: {ocorrenciasDashboard.length > 0 ? Math.round((dashConcluidosCount / ocorrenciasDashboard.length) * 100) : 100}% de sucesso
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#0B6EFD] text-xs font-bold uppercase mb-2">
                    <span>Tempo Médio GPS</span>
                    <Clock className="w-4 h-4 text-[#0B6EFD]" />
                  </div>
                  <div className="text-3xl font-black text-[#0B6EFD]">&lt; 4 min</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">Graças à rota geodésica imediata</p>
                </div>

              </div>

              {/* Bloco 2: Ocorrências Recentes e Distribuição */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Tabela Resumida de Ocorrências com Filtro */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#FF6B35]" />
                      <h2 className="text-sm font-extrabold text-[#1A1D1F]">
                        Últimos Chamados em Tempo Real
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#6B7280]">
                        {ocorrenciasDashboard.length} exibidos
                      </span>
                    </div>
                    <button
                      onClick={() => setSecaoAtiva('monitoramento')}
                      className="text-xs font-bold text-[#0B6EFD] hover:underline"
                    >
                      Abrir Mapa Completo →
                    </button>
                  </div>

                  {ocorrenciasDashboard.length === 0 ? (
                    <div className="py-12 text-center text-[#6B7280]">
                      <CheckCircle className="w-10 h-10 text-[#16A34A] mx-auto mb-2 opacity-80" />
                      <div className="font-bold text-sm text-[#1A1D1F]">Nenhuma ocorrência encontrada</div>
                      <p className="text-xs mt-1">Nenhum chamado corresponde ao filtro selecionado.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#1A1D1F]">
                        <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase font-semibold border-b border-[#E5E7EB]">
                          <tr>
                            <th className="py-2.5 px-3">Pulseira</th>
                            <th className="py-2.5 px-3">Criança / Responsável</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Tenda Próxima</th>
                            <th className="py-2.5 px-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                          {ocorrenciasDashboard.slice(0, 6).map((oco) => (
                            <tr key={oco.id} className="hover:bg-[#F9FAFB]">
                              <td className="py-3 px-3 font-mono font-black text-[#FF6B35]">
                                #{oco.numero_pulseira}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold">{oco.cadastro?.nome_crianca || 'Não identificado'}</div>
                                <div className="text-[11px] text-[#6B7280]">{oco.cadastro?.nome_responsavel || '-'}</div>
                              </td>
                              <td className="py-3 px-3">
                                <StatusBadge status={oco.status} size="sm" />
                              </td>
                              <td className="py-3 px-3 text-[11px] text-[#6B7280]">
                                {oco.tendaMaisProxima ? `${oco.tendaMaisProxima.tenda.nome} (~${oco.tendaMaisProxima.distanciaMetros}m)` : '-'}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedOcorrencia(oco);
                                    setSecaoAtiva('monitoramento');
                                  }}
                                  className="text-xs font-bold text-[#0B6EFD] hover:underline"
                                >
                                  Ver no Mapa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Card Lateral: Postos na Orla e Horários */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[#F9F1E7] p-5 rounded-2xl border border-[#E5E7EB]">
                    <h3 className="font-black text-sm text-[#1A1D1F] flex items-center gap-2 mb-2">
                      <Tent className="w-4 h-4 text-[#FF6B35]" />
                      <span>Postos Ativos em Guarapari</span>
                    </h3>
                    <p className="text-xs text-[#6B7280] mb-3">
                      {tendas.filter(t => t.ativa !== false).length} tendas em funcionamento na orla
                    </p>
                    <div className="space-y-2">
                      {tendas.slice(0, 4).map((t) => (
                        <div key={t.id} className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] text-xs flex items-center justify-between">
                          <span className="font-bold text-[#1A1D1F]">{t.nome}</span>
                          <span className="text-[10px] text-[#0B6EFD] font-mono">{t.praia}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] text-xs space-y-2">
                    <span className="font-extrabold text-[#1A1D1F] block">Horário de Pico na Areia</span>
                    <p className="text-[#6B7280] leading-relaxed">
                      Maior concentração histórica de desencontros ocorre entre <strong>14:00 e 16:30</strong>.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 2: 🚨 MONITORAMENTO & MAPA */}
          {/* ===================================================== */}
          {secaoAtiva === 'monitoramento' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-8.5rem)] animate-in fade-in duration-200">
              
              {/* Lista de Chamados à Esquerda */}
              <div className="lg:col-span-5 flex flex-col h-full space-y-3 overflow-hidden">
                <div className="flex items-center justify-between flex-shrink-0">
                  <h2 className="text-sm font-extrabold text-[#1A1D1F] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF6B35]" />
                    <span>Fila Operacional ({chamadosAtivos.length} ativos)</span>
                  </h2>
                  <span className="text-[11px] font-bold text-[#6B7280]">
                    {ocorrenciasMonitoramento.length} filtrados
                  </span>
                </div>

                {/* Barra de Filtros Operacionais Compacta */}
                <div className="bg-white p-2.5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Campo de Busca Rápida */}
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por pulseira, nome..."
                        value={filtroMonitorBusca}
                        onChange={(e) => setFiltroMonitorBusca(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35] text-[#1A1D1F]"
                      />
                      {filtroMonitorBusca && (
                        <button 
                          onClick={() => setFiltroMonitorBusca('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filtro de Posto / Tenda */}
                    <select
                      value={filtroMonitorTendaId}
                      onChange={(e) => setFiltroMonitorTendaId(e.target.value)}
                      className="text-xs font-bold py-1.5 px-2 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35] text-[#1A1D1F] cursor-pointer max-w-[140px] truncate"
                    >
                      <option value="todas">📍 Todas</option>
                      {operadorTendaId && (
                        <option value={operadorTendaId}>⭐ Meu Posto</option>
                      )}
                      {tendas.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Linha 2: Pílulas de Status e Filtro de Situação */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setFiltroMonitorStatus('ativos')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          filtroMonitorStatus === 'ativos'
                            ? 'bg-[#FF6B35] text-white shadow-xs'
                            : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                        }`}
                      >
                        🔥 Ativos
                      </button>
                      <button
                        onClick={() => setFiltroMonitorStatus('concluidos')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          filtroMonitorStatus === 'concluidos'
                            ? 'bg-[#16A34A] text-white shadow-xs'
                            : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                        }`}
                      >
                        ✅ Concluídos
                      </button>
                      <button
                        onClick={() => setFiltroMonitorStatus('todos')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          filtroMonitorStatus === 'todos'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                        }`}
                      >
                        Todos
                      </button>

                      {/* Filtro por Situação / Etapa */}
                      <select
                        value={filtroMonitorSituacao}
                        onChange={(e) => setFiltroMonitorSituacao(e.target.value)}
                        className="text-xs font-bold py-1.5 px-2 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35] text-[#1A1D1F] cursor-pointer"
                        title="Filtrar por etapa ou situação da ocorrência"
                      >
                        <option value="todas">📋 Todas as Situações</option>
                        <option value="Criança localizada">⚠️ Criança localizada</option>
                        <option value="Equipe a caminho">🏃 Equipe a caminho</option>
                        <option value="Criança recebida">🛡️ Criança na tenda</option>
                        <option value="Responsáveis localizados">👤 Pais contatados</option>
                        <option value="Reencontro realizado">🎉 Reencontro realizado</option>
                      </select>
                    </div>

                    {(filtroMonitorStatus !== 'ativos' || filtroMonitorSituacao !== 'todas' || filtroMonitorTendaId !== 'todas' || filtroMonitorBusca) && (
                      <button
                        onClick={() => {
                          setFiltroMonitorStatus('ativos');
                          setFiltroMonitorSituacao('todas');
                          setFiltroMonitorTendaId('todas');
                          setFiltroMonitorBusca('');
                        }}
                        className="text-xs font-bold text-[#DC2626] hover:underline px-1"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </div>
                </div>

                {ocorrenciasMonitoramento.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center text-xs text-[#6B7280]">
                    Nenhum alerta corresponde aos filtros selecionados.
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1.5">
                    {ocorrenciasMonitoramento.map((oco) => {
                      const isSelected = selectedOcorrencia?.id === oco.id;
                      const isFinalizado = oco.status === 'Reencontro realizado';

                      return (
                        <div
                          key={oco.id}
                          onClick={() => setSelectedOcorrencia(oco)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-white border-[#FF6B35] shadow-md ring-2 ring-[#FF6B35]/20'
                              : isFinalizado
                                ? 'bg-slate-50 border-[#E5E7EB] opacity-70'
                                : 'bg-white border-[#E5E7EB] shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-lg border border-[#FDE68A]">
                                #{oco.numero_pulseira}
                              </span>
                              {oco.cadastro?.nome_crianca && (
                                <span className="font-extrabold text-sm text-[#1A1D1F]">
                                  {oco.cadastro.nome_crianca}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[#6B7280] bg-slate-100 px-1.5 py-0.5 rounded-md border border-[#E5E7EB]">
                                {formatarDataHora(oco.horario_alerta)}
                              </span>
                              <StatusBadge status={oco.status} size="sm" />
                            </div>
                          </div>

                          {/* Dados da Família */}
                          {oco.cadastro ? (
                            <div className="bg-[#F9FAFB] rounded-xl p-2.5 text-xs text-[#1A1D1F] space-y-1 mb-2.5 border border-[#E5E7EB]">
                              <div>
                                <span className="text-[#6B7280]">Responsável:</span> <strong>{oco.cadastro.nome_responsavel}</strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[#6B7280]">Telefone:</span>
                                <span className="font-mono text-[#0B6EFD] font-bold">{oco.cadastro.telefone_contato}</span>
                              </div>
                              {oco.cadastro.observacoes && (
                                <div className="text-[11px] text-[#B45309] bg-[#FEF3C7] p-1.5 rounded border border-[#FDE68A]">
                                  ⚠️ {oco.cadastro.observacoes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-[#B45309] bg-[#FEF3C7] p-2 rounded-lg mb-2">
                              Pulseira #{oco.numero_pulseira} ainda não cadastrada.
                            </div>
                          )}

                          {/* Tenda Mais Próxima */}
                          {oco.tendaMaisProxima && (
                            <div className="bg-[#EFF6FF] text-[#1D4ED8] text-[11px] p-2 rounded-xl mb-2.5 border border-[#BFDBFE]">
                              📍 <strong>Tenda Mais Próxima:</strong> {oco.tendaMaisProxima.tenda.nome} (~{oco.tendaMaisProxima.distanciaMetros} metros)
                            </div>
                          )}

                          {/* Ações Táticas */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                            {oco.cadastro?.telefone_contato && (
                              <>
                                <a
                                  href={`tel:${oco.cadastro.telefone_contato}`}
                                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] text-xs font-semibold py-1.5 px-2.5 rounded-lg"
                                >
                                  <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                                  <span>Ligar</span>
                                </a>

                                <a
                                  href={`https://wa.me/${formatarWhatsapp(oco.cadastro.telefone_contato)}?text=Ol%C3%A1!%20Aqui%20%C3%A9%20da%20equipe%20Anjos%20da%20Praia.%20Recebemos%20a%20localiza%C3%A7%C3%A3o%20da%20pulseira%20%23${oco.numero_pulseira}%20e%20j%C3%A1%20estamos%20no%20local!`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#BBF7D0]"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            )}

                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${oco.latitude},${oco.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-[#F9F1E7] hover:bg-[#E5E7EB] text-[#1A1D1F] text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#E5E7EB]"
                            >
                              <Navigation className="w-3.5 h-3.5 text-[#FF6B35]" />
                              <span>Rota GPS</span>
                            </a>

                            {/* Botão de Linha do Tempo / Histórico de Auditoria */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalHistoricoOcorrencia(oco);
                              }}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#E5E7EB] transition-colors"
                              title="Ver histórico de alterações e operadores"
                            >
                              <History className="w-3.5 h-3.5 text-[#0B6EFD]" />
                              <span className="hidden xs:inline">Histórico</span>
                            </button>

                            {/* Status: Seletor Operacional ou Selo Bloqueado de Finalizado */}
                            {oco.id && (
                              isFinalizado ? (
                                <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] text-xs font-black ml-auto shadow-sm">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                                  <span>Reencontro Concluído</span>
                                </div>
                              ) : (
                                <select
                                  value={oco.status}
                                  onChange={(e) => handleMudarStatus(oco.id!, e.target.value as StatusOcorrencia, oco)}
                                  className="text-xs font-bold py-1 px-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1A1D1F] ml-auto outline-none focus:border-[#FF6B35]"
                                >
                                  <option value="Criança localizada">Criança localizada</option>
                                  <option value="Equipe a caminho">Equipe a caminho</option>
                                  <option value="Criança recebida">Criança na tenda</option>
                                  <option value="Responsáveis localizados">Pais contatados</option>
                                  <option value="Reencontro realizado">Reencontro realizado 🎉</option>
                                </select>
                              )
                            )}

                            {/* Cancelar Alarme Falso (bloqueado se já finalizado) */}
                            {!isFinalizado && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalExclusaoOcorrencia(oco);
                                }}
                                className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancelar alarme falso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mapa Leaflet à Direita (Altura total da tela) */}
              <div className="lg:col-span-7 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-sm h-full min-h-[550px] flex flex-col">
                <MapView
                  ocorrencias={ocorrenciasMonitoramento}
                  tendas={tendas}
                  selectedOcorrencia={selectedOcorrencia}
                  onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
                />
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 3: 📋 PULSEIRAS & CADASTROS (CRUD) */}
          {/* ===================================================== */}
          {secaoAtiva === 'pulseiras' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FF6B35]" />
                    <span>Cadastros de Pulseiras</span>
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Total de {cadastros.length} crianças registradas no Supabase
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar por pulseira, nome ou fone..."
                      value={termoBuscaPulseira}
                      onChange={(e) => setTermoBuscaPulseira(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                    />
                  </div>

                  <button
                    onClick={() => setModalNovaPulseira(true)}
                    className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E8531F] text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-colors whitespace-nowrap"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Nova Pulseira</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Pulseiras */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1A1D1F]">
                  <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase font-semibold border-b border-[#E5E7EB]">
                    <tr>
                      <th className="py-3 px-3">Pulseira</th>
                      <th className="py-3 px-3">Criança / Responsável</th>
                      <th className="py-3 px-3">Telefone WhatsApp</th>
                      <th className="py-3 px-3">Praia / Posto</th>
                      <th className="py-3 px-3">Observações</th>
                      <th className="py-3 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {cadastrosFiltrados.map((cad) => (
                      <tr key={cad.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-3 font-mono font-black text-[#FF6B35] text-sm">
                          #{cad.numero_pulseira}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold">{cad.nome_crianca || 'Não informado'}</div>
                          <div className="text-[11px] text-[#6B7280]">Resp: {cad.nome_responsavel}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#0B6EFD] font-semibold">
                          {cad.telefone_contato}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#6B7280]">
                          {cad.praia_origem || 'Praia do Morro'}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#6B7280] max-w-xs truncate">
                          {cad.observacoes || '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setQrNumero(cad.numero_pulseira);
                                setQrCrianca(cad.nome_crianca);
                                setQrModalOpen(true);
                              }}
                              className="p-1.5 text-[#FF6B35] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                              title="Ver QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setModalEdicaoPulseira(cad)}
                              className="p-1.5 text-[#0B6EFD] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                              title="Editar cadastro"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setModalExclusaoPulseira(cad)}
                              className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                              title="Excluir cadastro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 4: ⛺ TENDAS & POSTOS (CRUD) */}
          {/* ===================================================== */}
          {secaoAtiva === 'tendas' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
                    <Tent className="w-4 h-4 text-[#FF6B35]" />
                    <span>Gestão de Tendas e Postos de Apoio</span>
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Locais físicos onde os voluntários recebem as crianças e atendem famílias
                  </p>
                </div>

                <button
                  onClick={() => setModalNovaTenda(true)}
                  className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E8531F] text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Cadastrar Novo Posto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {tendas.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-3 relative">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B6EFD] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                          {t.praia}
                        </span>
                        <h3 className="text-sm font-black text-[#1A1D1F] mt-1">{t.nome}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.ativa !== false ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {t.ativa !== false ? 'Ativa' : 'Pausada'}
                      </span>
                    </div>

                    <div className="text-xs text-[#6B7280] space-y-1">
                      {t.responsavel_posto && (
                        <div><strong>Coordenador:</strong> {t.responsavel_posto}</div>
                      )}
                      {t.telefone_posto && (
                        <div><strong>Contato / Rádio:</strong> {t.telefone_posto}</div>
                      )}
                      <div className="font-mono text-[11px] text-slate-500">
                        GPS: {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                      {operadorTendaId === t.id || tendaOperador === t.nome ? (
                        <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Sua tenda atual</span>
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              setTendaOperador(t.nome);
                              if (t.id) setOperadorTendaId(t.id);

                              if (operadorUserId && t.id) {
                                await dataService.atualizarTendaOperador(operadorUserId, t.id);
                              }
                              showToast(`Posto "${t.nome}" definido como sua base de operação!`, 'sucesso');
                            } catch (err: any) {
                              console.error('Erro ao atualizar tenda do operador:', err);
                              showToast('Erro ao salvar tenda no banco de dados: ' + (err.message || 'Erro desconhecido'), 'erro');
                            }
                          }}
                          className="text-xs font-bold text-[#0B6EFD] hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Definir como minha tenda</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalEdicaoTenda(t)}
                          className="p-1 text-[#0B6EFD] hover:bg-[#EFF6FF] rounded-md"
                          title="Editar posto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setModalExclusaoTenda(t)}
                          className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded-md"
                          title="Excluir posto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 5: 🖨️ EMISSÃO EM LOTE (IMPRESSÃO) */}
          {/* ===================================================== */}
          {secaoAtiva === 'impressao' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
                    <Printer className="w-4 h-4 text-[#FF6B35]" />
                    <span>Emissão de Etiquetas & Cartazes para a Orla</span>
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Atende ao modelo de alta tiragem econômica (QR Geral) e identificação individual rápida
                  </p>
                </div>

                {/* Seletor de Modelo de Impressão */}
                <div className="flex items-center gap-2 bg-[#F9FAFB] p-1.5 rounded-xl border border-[#E5E7EB]">
                  <button
                    onClick={() => setTipoImpressao('individual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tipoImpressao === 'individual'
                        ? 'bg-[#FF6B35] text-white shadow-sm'
                        : 'text-[#6B7280] hover:text-[#1A1D1F]'
                    }`}
                  >
                    Pulseiras com QR Individual
                  </button>
                  <button
                    onClick={() => setTipoImpressao('geral')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tipoImpressao === 'geral'
                        ? 'bg-[#0B6EFD] text-white shadow-sm'
                        : 'text-[#6B7280] hover:text-[#1A1D1F]'
                    }`}
                  >
                    Cartazes de Quiosque (QR Geral)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {tipoImpressao === 'individual' ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs">
                        <label className="font-bold">Início #:</label>
                        <input
                          type="number"
                          value={loteInicio}
                          onChange={(e) => setLoteInicio(parseInt(e.target.value) || 1001)}
                          className="w-16 sm:w-20 p-1.5 border border-[#E5E7EB] rounded-lg text-center font-mono font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <label className="font-bold">Qtd:</label>
                        <select
                          value={loteQuantidade}
                          onChange={(e) => setLoteQuantidade(parseInt(e.target.value))}
                          className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white font-bold text-xs"
                        >
                          <option value={6}>6 un</option>
                          <option value={12}>12 un</option>
                          <option value={24}>24 un</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-[#6B7280] font-semibold">
                      Pronto para impressão em formato A4
                    </div>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E8531F] text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl shadow transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden xs:inline">Imprimir Folha</span>
                  </button>
                </div>
              </div>

              {/* MODO A: Grade de Pulseiras Individuais */}
              {tipoImpressao === 'individual' && (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                  {Array.from({ length: loteQuantidade }).map((_, i) => {
                    const num = String(loteInicio + i);
                    const qrUrl = `${window.location.origin}/alerta?pulseira=${num}`;

                    return (
                      <div key={num} className="bg-white p-3 rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center space-y-2 flex flex-col items-center justify-center overflow-hidden">
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#FF6B35]">
                          ANJOS DA PRAIA
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-inner border border-[#E5E7EB] flex items-center justify-center max-w-full">
                          <QRCodeSVG 
                            value={qrUrl} 
                            className="w-24 h-24 sm:w-28 sm:h-28 max-w-full" 
                            level="M" 
                          />
                        </div>
                        <div className="text-base font-black font-mono text-[#1A1D1F]">
                          #{num}
                        </div>
                        <div className="text-[9px] text-[#6B7280] leading-tight max-w-[180px]">
                          Aponte a câmera em caso de emergência
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODO B: Cartazes / Totens de Praia com QR Code Geral (Requisito 3 do Edital) */}
              {tipoImpressao === 'geral' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                  {/* Cartaz para Quiosque / Posto de Salva-Vidas */}
                  <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35] text-center space-y-4 shadow-sm flex flex-col items-center">
                    <div className="inline-block bg-[#FFF5F1] text-[#FF6B35] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#FFD8C7]">
                      POSTO DE APOIO & QUIOSQUES DA PRAIA
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1D1F]">
                        CRIANÇA PERDIDA NA PRAIA?
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Aponte a câmera para o QR Code abaixo e acione os Anjos da Praia
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#FF6B35] shadow-sm">
                      <QRCodeSVG 
                        value={`${window.location.origin}/alerta`} 
                        className="w-40 h-40" 
                        level="Q" 
                      />
                    </div>
                    <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 rounded-xl text-xs text-[#1D4ED8] max-w-sm">
                      <strong>Como funciona:</strong> Ao escanear, o banhista digita o número gravado no braço da criança e envia a localização em 1 toque.
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">
                      Parceria CBMES • Prefeitura Municipal de Guarapari
                    </div>
                  </div>

                  {/* Cartaz Informativo para Famílias */}
                  <div className="bg-white p-6 rounded-2xl border-2 border-[#0B6EFD] text-center space-y-4 shadow-sm flex flex-col items-center">
                    <div className="inline-block bg-[#EFF6FF] text-[#0B6EFD] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#BFDBFE]">
                      ORIENTAÇÃO ÀS FAMÍLIAS
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1D1F]">
                        PROTEJA SEU FILHO NA AREIA
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Cadastre a pulseira gratuita nos postos da Associação Anjos da Praia
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#0B6EFD] shadow-sm">
                      <QRCodeSVG 
                        value={`${window.location.origin}/alerta`} 
                        className="w-40 h-40" 
                        level="Q" 
                      />
                    </div>
                    <div className="bg-[#FEF3C7] border border-[#FDE68A] p-2.5 rounded-xl text-xs text-[#92400E] max-w-sm">
                      <strong>Dica de Segurança:</strong> Ao chegar à praia, mostre à criança o posto dos salva-vidas e os voluntários uniformizados.
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">
                      Associação Anjos da Praia • Guarapari - ES
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 6: 📈 RELATÓRIOS & ESTATÍSTICAS POR PRAIA */}
          {/* ===================================================== */}
          {secaoAtiva === 'relatorios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header do Relatório com Exportador Inteligente */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#FF6B35]" />
                    <span>Relatório Consolidado de Ocorrências & Praias</span>
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Histórico auditado para prestação de contas com a Prefeitura de Guarapari e Corpo de Bombeiros Militar ES
                  </p>
                </div>

                <button
                  onClick={exportarRelatorioCSV}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  title="Baixar planilha CSV com os filtros atualmente aplicados"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Baixar Planilha Filtrada (.CSV)</span>
                </button>
              </div>

              {/* Barra de Filtros de Relatórios */}
              <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#0B6EFD]" />
                    <span className="text-xs font-black text-[#1A1D1F]">Filtros do Relatório & Auditoria</span>
                  </div>
                  {(filtroRelatorioPraia !== 'todas' || filtroRelatorioStatus !== 'todos' || filtroRelatorioSituacao !== 'todas' || filtroRelatorioPeriodo !== 'tudo' || filtroRelatorioBusca) && (
                    <button
                      onClick={() => {
                        setFiltroRelatorioPraia('todas');
                        setFiltroRelatorioStatus('todos');
                        setFiltroRelatorioSituacao('todas');
                        setFiltroRelatorioPeriodo('tudo');
                        setFiltroRelatorioBusca('');
                      }}
                      className="text-xs font-bold text-[#DC2626] hover:underline"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Busca por Texto */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar por pulseira, nome, tel..."
                      value={filtroRelatorioBusca}
                      onChange={(e) => setFiltroRelatorioBusca(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E7EB] outline-none focus:border-[#0B6EFD] text-[#1A1D1F]"
                    />
                  </div>

                  {/* Filtro por Praia */}
                  <div>
                    <select
                      value={filtroRelatorioPraia}
                      onChange={(e) => setFiltroRelatorioPraia(e.target.value)}
                      className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
                    >
                      <option value="todas">📍 Todas as Praias de Guarapari</option>
                      {listaPraiasAtivas.map(p => (
                        <option key={p.nome} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Status */}
                  <div>
                    <select
                      value={filtroRelatorioStatus}
                      onChange={(e) => setFiltroRelatorioStatus(e.target.value as any)}
                      className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
                    >
                      <option value="todos">⚡ Todos os Status</option>
                      <option value="ativos">🔥 Apenas Chamados em Aberto</option>
                      <option value="concluidos">✅ Apenas Reencontros Concluídos</option>
                    </select>
                  </div>

                  {/* Filtro por Situação / Etapa */}
                  <div>
                    <select
                      value={filtroRelatorioSituacao}
                      onChange={(e) => setFiltroRelatorioSituacao(e.target.value)}
                      className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
                      title="Filtrar por situação da ocorrência"
                    >
                      <option value="todas">📋 Todas as Situações</option>
                      <option value="Criança localizada">⚠️ Criança localizada</option>
                      <option value="Equipe a caminho">🏃 Equipe a caminho</option>
                      <option value="Criança recebida">🛡️ Criança na tenda</option>
                      <option value="Responsáveis localizados">👤 Pais contatados</option>
                      <option value="Reencontro realizado">🎉 Reencontro realizado</option>
                    </select>
                  </div>

                  {/* Filtro por Período */}
                  <div>
                    <select
                      value={filtroRelatorioPeriodo}
                      onChange={(e) => setFiltroRelatorioPeriodo(e.target.value as any)}
                      className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
                    >
                      <option value="tudo">📅 Todo o Histórico</option>
                      <option value="hoje">☀️ Hoje (Últimas 24h)</option>
                      <option value="7dias">🗓️ Últimos 7 dias (Semana)</option>
                      <option value="30dias">📆 Últimos 30 dias (Mês)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Indicadores Dinâmicos por Praia */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { praia: 'Praia do Morro', cor: 'border-[#FF6B35]' },
                  { praia: 'Praia das Castanheiras', cor: 'border-[#0B6EFD]' },
                  { praia: 'Praia da Areia Preta', cor: 'border-[#10B981]' },
                  { praia: 'Praia de Meaípe', cor: 'border-[#8B5CF6]' }
                ].map(({ praia, cor }) => {
                  const ocosPraia = ocorrenciasRelatorios.filter(o => o.cadastro?.praia_origem === praia || o.tendaMaisProxima?.tenda?.praia === praia);
                  const concluidas = ocosPraia.filter(o => o.status === 'Reencontro realizado').length;
                  const taxa = ocosPraia.length > 0 ? Math.round((concluidas / ocosPraia.length) * 100) : 100;

                  return (
                    <div key={praia} className={`bg-white p-5 rounded-2xl border-t-4 ${cor} border border-[#E5E7EB] shadow-sm space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1A1D1F] truncate">{praia}</span>
                        <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-[#1A1D1F]">{ocosPraia.length}</span>
                        <span className="text-[11px] text-[#16A34A] font-bold">{taxa}% reencontrados</span>
                      </div>
                      <div className="text-[10px] text-[#6B7280] pt-1 border-t border-[#E5E7EB] flex justify-between">
                        <span>{concluidas} finalizados</span>
                        <span>{ocosPraia.length - concluidas} em aberto</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabela de Registro Geral com Auditoria LGPD Filtrada */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-[#1A1D1F]">
                      Auditoria de Ocorrências Registradas
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EFD]">
                      {ocorrenciasRelatorios.length} de {ocorrencias.length}
                    </span>
                  </div>
                  <span className="text-[11px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                    Dados protegidos conforme LGPD
                  </span>
                </div>

                {ocorrenciasRelatorios.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#6B7280]">
                    Nenhuma ocorrência encontrada com os filtros selecionados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1A1D1F]">
                      <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase font-semibold border-b border-[#E5E7EB]">
                        <tr>
                          <th className="py-2.5 px-3">Pulseira</th>
                          <th className="py-2.5 px-3">Criança</th>
                          <th className="py-2.5 px-3">Responsável</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Horário</th>
                          <th className="py-2.5 px-3">Tenda Próxima</th>
                          <th className="py-2.5 px-3 text-right">Telefone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {ocorrenciasRelatorios.map((oco) => (
                          <tr key={oco.id} className="hover:bg-[#F9FAFB]">
                            <td className="py-3 px-3 font-mono font-black text-[#FF6B35]">
                              #{oco.numero_pulseira}
                            </td>
                            <td className="py-3 px-3 font-bold">
                              {oco.cadastro?.nome_crianca || 'Não identificado'}
                            </td>
                            <td className="py-3 px-3 text-[#6B7280]">
                              {oco.cadastro?.nome_responsavel || 'Desconhecido'}
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={oco.status} size="sm" />
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[#6B7280] whitespace-nowrap">
                              {formatarDataHora(oco.horario_alerta)}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-[#6B7280]">
                              {oco.tendaMaisProxima?.tenda?.nome || 'Pendente'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-[11px]">
                              {oco.cadastro?.telefone_contato || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 7: 🛡️ EQUIPE & USUÁRIOS (ADMINISTRAÇÃO DE OPERADORES) */}
          {/* ===================================================== */}
          {secaoAtiva === 'usuarios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header de Gestão de Usuários */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#FF6B35]" />
                    <h2 className="text-base font-black text-[#1A1D1F]">
                      Gestão de Equipe & Controle de Acesso
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EFD]">
                      {operadoresLista.length} Integrantes
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Administre os voluntários, emita links de convite temporários com expiração e gerencie permissões
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {operadorRole === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setFormUsuarioNome('');
                          setFormUsuarioEmail('');
                          setFormUsuarioSenha('');
                          setFormUsuarioTendaId('');
                          setFormUsuarioRole('operador');
                          setErroModalUsuario(null);
                          setModalNovoUsuario(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                        title="Cadastrar um operador ou coordenador diretamente no sistema"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Novo Usuário</span>
                      </button>

                      <button
                        onClick={() => {
                          setFormConviteTendaId('');
                          setFormConviteValidadeHoras(24);
                          setFormConviteRole('operador');
                          setFormConviteUsos(1);
                          setConviteGeradoRecente(null);
                          setModalNovoConvite(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#0B6EFD] hover:bg-[#0857CC] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Gerar Link de Convite</span>
                      </button>
                    </>
                  )}

                  <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Chave Mestra:</span>
                    <span className="font-mono uppercase bg-white px-2 py-0.5 rounded border border-[#FCD34D]">
                      {dataService.CODIGO_AUTORIZACAO_OFICIAL}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela de Operadores com CRUD Completo */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D1F]">Operadores e Coordenadores Cadastrados</span>
                  <span className="text-[11px] text-[#6B7280]">
                    Seu perfil atual: <strong className="uppercase text-[#0B6EFD]">{operadorRole}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1A1D1F]">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Nome do Operador</th>
                        <th className="py-3 px-4 font-bold">E-mail</th>
                        <th className="py-3 px-4 font-bold">Posto / Tenda</th>
                        <th className="py-3 px-4 font-bold">Nível de Acesso</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {operadoresLista.map((op) => {
                        const tendaVinculada = tendas.find(t => t.id === op.tenda_id);
                        const isVoce = op.id === operadorUserId;
                        const isBloqueado = op.status === 'bloqueado';
                        const isOutroAdmin = op.role === 'admin' && !isVoce;

                        return (
                          <tr key={op.id} className={`hover:bg-[#F9FAFB] transition-colors ${isBloqueado ? 'bg-red-50/50' : ''}`}>
                            <td className="py-3.5 px-4 font-bold">
                              <div className="flex items-center gap-2">
                                <span>{op.nome}</span>
                                {isVoce && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
                                    Você
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              {op.email || '-'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <Tent className="w-3.5 h-3.5 text-[#FF6B35]" />
                                <span>{tendaVinculada?.nome || 'Nenhum posto fixo'}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                op.role === 'admin'
                                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                                  : 'bg-slate-100 text-[#475569] border border-slate-200'
                              }`}>
                                {op.role === 'admin' ? '⭐ Coordenador Geral' : 'Voluntário / Posto'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {isBloqueado ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                                  Bloqueado
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                                  Ativo
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {operadorRole === 'admin' ? (
                                isVoce ? (
                                  <div className="flex items-center justify-end">
                                    <button
                                      onClick={() => setModalEdicaoOperador(op)}
                                      className="p-1.5 text-[#0B6EFD] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                                      title="Editar meus dados"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : isOutroAdmin ? (
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg" title="Por segurança institucional, um Coordenador não pode excluir ou alterar outro Coordenador">
                                    🛡️ Coordenador Protegido
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Alternar Status Bloqueado / Ativo */}
                                    <button
                                      onClick={async () => {
                                        try {
                                          const novoStatus = isBloqueado ? 'ativo' : 'bloqueado';
                                          await dataService.atualizarOperador(op.id, { status: novoStatus });
                                          showToast(`Acesso de ${op.nome} foi ${isBloqueado ? 'reativado' : 'bloqueado'}!`, 'sucesso');
                                          carregarDados();
                                        } catch (e: any) {
                                          showToast('Erro ao moderar usuário: ' + e.message, 'erro');
                                        }
                                      }}
                                      className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                                        isBloqueado
                                          ? 'border-green-300 text-green-700 hover:bg-green-50'
                                          : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                      }`}
                                    >
                                      {isBloqueado ? 'Reativar' : 'Bloquear'}
                                    </button>

                                    {/* Editar Operador (Apenas Ícone) */}
                                    <button
                                      onClick={() => setModalEdicaoOperador(op)}
                                      className="p-1.5 text-[#0B6EFD] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                                      title="Editar operador"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Excluir Operador (Com Proteção) */}
                                    <button
                                      onClick={() => setModalExclusaoOperador(op)}
                                      className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                                      title="Excluir operador"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Somente Leitura</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabela de Convites Temporais Ativos */}
              {operadorRole === 'admin' && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden space-y-3">
                  <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#0B6EFD]" />
                      <span className="text-xs font-bold text-[#1A1D1F]">
                        Convites Temporais Emitidos ({convitesLista.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B7280]">
                      Permite auto-cadastro rápido com expiração automática
                    </span>
                  </div>

                  {convitesLista.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6B7280]">
                      Nenhum convite temporal ativo emitido recentemente. Clique em <strong>"Gerar Link de Convite"</strong> acima para criar o primeiro.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#1A1D1F]">
                        <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                          <tr>
                            <th className="py-2.5 px-4 font-bold">Código do Convite</th>
                            <th className="py-2.5 px-4 font-bold">Tenda Atribuída</th>
                            <th className="py-2.5 px-4 font-bold">Função</th>
                            <th className="py-2.5 px-4 font-bold">Usos</th>
                            <th className="py-2.5 px-4 font-bold">Validade / Expiração</th>
                            <th className="py-2.5 px-4 font-bold text-right">Compartilhar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                          {convitesLista.map((conv) => {
                            const expira = new Date(conv.expira_em);
                            const isExpirado = new Date() > expira || conv.usos_atuais >= conv.usos_maximos;
                            const linkConvite = `${window.location.origin}/login?convite=${conv.codigo}`;

                            return (
                              <tr key={conv.id || conv.codigo} className={isExpirado ? 'opacity-50 bg-slate-50' : 'hover:bg-[#F9FAFB]'}>
                                <td className="py-3 px-4 font-mono font-bold text-[#0B6EFD]">
                                  {conv.codigo}
                                </td>
                                <td className="py-3 px-4">
                                  {(() => {
                                    const tendaVinculada = tendas.find(t => t.id === conv.tenda_id) || conv.tenda || (Array.isArray((conv as any).tendas) ? (conv as any).tendas[0] : (conv as any).tendas);
                                    if (tendaVinculada?.nome) {
                                      return (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                                          <Tent className="w-3.5 h-3.5 text-[#FF6B35]" />
                                          <span>{tendaVinculada.nome}</span>
                                        </span>
                                      );
                                    }
                                    return <span className="text-slate-400 italic">Qualquer tenda</span>;
                                  })()}
                                </td>
                                <td className="py-3 px-4 uppercase text-[10px] font-bold">
                                  {conv.role || 'operador'}
                                </td>
                                <td className="py-3 px-4 font-mono">
                                  {conv.usos_atuais} / {conv.usos_maximos}
                                </td>
                                <td className="py-3 px-4">
                                  {isExpirado ? (
                                    <span className="text-red-600 font-bold text-[10px]">Expirado</span>
                                  ) : (
                                    <span className="text-emerald-700 font-semibold text-[11px]">
                                      Até {expira.toLocaleDateString('pt-BR')} {expira.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(linkConvite);
                                      showToast(`Link de convite copiado para a área de transferência!`, 'sucesso');
                                    }}
                                    className="p-1.5 text-xs text-[#0B6EFD] hover:bg-[#EFF6FF] rounded-lg font-bold inline-flex items-center gap-1 transition-colors"
                                    title="Copiar link para WhatsApp"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar Link</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAIS: CRUDS E CONFIRMAÇÕES */}
      {/* ========================================================= */}

      {/* MODAL: NOVA PULSEIRA */}
      {modalNovaPulseira && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-base font-black text-[#1A1D1F]">Cadastrar Pulseira</h3>
              <button onClick={() => setModalNovaPulseira(false)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>
            <form onSubmit={handleCadastrarPulseira} className="space-y-3 text-xs">
              {erroModalPulseira && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="leading-snug font-medium text-xs">
                    {erroModalPulseira}
                  </div>
                </div>
              )}
              <div>
                <label className="block font-bold mb-1">Número da Pulseira *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1004"
                  value={formPulseiraNumero}
                  onChange={(e) => setFormPulseiraNumero(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] font-bold text-sm outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nome da Criança</label>
                <input
                  type="text"
                  placeholder="Ex: Pedro Henrique"
                  value={formPulseiraCrianca}
                  onChange={(e) => setFormPulseiraCrianca(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nome do Responsável *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Juliana Martins"
                  value={formPulseiraResponsavel}
                  onChange={(e) => setFormPulseiraResponsavel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (27) 99888-7766"
                  value={formPulseiraTelefone}
                  onChange={(e) => setFormPulseiraTelefone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Praia de Origem / Balneário</label>
                <select
                  value={formPulseiraPraia}
                  onChange={(e) => setFormPulseiraPraia(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35]"
                >
                  {listaPraiasAtivas.map((p) => (
                    <option key={p.nome} value={p.nome}>
                      {p.nome} ({p.regiao})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Observações (Roupas/Sinais)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Bermuda azul, camisa UV branca"
                  value={formPulseiraObs}
                  onChange={(e) => setFormPulseiraObs(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#E8531F] text-white font-bold rounded-xl shadow transition-colors"
              >
                Gravar no Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIÇÃO DE PULSEIRA */}
      {modalEdicaoPulseira && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-base font-black text-[#1A1D1F]">
                Editar Pulseira #{modalEdicaoPulseira.numero_pulseira}
              </h3>
              <button onClick={() => setModalEdicaoPulseira(null)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>
            <form onSubmit={handleSalvarEdicaoPulseira} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome da Criança</label>
                <input
                  type="text"
                  value={modalEdicaoPulseira.nome_crianca || ''}
                  onChange={(e) => setModalEdicaoPulseira({ ...modalEdicaoPulseira, nome_crianca: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Responsável</label>
                <input
                  type="text"
                  required
                  value={modalEdicaoPulseira.nome_responsavel}
                  onChange={(e) => setModalEdicaoPulseira({ ...modalEdicaoPulseira, nome_responsavel: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone WhatsApp</label>
                <input
                  type="text"
                  required
                  value={modalEdicaoPulseira.telefone_contato}
                  onChange={(e) => setModalEdicaoPulseira({ ...modalEdicaoPulseira, telefone_contato: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={modalEdicaoPulseira.observacoes || ''}
                  onChange={(e) => setModalEdicaoPulseira({ ...modalEdicaoPulseira, observacoes: e.target.value })}
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#0B6EFD] hover:bg-[#0857CC] text-white font-bold rounded-xl shadow transition-colors"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE PULSEIRA */}
      {modalExclusaoPulseira && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="w-12 h-12 bg-[#FEE2E2] text-[#DC2626] rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1A1D1F]">
              Excluir Pulseira #{modalExclusaoPulseira.numero_pulseira}?
            </h3>
            <p className="text-xs text-[#6B7280]">
              Tem certeza que deseja apagar o cadastro de {modalExclusaoPulseira.nome_responsavel}? Esta ação remove o registro do banco de dados (LGPD).
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalExclusaoPulseira(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluirPulseira}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TENDA */}
      {modalNovaTenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-base font-black text-[#1A1D1F]">Cadastrar Posto / Tenda</h3>
              <button onClick={() => setModalNovaTenda(false)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>
            <form onSubmit={handleCadastrarTenda} className="space-y-3 text-xs">
              {erroModalTenda && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="leading-snug font-medium text-xs">
                    {erroModalTenda}
                  </div>
                </div>
              )}
              <div>
                <label className="block font-bold mb-1">Nome do Posto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tenda 01 - Praia do Morro"
                  value={formTendaNome}
                  onChange={(e) => setFormTendaNome(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold">Praia de Localização *</label>
                  <span className="text-[10px] text-[#FF6B35] font-semibold">Preenche GPS automático</span>
                </div>
                <select
                  required
                  value={formTendaPraia}
                  onChange={(e) => {
                    const praiaNome = e.target.value;
                    setFormTendaPraia(praiaNome);
                    const praiaObj = listaPraiasAtivas.find(p => p.nome === praiaNome);
                    if (praiaObj) {
                      setFormTendaPraiaId(praiaObj.id);
                      setFormTendaLat(praiaObj.latitude_padrao.toFixed(6));
                      setFormTendaLng(praiaObj.longitude_padrao.toFixed(6));
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1D1F] font-bold outline-none focus:border-[#FF6B35]"
                >
                  <option value="" disabled>Selecione uma praia oficial de Guarapari...</option>
                  {listaPraiasAtivas.map((p) => (
                    <option key={p.nome} value={p.nome}>
                      {p.nome} ({p.regiao})
                    </option>
                  ))}
                </select>
              </div>
              {/* Localização & Coordenadas */}
              <div className="p-3 bg-[#F9F1E7]/50 rounded-2xl border border-[#FF6B35]/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#1A1D1F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" /> Coordenadas do Posto
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCapturarGpsDispositivo((lat, lng) => {
                      setFormTendaLat(lat.toFixed(6));
                      setFormTendaLng(lng.toFixed(6));
                    })}
                    disabled={capturandoGpsTenda}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-lg font-bold text-[10px] transition-colors disabled:opacity-50"
                  >
                    <Crosshair className={`w-3 h-3 ${capturandoGpsTenda ? 'animate-spin' : ''}`} />
                    {capturandoGpsTenda ? 'Obtendo GPS...' : 'Pegar GPS Atual'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#6B7280] font-semibold mb-0.5">Latitude</label>
                    <input
                      type="text"
                      value={formTendaLat}
                      onChange={(e) => setFormTendaLat(e.target.value)}
                      placeholder="-20.6590"
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none font-mono text-xs bg-white focus:border-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6B7280] font-semibold mb-0.5">Longitude</label>
                    <input
                      type="text"
                      value={formTendaLng}
                      onChange={(e) => setFormTendaLng(e.target.value)}
                      placeholder="-40.4950"
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none font-mono text-xs bg-white focus:border-[#FF6B35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#6B7280] font-semibold mb-1">Ou selecione um ponto de referência:</label>
                  <div className="flex flex-wrap gap-1">
                    {PRESETS_GUARAPARI.map((preset) => (
                      <button
                        key={preset.nome}
                        type="button"
                        onClick={() => {
                          setFormTendaPraia(preset.praia);
                          setFormTendaLat(preset.lat.toFixed(6));
                          setFormTendaLng(preset.lng.toFixed(6));
                        }}
                        className="text-[10px] font-semibold px-2 py-0.5 bg-white hover:bg-[#FF6B35] hover:text-white text-[#1A1D1F] border border-[#E5E7EB] rounded-lg transition-colors"
                      >
                        {preset.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Coordenador / Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Sargento Bombeiro Lucas"
                  value={formTendaResp}
                  onChange={(e) => setFormTendaResp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone / Rádio</label>
                <input
                  type="text"
                  placeholder="Ex: (27) 99777-6655"
                  value={formTendaTel}
                  onChange={(e) => setFormTendaTel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#E8531F] text-white font-bold rounded-xl shadow transition-colors"
              >
                Cadastrar Posto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIÇÃO DE TENDA */}
      {modalEdicaoTenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-base font-black text-[#1A1D1F]">Editar Posto / Tenda</h3>
              <button onClick={() => setModalEdicaoTenda(null)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>
            <form onSubmit={handleSalvarEdicaoTenda} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome do Posto *</label>
                <input
                  type="text"
                  required
                  value={modalEdicaoTenda.nome}
                  onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, nome: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold">Praia de Localização *</label>
                  <span className="text-[10px] text-[#FF6B35] font-semibold">Preenche GPS automático</span>
                </div>
                <select
                  required
                  value={modalEdicaoTenda.praia || ''}
                  onChange={(e) => {
                    const praiaNome = e.target.value;
                    const praiaObj = listaPraiasAtivas.find(p => p.nome === praiaNome);
                    setModalEdicaoTenda({
                      ...modalEdicaoTenda,
                      praia: praiaNome,
                      praia_id: praiaObj?.id || modalEdicaoTenda.praia_id || null,
                      latitude: praiaObj ? praiaObj.latitude_padrao : modalEdicaoTenda.latitude,
                      longitude: praiaObj ? praiaObj.longitude_padrao : modalEdicaoTenda.longitude,
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1D1F] font-bold outline-none focus:border-[#FF6B35]"
                >
                  <option value="" disabled>Selecione uma praia oficial de Guarapari...</option>
                  {listaPraiasAtivas.map((p) => (
                    <option key={p.nome} value={p.nome}>
                      {p.nome} ({p.regiao})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seletor de Localização e Coordenadas para Edição */}
              <div className="p-3 bg-[#F9F1E7]/50 rounded-2xl border border-[#FF6B35]/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#1A1D1F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" /> Coordenadas do Posto
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCapturarGpsDispositivo((lat, lng) => {
                      setModalEdicaoTenda(prev => prev ? { ...prev, latitude: lat, longitude: lng } : null);
                    })}
                    disabled={capturandoGpsTenda}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-lg font-bold text-[10px] transition-colors disabled:opacity-50"
                  >
                    <Crosshair className={`w-3 h-3 ${capturandoGpsTenda ? 'animate-spin' : ''}`} />
                    {capturandoGpsTenda ? 'Obtendo GPS...' : 'Pegar GPS Atual'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#6B7280] font-semibold mb-0.5">Latitude</label>
                    <input
                      type="text"
                      value={modalEdicaoTenda.latitude ?? ''}
                      onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, latitude: parseFloat(e.target.value) || 0 })}
                      placeholder="-20.6590"
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none font-mono text-xs bg-white focus:border-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6B7280] font-semibold mb-0.5">Longitude</label>
                    <input
                      type="text"
                      value={modalEdicaoTenda.longitude ?? ''}
                      onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, longitude: parseFloat(e.target.value) || 0 })}
                      placeholder="-40.4950"
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none font-mono text-xs bg-white focus:border-[#FF6B35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#6B7280] font-semibold mb-1">Ou selecione um ponto de referência:</label>
                  <div className="flex flex-wrap gap-1">
                    {PRESETS_GUARAPARI.map((preset) => (
                      <button
                        key={preset.nome}
                        type="button"
                        onClick={() => {
                          setModalEdicaoTenda({
                            ...modalEdicaoTenda,
                            praia: preset.praia,
                            latitude: preset.lat,
                            longitude: preset.lng,
                          });
                        }}
                        className="text-[10px] font-semibold px-2 py-0.5 bg-white hover:bg-[#FF6B35] hover:text-white text-[#1A1D1F] border border-[#E5E7EB] rounded-lg transition-colors"
                      >
                        {preset.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Coordenador</label>
                <input
                  type="text"
                  value={modalEdicaoTenda.responsavel_posto || ''}
                  onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, responsavel_posto: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone</label>
                <input
                  type="text"
                  value={modalEdicaoTenda.telefone_posto || ''}
                  onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, telefone_posto: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tendaAtiva"
                  checked={modalEdicaoTenda.ativa !== false}
                  onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, ativa: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6B35]"
                />
                <label htmlFor="tendaAtiva" className="font-bold">Posto em Operação Ativa</label>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#0B6EFD] hover:bg-[#0857CC] text-white font-bold rounded-xl shadow transition-colors"
              >
                Salvar Alterações do Posto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE TENDA */}
      {modalExclusaoTenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="w-12 h-12 bg-[#FEE2E2] text-[#DC2626] rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1A1D1F]">
              Excluir Posto {modalExclusaoTenda.nome}?
            </h3>
            <p className="text-xs text-[#6B7280]">
              Tem certeza que deseja remover este posto da orla?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalExclusaoTenda(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluirTenda}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCELAR ALARME FALSO (EXCLUIR OCORRÊNCIA) */}
      {modalExclusaoOcorrencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="w-12 h-12 bg-[#FEE2E2] text-[#DC2626] rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1A1D1F]">
              Cancelar Ocorrência #{modalExclusaoOcorrencia.numero_pulseira}?
            </h3>
            <p className="text-xs text-[#6B7280]">
              Deseja remover este registro por se tratar de um alarme falso ou teste indevido?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalExclusaoOcorrencia(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] rounded-xl text-xs font-bold"
              >
                Manter
              </button>
              <button
                onClick={handleExcluirOcorrencia}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LINHA DO TEMPO / HISTÓRICO DE AUDITORIA DO RESGATE */}
      {modalHistoricoOcorrencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#EFF6FF] text-[#0B6EFD] rounded-xl border border-[#BFDBFE]">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1A1D1F]">
                    Trilha de Auditoria #{modalHistoricoOcorrencia.numero_pulseira}
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    {modalHistoricoOcorrencia.cadastro?.nome_crianca ? `${modalHistoricoOcorrencia.cadastro.nome_crianca} • ` : ''}Linha do tempo oficial
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalHistoricoOcorrencia(null)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Linha do tempo vertical */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 py-1">
              {(!modalHistoricoOcorrencia.historico_status || modalHistoricoOcorrencia.historico_status.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] text-center space-y-2">
                  <Clock className="w-8 h-8 text-[#6B7280] mx-auto opacity-50" />
                  <p className="text-xs text-[#6B7280]">
                    Alerta registrado em <strong>{formatarDataHora(modalHistoricoOcorrencia.horario_alerta)}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Status atual: {modalHistoricoOcorrencia.status}
                  </p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-4 py-1">
                  {modalHistoricoOcorrencia.historico_status.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      {/* Ponto indicador */}
                      <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        item.status === 'Reencontro realizado'
                          ? 'bg-[#16A34A] ring-2 ring-[#DCFCE7]'
                          : 'bg-[#FF6B35] ring-2 ring-[#FFF4EE]'
                      }`}></span>
                      
                      <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-[10px] font-mono text-[#6B7280]">
                            {formatarDataHora(item.data)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#1A1D1F] flex items-center gap-1.5 pt-1">
                          <UserIcon className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>Atualizado por: <strong>{item.operador || 'Operador'}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalHistoricoOcorrencia(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] rounded-xl text-xs font-bold transition-colors"
              >
                Fechar Trilha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code Individual */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        numeroPulseira={qrNumero}
        nomeCrianca={qrCrianca}
      />

      {/* Modal Scanner de Câmera no Painel do Operador */}
      <QRScannerModal
        isOpen={scannerAdminAberto}
        onClose={() => setScannerAdminAberto(false)}
        onScanSuccess={(texto) => {
          let num = texto;
          try {
            if (texto.includes('pulseira=')) {
              const url = new URL(texto);
              const p = url.searchParams.get('pulseira');
              if (p) num = p;
            }
          } catch {}
          const match = num.match(/\d+/);
          const finalNum = match ? match[0] : num.trim();
          setTermoBuscaPulseira(finalNum);
          setSecaoAtiva('pulseiras');
          showToast(`Pulseira #${finalNum} escaneada com sucesso!`, 'sucesso');
        }}
      />

      {/* ========================================================= */}
      {/* MODAL: EDITAR OPERADOR */}
      {/* ========================================================= */}
      {modalEdicaoOperador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0B6EFD]" />
                <h3 className="text-base font-black text-[#1A1D1F]">Editar Cadastro de Operador</h3>
              </div>
              <button onClick={() => setModalEdicaoOperador(null)}><X className="w-5 h-5 text-[#6B7280]" /></button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await dataService.atualizarOperador(modalEdicaoOperador.id, {
                    nome: modalEdicaoOperador.nome,
                    role: modalEdicaoOperador.role,
                    tenda_id: modalEdicaoOperador.tenda_id || null,
                    status: modalEdicaoOperador.status,
                  });
                  showToast('Operador atualizado com sucesso!', 'sucesso');
                  setModalEdicaoOperador(null);
                  carregarDados();
                } catch (err: any) {
                  showToast('Erro ao atualizar operador: ' + err.message, 'erro');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold mb-1 text-[#1A1D1F]">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={modalEdicaoOperador.nome}
                  onChange={(e) => setModalEdicaoOperador({ ...modalEdicaoOperador, nome: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] font-bold text-sm outline-none focus:border-[#0B6EFD]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#1A1D1F]">E-mail de Acesso</label>
                <input
                  type="email"
                  disabled
                  value={modalEdicaoOperador.email || ''}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-slate-50 font-mono text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#1A1D1F]">Posto / Tenda de Atuação</label>
                <select
                  value={modalEdicaoOperador.tenda_id || ''}
                  onChange={(e) => setModalEdicaoOperador({ ...modalEdicaoOperador, tenda_id: e.target.value || null })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD]"
                >
                  <option value="">Nenhum posto fixo</option>
                  {tendas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.praia})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Nível de Acesso</label>
                  <select
                    disabled={modalEdicaoOperador.id === operadorUserId}
                    value={modalEdicaoOperador.role || 'operador'}
                    onChange={(e) => setModalEdicaoOperador({ ...modalEdicaoOperador, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold text-xs outline-none"
                  >
                    <option value="operador">Voluntário / Posto</option>
                    <option value="admin">Coordenador Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Status da Conta</label>
                  <select
                    disabled={modalEdicaoOperador.id === operadorUserId}
                    value={modalEdicaoOperador.status || 'ativo'}
                    onChange={(e) => setModalEdicaoOperador({ ...modalEdicaoOperador, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold text-xs outline-none"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setModalEdicaoOperador(null)}
                  className="flex-1 py-2.5 border border-[#E5E7EB] font-bold rounded-xl text-[#6B7280] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B6EFD] text-white font-bold rounded-xl hover:bg-[#0857CC] shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EXCLUIR OPERADOR (COM PROTEÇÃO INSTITUCIONAL) */}
      {/* ========================================================= */}
      {modalExclusaoOperador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <UserMinus className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#1A1D1F]">
                Confirmar Remoção de Operador
              </h3>
              <p className="text-xs text-[#6B7280]">
                Tem certeza que deseja remover o operador <strong className="text-[#1A1D1F]">{modalExclusaoOperador.nome}</strong>?
              </p>
            </div>

            <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-3 rounded-xl text-xs text-[#991B1B] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Regra de Segurança Ativa:</span>
              </div>
              <p className="text-[11px] leading-tight">
                Coordenadores não podem excluir outros Coordenadores. Apenas voluntários e operadores de posto podem ser removidos.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalExclusaoOperador(null)}
                className="flex-1 py-2.5 border border-[#E5E7EB] font-bold rounded-xl text-[#6B7280] hover:bg-slate-50 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!operadorUserId) return;
                  try {
                    await dataService.excluirOperador(modalExclusaoOperador.id, operadorUserId);
                    showToast(`Operador ${modalExclusaoOperador.nome} removido com sucesso!`, 'sucesso');
                    setModalExclusaoOperador(null);
                    carregarDados();
                  } catch (err: any) {
                    showToast(err.message || 'Erro ao remover operador.', 'erro');
                  }
                }}
                className="flex-1 py-2.5 bg-[#DC2626] text-white font-bold rounded-xl hover:bg-red-700 shadow text-xs"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CADASTRO DIRETO DE USUÁRIO (COORDENADOR GERAL) */}
      {/* ========================================================= */}
      {modalNovoUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#16A34A]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1D1F]">Cadastrar Novo Usuário</h3>
                  <p className="text-[11px] text-[#6B7280]">Criação direta de credenciais de acesso</p>
                </div>
              </div>
              <button 
                onClick={() => { setModalNovoUsuario(false); setErroModalUsuario(null); }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroModalUsuario && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{erroModalUsuario}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!operadorUserId) return;
                setErroModalUsuario(null);
                setSalvandoNovoUsuario(true);

                try {
                  await dataService.cadastrarOperadorDireto({
                    nome: formUsuarioNome,
                    email: formUsuarioEmail,
                    senha: formUsuarioSenha,
                    tendaId: formUsuarioTendaId || null,
                    role: formUsuarioRole,
                    executadoPorUserId: operadorUserId,
                  });

                  showToast(`Usuário ${formUsuarioNome} cadastrado com sucesso!`, 'sucesso');
                  setModalNovoUsuario(false);
                  carregarDados();
                } catch (err: any) {
                  setErroModalUsuario(err.message || 'Erro ao cadastrar usuário.');
                } finally {
                  setSalvandoNovoUsuario(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nome Completo */}
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={formUsuarioNome}
                    onChange={(e) => setFormUsuarioNome(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                  />
                </div>

                {/* E-mail de Acesso */}
                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="joao@anjosdapraia.org"
                    value={formUsuarioEmail}
                    onChange={(e) => setFormUsuarioEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] outline-none focus:border-[#16A34A] focus:bg-white text-xs"
                  />
                </div>

                {/* Senha Temporária */}
                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Senha Temporária * (min. 6)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formUsuarioSenha}
                    onChange={(e) => setFormUsuarioSenha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] outline-none focus:border-[#16A34A] focus:bg-white text-xs font-mono"
                  />
                </div>

                {/* Nível de Acesso (Role) */}
                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Função / Nível de Acesso *</label>
                  <select
                    value={formUsuarioRole}
                    onChange={(e) => setFormUsuarioRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold text-xs outline-none focus:border-[#16A34A] cursor-pointer"
                  >
                    <option value="operador">Voluntário / Operador de Tenda</option>
                    <option value="admin">Coordenador Geral (Admin Total)</option>
                  </select>
                </div>

                {/* Posto / Tenda Atribuída */}
                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Posto / Tenda de Atuação</label>
                  <select
                    value={formUsuarioTendaId}
                    onChange={(e) => setFormUsuarioTendaId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold text-xs outline-none focus:border-[#16A34A] cursor-pointer"
                  >
                    <option value="">Qualquer tenda / Geral</option>
                    {tendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.praia})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 space-y-0.5">
                <span className="font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Cadastro Instantâneo:
                </span>
                <p>O usuário já poderá fazer login imediatamente com o e-mail e a senha definidos acima.</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  disabled={salvandoNovoUsuario}
                  onClick={() => { setModalNovoUsuario(false); setErroModalUsuario(null); }}
                  className="flex-1 py-2.5 border border-[#E5E7EB] font-bold rounded-xl text-[#6B7280] hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoNovoUsuario}
                  className="flex-1 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  {salvandoNovoUsuario ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Cadastrar Usuário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: GERAR LINK DE CONVITE TEMPORAL */}
      {/* ========================================================= */}
      {modalNovoConvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#0B6EFD]" />
                <h3 className="text-base font-black text-[#1A1D1F]">Gerar Convite de Operador</h3>
              </div>
              <button onClick={() => { setModalNovoConvite(false); setConviteGeradoRecente(null); }}>
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {!conviteGeradoRecente ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!operadorUserId) return;
                  try {
                    const novo = await dataService.criarConvite({
                      criadorId: operadorUserId,
                      horasValidade: formConviteValidadeHoras,
                      tendaId: formConviteTendaId || null,
                      role: formConviteRole,
                      usosMaximos: formConviteUsos,
                    });
                    setConviteGeradoRecente(novo);
                    showToast('Link de convite temporal gerado com sucesso!', 'sucesso');
                    carregarDados();
                  } catch (err: any) {
                    showToast('Erro ao gerar convite: ' + err.message, 'erro');
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Tempo de Validade (Expiração Automática)</label>
                  <select
                    value={formConviteValidadeHoras}
                    onChange={(e) => setFormConviteValidadeHoras(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold outline-none focus:border-[#0B6EFD]"
                  >
                    <option value={1}>1 Hora (Urgência / Imediato)</option>
                    <option value={6}>6 Horas (Turno de Praia)</option>
                    <option value={24}>24 Horas (1 Dia)</option>
                    <option value={72}>3 Dias (Fim de Semana)</option>
                    <option value={168}>7 Dias (1 Semana)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#1A1D1F]">Posto / Tenda Pré-Definida (Opcional)</label>
                  <select
                    value={formConviteTendaId}
                    onChange={(e) => setFormConviteTendaId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD]"
                  >
                    <option value="">Qualquer posto (voluntário escolhe)</option>
                    {tendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.praia})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1 text-[#1A1D1F]">Nível Atribuído</label>
                    <select
                      value={formConviteRole}
                      onChange={(e) => setFormConviteRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold outline-none"
                    >
                      <option value="operador">Voluntário</option>
                      <option value="admin">Coordenador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#1A1D1F]">Limite de Usos</label>
                    <select
                      value={formConviteUsos}
                      onChange={(e) => setFormConviteUsos(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold outline-none"
                    >
                      <option value={1}>1 Uso (Individual)</option>
                      <option value={5}>Até 5 Voluntários</option>
                      <option value={10}>Até 10 Voluntários</option>
                      <option value={50}>Grupo Grande (50)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoConvite(false)}
                    className="flex-1 py-2.5 border border-[#E5E7EB] font-bold rounded-xl text-[#6B7280] hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#0B6EFD] text-white font-bold rounded-xl hover:bg-[#0857CC] shadow"
                  >
                    Criar Convite
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                    Convite Pronto para Envio
                  </span>
                  <div className="font-mono text-2xl font-black text-emerald-700 tracking-widest">
                    {conviteGeradoRecente.codigo}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Válido até {new Date(conviteGeradoRecente.expira_em).toLocaleString('pt-BR')} ({conviteGeradoRecente.usos_maximos} uso(s))
                  </div>
                  {(() => {
                    const tVinculada = tendas.find(t => t.id === conviteGeradoRecente.tenda_id) || conviteGeradoRecente.tenda;
                    if (tVinculada?.nome) {
                      return (
                        <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full text-emerald-900 font-bold text-xs border border-emerald-300 shadow-xs">
                          <Tent className="w-3.5 h-3.5 text-[#FF6B35]" />
                          <span>Posto: {tVinculada.nome}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1">
                  <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Link de Cadastro Direto:</span>
                  <div className="font-mono text-xs text-[#0B6EFD] break-all select-all font-semibold">
                    {`${window.location.origin}/login?convite=${conviteGeradoRecente.codigo}`}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/login?convite=${conviteGeradoRecente.codigo}`;
                      navigator.clipboard.writeText(link);
                      showToast('Link de convite copiado!', 'sucesso');
                    }}
                    className="flex-1 py-2.5 bg-[#0B6EFD] text-white font-bold text-xs rounded-xl hover:bg-[#0857CC] shadow flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </button>

                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/login?convite=${conviteGeradoRecente.codigo}`;
                      const msg = encodeURIComponent(`Olá! Você foi convidado para a equipe dos Anjos da Praia. Cadastre-se pelo link seguro: ${link}`);
                      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                    }}
                    className="flex-1 py-2.5 bg-[#16A34A] text-white font-bold text-xs rounded-xl hover:bg-[#15803D] shadow flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

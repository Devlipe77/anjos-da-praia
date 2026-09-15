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
  Tent,
  AlertTriangle,
  User as UserIcon,
  Check,
  Flame,
  Crosshair,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { dataService, supabase } from '../lib/supabase';
import { PulseiraCadastro, Ocorrencia, Tenda, StatusOcorrencia, traduzirErroSupabase } from '../types';
import { MapView } from '../components/MapView';
import { StatusBadge } from '../components/StatusBadge';
import { QRCodeModal } from '../components/QRCodeModal';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // Seção ativa do menu lateral
  const [secaoAtiva, setSecaoAtiva] = useState<'dashboard' | 'monitoramento' | 'pulseiras' | 'tendas' | 'impressao' | 'relatorios'>('dashboard');
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Estados de dados principais
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [cadastros, setCadastros] = useState<PulseiraCadastro[]>([]);
  const [tendas, setTendas] = useState<Tenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);

  // Operador atual logado
  const [operadorEmail, setOperadorEmail] = useState<string>('operador@anjosdapraia.org');
  const [operadorNome, setOperadorNome] = useState<string>('Operador Central');
  const [tendaOperador, setTendaOperador] = useState<string>('Posto Praia do Morro');

  // Filtros de busca
  const [termoBuscaPulseira, setTermoBuscaPulseira] = useState('');

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

  // Notificações Toast no Topo
  const [toast, setToast] = useState<{ tipo: 'erro' | 'sucesso'; mensagem: string } | null>(null);

  const showToast = (mensagem: string, tipo: 'erro' | 'sucesso' = 'erro') => {
    setToast({ tipo, mensagem });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Presets de Praias e Coordenadas de Guarapari
  const PRESETS_GUARAPARI = [
    { nome: 'Praia do Morro (Central)', praia: 'Praia do Morro', lat: -20.6590, lng: -40.4950 },
    { nome: 'Pedra do Siribeira', praia: 'Praia do Morro', lat: -20.6525, lng: -40.4850 },
    { nome: 'Castanheiras', praia: 'Praia das Castanheiras', lat: -20.6720, lng: -40.4975 },
    { nome: 'Areia Preta', praia: 'Praia da Areia Preta', lat: -20.6765, lng: -40.5005 },
    { nome: 'Meaípe', praia: 'Praia de Meaípe', lat: -20.7420, lng: -40.5280 },
    { nome: 'Enseada Azul', praia: 'Enseada Azul', lat: -20.7150, lng: -40.5180 },
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

  // Bip sonoro suave via Web Audio API para novos alertas
  const tocarBipAlerta = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota Lá
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Silencioso se bloqueado pelo browser
    }
  };

  // Carregar dados de produção
  const carregarDados = async (tocarSom = false) => {
    try {
      const [ocos, cads, tens] = await Promise.all([
        dataService.listarOcorrencias(),
        dataService.listarCadastros(),
        dataService.listarTendas(),
      ]);

      if (tocarSom && ocos.length > ocorrencias.length) {
        tocarBipAlerta();
      }

      setOcorrencias(ocos);
      setCadastros(cads);
      setTendas(tens);

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
    // Buscar sessão do operador
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setOperadorEmail(session.user.email || 'operador@anjosdapraia.org');
        const metaNome = session.user.user_metadata?.nome;
        if (metaNome) setOperadorNome(metaNome);
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

  // Contadores
  const chamadosAtivos = useMemo(() => ocorrencias.filter(o => o.status !== 'Reencontro realizado'), [ocorrencias]);
  const chamadosConcluidos = useMemo(() => ocorrencias.filter(o => o.status === 'Reencontro realizado'), [ocorrencias]);

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
  const handleMudarStatus = async (ocoId: string, novoStatus: StatusOcorrencia) => {
    try {
      await dataService.atualizarStatusOcorrencia(ocoId, novoStatus, operadorNome);
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

  // Exportação de Relatório Geral em formato CSV para a Associação e Parceiros
  const exportarRelatorioCSV = () => {
    try {
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

      const linhas = ocorrencias.map(oco => [
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
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center shadow-md">
                <LifeBuoy className="w-6 h-6" />
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
          </nav>
        </div>

        {/* Rodapé do Operador Logado */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0B6EFD] text-white flex items-center justify-center font-bold text-xs">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold text-[#1A1D1F] truncate">{operadorNome}</div>
              <div className="text-[10px] text-[#6B7280] truncate">{operadorEmail}</div>
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
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarAberta(true)}
              className="lg:hidden p-2 rounded-xl text-[#6B7280] hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-black text-[#1A1D1F] tracking-tight capitalize">
              {secaoAtiva === 'dashboard' && 'Visão Geral da Operação'}
              {secaoAtiva === 'monitoramento' && 'Central Tática de Monitoramento'}
              {secaoAtiva === 'pulseiras' && 'Gerenciamento de Pulseiras'}
              {secaoAtiva === 'tendas' && 'Postos de Atendimento na Orla'}
              {secaoAtiva === 'impressao' && 'Emissão e Impressão de Pulseiras'}
              {secaoAtiva === 'relatorios' && 'Relatórios e Indicadores por Praia'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={exportarRelatorioCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              title="Exportar dados consolidados em planilha CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping"></span>
              <span>Supabase Realtime Ativo</span>
            </span>

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
              
              {/* KPIs Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#6B7280] text-xs font-bold uppercase mb-2">
                    <span>Crianças Cadastradas</span>
                    <Users className="w-4 h-4 text-[#0B6EFD]" />
                  </div>
                  <div className="text-3xl font-black text-[#1A1D1F]">{cadastros.length}</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">Pulseiras ativas no banco real</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#B45309] text-xs font-bold uppercase mb-2">
                    <span>Alertas em Aberto</span>
                    <Bell className="w-4 h-4 text-[#FF6B35]" />
                  </div>
                  <div className="text-3xl font-black text-[#FF6B35]">{chamadosAtivos.length}</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">Aguardando reencontro na praia</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between text-[#15803D] text-xs font-bold uppercase mb-2">
                    <span>Reencontros Feitos</span>
                    <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="text-3xl font-black text-[#16A34A]">{chamadosConcluidos.length}</div>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Taxa: {ocorrencias.length > 0 ? Math.round((chamadosConcluidos.length / ocorrencias.length) * 100) : 100}% de sucesso
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
                
                {/* Tabela Resumida de Ocorrências */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-extrabold text-[#1A1D1F] flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#FF6B35]" />
                      <span>Últimos Chamados em Tempo Real</span>
                    </h2>
                    <button
                      onClick={() => setSecaoAtiva('monitoramento')}
                      className="text-xs font-bold text-[#0B6EFD] hover:underline"
                    >
                      Abrir Mapa Completo →
                    </button>
                  </div>

                  {ocorrencias.length === 0 ? (
                    <div className="py-12 text-center text-[#6B7280]">
                      <CheckCircle className="w-10 h-10 text-[#16A34A] mx-auto mb-2 opacity-80" />
                      <div className="font-bold text-sm text-[#1A1D1F]">Nenhuma ocorrência pendente</div>
                      <p className="text-xs mt-1">A praia está tranquila neste momento.</p>
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
                          {ocorrencias.slice(0, 5).map((oco) => (
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
                </div>

                {ocorrencias.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center text-xs text-[#6B7280]">
                    Nenhum alerta registrado até o momento.
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1.5">
                    {ocorrencias.map((oco) => {
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
                            <StatusBadge status={oco.status} size="sm" />
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

                            {/* Dropdown de Mudança de Status */}
                            {oco.id && (
                              <select
                                value={oco.status}
                                onChange={(e) => handleMudarStatus(oco.id!, e.target.value as StatusOcorrencia)}
                                className="text-xs font-bold py-1 px-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1A1D1F] ml-auto outline-none"
                              >
                                <option value="Criança localizada">Criança localizada</option>
                                <option value="Equipe a caminho">Equipe a caminho</option>
                                <option value="Criança recebida">Criança na tenda</option>
                                <option value="Responsáveis localizados">Responsáveis localizados</option>
                                <option value="Reencontro realizado">Reencontro feito 🎉</option>
                              </select>
                            )}

                            {/* Cancelar Alarme Falso */}
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
                  ocorrencias={ocorrencias}
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
                      <button
                        onClick={() => setTendaOperador(t.nome)}
                        className="text-xs font-bold text-[#0B6EFD] hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Definir como minha tenda</span>
                      </button>

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
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
                    <Printer className="w-4 h-4 text-[#FF6B35]" />
                    <span>Folha de Impressão em Lote de Pulseiras</span>
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Gere grades de QR Codes prontos para recortar e distribuir nas tendas
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <label className="font-bold">Início #:</label>
                    <input
                      type="number"
                      value={loteInicio}
                      onChange={(e) => setLoteInicio(parseInt(e.target.value) || 1001)}
                      className="w-20 p-1.5 border border-[#E5E7EB] rounded-lg text-center font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <label className="font-bold">Qtd:</label>
                    <select
                      value={loteQuantidade}
                      onChange={(e) => setLoteQuantidade(parseInt(e.target.value))}
                      className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white font-bold"
                    >
                      <option value={6}>6 pulseiras</option>
                      <option value={12}>12 pulseiras</option>
                      <option value={24}>24 pulseiras</option>
                    </select>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E8531F] text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Folha</span>
                  </button>
                </div>
              </div>

              {/* Grade de Impressão */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                {Array.from({ length: loteQuantidade }).map((_, i) => {
                  const num = String(loteInicio + i);
                  const qrUrl = `${window.location.origin}/alerta?pulseira=${num}`;

                  return (
                    <div key={num} className="bg-white p-3 rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#FF6B35]">
                        ANJOS DA PRAIA
                      </div>
                      <div className="inline-block p-2 bg-white rounded-xl shadow-inner border border-[#E5E7EB]">
                        <QRCodeSVG value={qrUrl} size={110} level="M" />
                      </div>
                      <div className="text-base font-black font-mono text-[#1A1D1F]">
                        #{num}
                      </div>
                      <div className="text-[9px] text-[#6B7280]">
                        Aponte a câmera em caso de emergência
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* SEÇÃO 6: 📈 RELATÓRIOS & ESTATÍSTICAS POR PRAIA */}
          {/* ===================================================== */}
          {secaoAtiva === 'relatorios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header do Relatório com Exportador */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#FF6B35]" />
                    <span>Relatório Consolidado de Ocorrências & Praias</span>
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Histórico completo para prestação de contas com a Prefeitura de Guarapari e Corpo de Bombeiros Militar ES
                  </p>
                </div>

                <button
                  onClick={exportarRelatorioCSV}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Baixar Planilha Completa (.CSV)</span>
                </button>
              </div>

              {/* Indicadores por Praia */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { praia: 'Praia do Morro', cor: 'border-[#FF6B35]' },
                  { praia: 'Praia das Castanheiras', cor: 'border-[#0B6EFD]' },
                  { praia: 'Praia da Areia Preta', cor: 'border-[#10B981]' },
                  { praia: 'Praia de Meaípe', cor: 'border-[#8B5CF6]' }
                ].map(({ praia, cor }) => {
                  const ocosPraia = ocorrencias.filter(o => o.cadastro?.praia_origem === praia || o.tendaMaisProxima?.tenda?.praia === praia);
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

              {/* Tabela de Registro Geral com Auditoria LGPD */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1A1D1F]">
                    Auditoria de Ocorrências Registradas ({ocorrencias.length})
                  </h3>
                  <span className="text-[11px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                    Dados protegidos conforme LGPD
                  </span>
                </div>

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
                      {ocorrencias.map((oco) => (
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
                          <td className="py-3 px-3 font-mono text-[11px] text-[#6B7280]">
                            {oco.horario_alerta ? new Date(oco.horario_alerta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
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
              </div>

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
                <label className="block font-bold mb-1">Praia</label>
                <select
                  value={formPulseiraPraia}
                  onChange={(e) => setFormPulseiraPraia(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35]"
                >
                  <option value="Praia do Morro">Praia do Morro</option>
                  <option value="Praia das Castanheiras">Praia das Castanheiras</option>
                  <option value="Praia da Areia Preta">Praia da Areia Preta</option>
                  <option value="Praia de Meaípe">Praia de Meaípe</option>
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
                <label className="block font-bold mb-1">Praia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Praia do Morro"
                  value={formTendaPraia}
                  onChange={(e) => setFormTendaPraia(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
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
                <label className="block font-bold mb-1">Praia *</label>
                <input
                  type="text"
                  required
                  value={modalEdicaoTenda.praia || ''}
                  onChange={(e) => setModalEdicaoTenda({ ...modalEdicaoTenda, praia: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
                />
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

      {/* Modal QR Code Individual */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        numeroPulseira={qrNumero}
        nomeCrianca={qrCrianca}
      />

    </div>
  );
};

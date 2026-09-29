import React from 'react';
import { 
  Menu, 
  Download, 
  Camera, 
  FileDown, 
  Volume2, 
  VolumeX, 
  RefreshCw 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { exportarRelatorioCSV } from '../utils/exportCsv';

export const AdminHeader: React.FC = () => {
  const {
    secaoAtiva,
    setSidebarAberta,
    appJaInstalado,
    deferredPrompt,
    setPwaInstalavel,
    setAppJaInstalado,
    setDeferredPrompt,
    setScannerAdminAberto,
    ocorrencias,
    mostrarToast,
    somAtivado,
    toggleSomAtivado,
    loading,
    carregarDados
  } = useAdminStore();

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

  const handleExportarCsv = () => {
    exportarRelatorioCSV(ocorrencias, (msg, tipo) => {
      mostrarToast(tipo, msg);
    });
  };

  return (
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
          {secaoAtiva === 'usuarios' && 'Gestão de Equipe & Controle de Acesso'}
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
          onClick={handleExportarCsv}
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

        {/* Alternador de Sirene / Som de Alerta */}
        <button
          onClick={() => toggleSomAtivado()}
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
  );
};

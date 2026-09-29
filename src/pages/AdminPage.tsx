import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import {
  AdminHeader,
  AdminSidebar,
  AdminToast,
  DashboardTab,
  MonitoramentoTab,
  PulseirasTab,
  TendasTab,
  ImpressaoTab,
  RelatoriosTab,
  UsuariosTab,
  AdminModalsContainer,
  useAdminInit,
} from '../features/admin';

export const AdminPage: React.FC = () => {
  useAdminInit();
  const secaoAtiva = useAdminStore((s) => s.secaoAtiva);
  const loading = useAdminStore((s) => s.loading);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#1A1D1F]">
      {/* 1. Barra de Navegação Lateral */}
      <AdminSidebar />

      {/* 2. Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Topbar Superior */}
        <AdminHeader />

        {/* Feedback Operacional Toast */}
        <AdminToast />

        {/* Conteúdo Dinâmico da Aba Selecionada */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
                <span className="text-xs font-semibold text-[#6B7280]">
                  Carregando dados operacionais...
                </span>
              </div>
            </div>
          ) : (
            <>
              {secaoAtiva === 'dashboard' && <DashboardTab />}
              {secaoAtiva === 'monitoramento' && <MonitoramentoTab />}
              {secaoAtiva === 'pulseiras' && <PulseirasTab />}
              {secaoAtiva === 'tendas' && <TendasTab />}
              {secaoAtiva === 'impressao' && <ImpressaoTab />}
              {secaoAtiva === 'relatorios' && <RelatoriosTab />}
              {secaoAtiva === 'usuarios' && <UsuariosTab />}
            </>
          )}
        </main>
      </div>

      {/* 3. Modais Operacionais e Utilitários */}
      <AdminModalsContainer />
    </div>
  );
};

export default AdminPage;

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Tent, 
  BarChart3, 
  MapPin, 
  Users, 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  User as UserIcon, 
  UserCheck, 
  LogOut 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    sidebarAberta,
    setSidebarAberta,
    tendaOperador,
    secaoAtiva,
    setSecaoAtiva,
    cadastros,
    tendas,
    operadoresLista,
    operadorNome,
    operadorEmail,
    operadorRole,
    logout,
    ocorrencias
  } = useAdminStore();

  const chamadosAtivos = useMemo(
    () => ocorrencias.filter(o => o.status !== 'Reencontro realizado'),
    [ocorrencias]
  );

  const handleLogout = async () => {
    await logout(navigate);
  };

  return (
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
            aria-label="Fechar menu lateral"
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
            <div className="text-[10px] text-[#6B7280] truncate" title={operadorEmail || undefined}>
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
  );
};

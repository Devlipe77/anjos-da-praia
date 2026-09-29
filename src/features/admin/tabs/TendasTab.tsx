import React from 'react';
import { 
  Tent, 
  PlusCircle, 
  Check, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';

export const TendasTab: React.FC = () => {
  const {
    tendas,
    setModalNovaTenda,
    setModalEdicaoTenda,
    setModalExclusaoTenda,
    operadorTendaId,
    tendaOperador,
    definirTendaComoMinha
  } = useAdminStore();

  return (
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
                  onClick={() => definirTendaComoMinha(t)}
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
  );
};

import React from 'react';
import { X, AlertTriangle, History, Clock, User as UserIcon } from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatarDataHora } from '../utils/formatters';

export const ModalExclusaoOcorrencia: React.FC = () => {
  const {
    modalExclusaoOcorrencia,
    setModalExclusaoOcorrencia,
    excluirOcorrencia
  } = useAdminStore();

  if (!modalExclusaoOcorrencia) return null;

  const handleExcluir = async () => {
    if (modalExclusaoOcorrencia.id) {
      await excluirOcorrencia(modalExclusaoOcorrencia.id);
    }
  };

  return (
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
            onClick={handleExcluir}
            className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Sim, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalHistoricoOcorrencia: React.FC = () => {
  const {
    modalHistoricoOcorrencia,
    setModalHistoricoOcorrencia
  } = useAdminStore();

  if (!modalHistoricoOcorrencia) return null;

  return (
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
  );
};

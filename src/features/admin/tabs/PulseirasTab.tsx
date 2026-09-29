import React from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  QrCode, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { 
  useAdminStore, 
  selectCadastrosFiltrados 
} from '../../../store/useAdminStore';

export const PulseirasTab: React.FC = () => {
  const {
    cadastros,
    termoBuscaPulseira,
    setTermoBuscaPulseira,
    setModalNovaPulseira,
    abrirQrModal,
    setModalEdicaoPulseira,
    setModalExclusaoPulseira
  } = useAdminStore();

  const cadastrosFiltrados = useAdminStore(selectCadastrosFiltrados);

  return (
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
                      onClick={() => abrirQrModal(cad.numero_pulseira, cad.nome_crianca)}
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
  );
};

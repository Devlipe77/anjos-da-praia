import React from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Ticket, 
  Lock, 
  Tent, 
  Edit3, 
  Trash2, 
  Copy 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { dataService } from '../../../lib/supabase';

export const UsuariosTab: React.FC = () => {
  const {
    operadoresLista,
    convitesLista,
    tendas,
    operadorRole,
    operadorUserId,
    setModalNovoUsuario,
    setModalNovoConvite,
    setModalEdicaoOperador,
    setModalExclusaoOperador,
    moderarOperador,
    mostrarToast
  } = useAdminStore();

  const handleToggleBloqueio = async (id: string, isBloqueado: boolean, nome: string) => {
    try {
      const novoStatus = isBloqueado ? 'ativo' : 'bloqueado';
      await moderarOperador(id, novoStatus);
    } catch (e: any) {
      mostrarToast('erro', 'Erro ao moderar usuário: ' + (e?.message || 'Erro desconhecido'));
    }
  };

  const handleCopiarLinkConvite = (codigo: string) => {
    const link = `${window.location.origin}/login?convite=${codigo}`;
    navigator.clipboard.writeText(link);
    mostrarToast('sucesso', 'Link de convite copiado para a área de transferência!');
  };

  return (
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
                onClick={() => setModalNovoUsuario(true)}
                className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                title="Cadastrar um operador ou coordenador diretamente no sistema"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>

              <button
                onClick={() => setModalNovoConvite(true)}
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
                              onClick={() => handleToggleBloqueio(op.id, isBloqueado, op.nome)}
                              className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                                isBloqueado
                                  ? 'border-green-300 text-green-700 hover:bg-green-50'
                                  : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              {isBloqueado ? 'Reativar' : 'Bloquear'}
                            </button>

                            {/* Editar Operador */}
                            <button
                              onClick={() => setModalEdicaoOperador(op)}
                              className="p-1.5 text-[#0B6EFD] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                              title="Editar operador"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Excluir Operador */}
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
                            onClick={() => handleCopiarLinkConvite(conv.codigo)}
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
  );
};

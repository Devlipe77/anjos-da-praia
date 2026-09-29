import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Edit3, 
  UserMinus, 
  ShieldAlert, 
  UserPlus, 
  Check, 
  RefreshCw, 
  Ticket, 
  Tent, 
  Copy, 
  Share2 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';

export const ModalEdicaoOperador: React.FC = () => {
  const {
    modalEdicaoOperador,
    setModalEdicaoOperador,
    operadorUserId,
    tendas,
    atualizarOperador
  } = useAdminStore();

  if (!modalEdicaoOperador) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await atualizarOperador(modalEdicaoOperador.id, {
      nome: modalEdicaoOperador.nome,
      role: modalEdicaoOperador.role,
      tenda_id: modalEdicaoOperador.tenda_id || null,
      status: modalEdicaoOperador.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#0B6EFD]" />
            <h3 className="text-base font-black text-[#1A1D1F]">Editar Cadastro de Operador</h3>
          </div>
          <button onClick={() => setModalEdicaoOperador(null)} className="text-[#6B7280] hover:text-[#1A1D1F] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
  );
};

export const ModalExclusaoOperador: React.FC = () => {
  const {
    modalExclusaoOperador,
    setModalExclusaoOperador,
    excluirOperador
  } = useAdminStore();

  if (!modalExclusaoOperador) return null;

  const handleExcluir = async () => {
    await excluirOperador(modalExclusaoOperador.id);
  };

  return (
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
            onClick={handleExcluir}
            className="flex-1 py-2.5 bg-[#DC2626] text-white font-bold rounded-xl hover:bg-red-700 shadow text-xs"
          >
            Confirmar Remoção
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalNovoUsuario: React.FC = () => {
  const {
    modalNovoUsuario,
    setModalNovoUsuario,
    tendas,
    cadastrarOperadorDireto
  } = useAdminStore();

  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formTendaId, setFormTendaId] = useState('');
  const [formRole, setFormRole] = useState<'operador' | 'admin'>('operador');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!modalNovoUsuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      await cadastrarOperadorDireto({
        nome: formNome.trim(),
        email: formEmail.trim(),
        senha: formSenha,
        tendaId: formTendaId || null,
        role: formRole,
      });
      setFormNome('');
      setFormEmail('');
      setFormSenha('');
      setFormTendaId('');
      setFormRole('operador');
    } catch (err: any) {
      setErro(err?.message || 'Erro ao cadastrar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  return (
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
            onClick={() => { setModalNovoUsuario(false); setErro(null); }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-[#1A1D1F]">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] outline-none focus:border-[#16A34A] focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#1A1D1F]">E-mail de Login *</label>
              <input
                type="email"
                required
                placeholder="joao@anjosdapraia.org"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] outline-none focus:border-[#16A34A] focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#1A1D1F]">Senha Temporária * (min. 6)</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formSenha}
                onChange={(e) => setFormSenha(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] outline-none focus:border-[#16A34A] focus:bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#1A1D1F]">Função / Nível de Acesso *</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold text-xs outline-none focus:border-[#16A34A] cursor-pointer"
              >
                <option value="operador">Voluntário / Operador de Tenda</option>
                <option value="admin">Coordenador Geral (Admin Total)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#1A1D1F]">Posto / Tenda de Atuação</label>
              <select
                value={formTendaId}
                onChange={(e) => setFormTendaId(e.target.value)}
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
              disabled={salvando}
              onClick={() => { setModalNovoUsuario(false); setErro(null); }}
              className="flex-1 py-2.5 border border-[#E5E7EB] font-bold rounded-xl text-[#6B7280] hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              {salvando ? (
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
  );
};

export const ModalNovoConvite: React.FC = () => {
  const {
    modalNovoConvite,
    setModalNovoConvite,
    conviteGeradoRecente,
    setConviteGeradoRecente,
    tendas,
    criarConvite,
    mostrarToast
  } = useAdminStore();

  const [formHoras, setFormHoras] = useState(24);
  const [formTendaId, setFormTendaId] = useState('');
  const [formRole, setFormRole] = useState<'operador' | 'admin'>('operador');
  const [formUsos, setFormUsos] = useState(1);

  if (!modalNovoConvite) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criarConvite({
        horasValidade: formHoras,
        tendaId: formTendaId || null,
        role: formRole,
        usosMaximos: formUsos,
      });
    } catch (err: any) {
      mostrarToast('erro', 'Erro ao gerar convite: ' + (err?.message || 'Erro desconhecido'));
    }
  };

  const fechar = () => {
    setModalNovoConvite(false);
    setConviteGeradoRecente(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#0B6EFD]" />
            <h3 className="text-base font-black text-[#1A1D1F]">Gerar Convite de Operador</h3>
          </div>
          <button onClick={fechar} className="text-[#6B7280] hover:text-[#1A1D1F] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!conviteGeradoRecente ? (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[#1A1D1F]">Tempo de Validade (Expiração Automática)</label>
              <select
                value={formHoras}
                onChange={(e) => setFormHoras(Number(e.target.value))}
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
                value={formTendaId}
                onChange={(e) => setFormTendaId(e.target.value)}
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
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold outline-none"
                >
                  <option value="operador">Voluntário</option>
                  <option value="admin">Coordenador</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1 text-[#1A1D1F]">Limite de Usos</label>
                <select
                  value={formUsos}
                  onChange={(e) => setFormUsos(Number(e.target.value))}
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
                onClick={fechar}
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
                  mostrarToast('sucesso', 'Link de convite copiado!');
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
  );
};

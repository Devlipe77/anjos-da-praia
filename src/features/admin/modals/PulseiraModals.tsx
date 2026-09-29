import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';

export const ModalNovaPulseira: React.FC = () => {
  const {
    modalNovaPulseira,
    setModalNovaPulseira,
    praiasCadastradas,
    cadastrarPulseira
  } = useAdminStore();

  const [formNumero, setFormNumero] = useState('');
  const [formCrianca, setFormCrianca] = useState('');
  const [formResponsavel, setFormResponsavel] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formPraia, setFormPraia] = useState('Praia do Morro');
  const [formObs, setFormObs] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  if (!modalNovaPulseira) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumero.trim() || !formResponsavel.trim() || !formTelefone.trim()) {
      setErro('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    try {
      setErro(null);
      await cadastrarPulseira({
        numero_pulseira: formNumero.trim(),
        nome_responsavel: formResponsavel.trim(),
        telefone_contato: formTelefone.trim(),
        nome_crianca: formCrianca.trim() || undefined,
        praia_origem: formPraia,
        observacoes: formObs.trim() || undefined
      });
      setFormNumero('');
      setFormCrianca('');
      setFormResponsavel('');
      setFormTelefone('');
      setFormPraia('Praia do Morro');
      setFormObs('');
      setModalNovaPulseira(false);
    } catch (err: any) {
      setErro(err?.message || 'Erro ao cadastrar pulseira.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <h3 className="text-base font-black text-[#1A1D1F]">Cadastrar Pulseira</h3>
          <button 
            onClick={() => setModalNovaPulseira(false)}
            className="text-[#6B7280] hover:text-[#1A1D1F] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="leading-snug font-medium text-xs">
                {erro}
              </div>
            </div>
          )}
          <div>
            <label className="block font-bold mb-1">Número da Pulseira *</label>
            <input
              type="text"
              required
              placeholder="Ex: 1004"
              value={formNumero}
              onChange={(e) => setFormNumero(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] font-bold text-sm outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Nome da Criança</label>
            <input
              type="text"
              placeholder="Ex: Pedro Henrique"
              value={formCrianca}
              onChange={(e) => setFormCrianca(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Nome do Responsável *</label>
            <input
              type="text"
              required
              placeholder="Ex: Juliana Martins"
              value={formResponsavel}
              onChange={(e) => setFormResponsavel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Telefone WhatsApp *</label>
            <input
              type="tel"
              required
              placeholder="Ex: (27) 99888-7766"
              value={formTelefone}
              onChange={(e) => setFormTelefone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Praia de Origem / Balneário</label>
            <select
              value={formPraia}
              onChange={(e) => setFormPraia(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35]"
            >
              {praiasCadastradas.map((p) => (
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
              value={formObs}
              onChange={(e) => setFormObs(e.target.value)}
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
  );
};

export const ModalEdicaoPulseira: React.FC = () => {
  const {
    modalEdicaoPulseira,
    setModalEdicaoPulseira,
    atualizarPulseira
  } = useAdminStore();

  const [formCrianca, setFormCrianca] = useState('');
  const [formResponsavel, setFormResponsavel] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formObs, setFormObs] = useState('');

  useEffect(() => {
    if (modalEdicaoPulseira) {
      setFormCrianca(modalEdicaoPulseira.nome_crianca || '');
      setFormResponsavel(modalEdicaoPulseira.nome_responsavel || '');
      setFormTelefone(modalEdicaoPulseira.telefone_contato || '');
      setFormObs(modalEdicaoPulseira.observacoes || '');
    }
  }, [modalEdicaoPulseira]);

  if (!modalEdicaoPulseira) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicaoPulseira?.id || !formResponsavel.trim() || !formTelefone.trim()) return;

    await atualizarPulseira(modalEdicaoPulseira.id, {
      nome_crianca: formCrianca.trim() || undefined,
      nome_responsavel: formResponsavel.trim(),
      telefone_contato: formTelefone.trim(),
      observacoes: formObs.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <h3 className="text-base font-black text-[#1A1D1F]">
            Editar Pulseira #{modalEdicaoPulseira.numero_pulseira}
          </h3>
          <button 
            onClick={() => setModalEdicaoPulseira(null)}
            className="text-[#6B7280] hover:text-[#1A1D1F] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Nome da Criança</label>
            <input
              type="text"
              value={formCrianca}
              onChange={(e) => setFormCrianca(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Responsável *</label>
            <input
              type="text"
              required
              value={formResponsavel}
              onChange={(e) => setFormResponsavel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Telefone WhatsApp *</label>
            <input
              type="text"
              required
              value={formTelefone}
              onChange={(e) => setFormTelefone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Observações</label>
            <textarea
              rows={2}
              value={formObs}
              onChange={(e) => setFormObs(e.target.value)}
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
  );
};

export const ModalExclusaoPulseira: React.FC = () => {
  const {
    modalExclusaoPulseira,
    setModalExclusaoPulseira,
    excluirPulseira
  } = useAdminStore();

  if (!modalExclusaoPulseira) return null;

  const handleExcluir = async () => {
    if (!modalExclusaoPulseira?.id) return;
    await excluirPulseira(modalExclusaoPulseira.id);
  };

  return (
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
            onClick={handleExcluir}
            className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

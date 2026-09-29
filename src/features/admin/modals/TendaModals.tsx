import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, MapPin, Crosshair } from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { PRESETS_GUARAPARI } from '../constants/adminConstants';

export const ModalNovaTenda: React.FC = () => {
  const {
    modalNovaTenda,
    setModalNovaTenda,
    praiasCadastradas,
    cadastrarTenda
  } = useAdminStore();

  const [formNome, setFormNome] = useState('');
  const [formPraia, setFormPraia] = useState('Praia do Morro');
  const [formPraiaId, setFormPraiaId] = useState<string | undefined>(undefined);
  const [formLat, setFormLat] = useState('-20.6552');
  const [formLng, setFormLng] = useState('-40.4880');
  const [formResp, setFormResp] = useState('');
  const [formTel, setFormTel] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [capturandoGps, setCapturandoGps] = useState(false);

  if (!modalNovaTenda) return null;

  const handleCapturarGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não suportada neste navegador.');
      return;
    }
    setCapturandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCapturandoGps(false);
        setFormLat(pos.coords.latitude.toFixed(6));
        setFormLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        setCapturandoGps(false);
        console.warn('GPS não capturado:', err);
        alert('Não foi possível obter o GPS com precisão. Verifique a permissão de localização do navegador.');
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim() || !formPraia.trim()) {
      setErro('Preencha os campos obrigatórios (*).');
      return;
    }

    try {
      setErro(null);
      await cadastrarTenda({
        nome: formNome.trim(),
        praia: formPraia.trim(),
        latitude: parseFloat(formLat) || -20.6552,
        longitude: parseFloat(formLng) || -40.4880,
        responsavel_posto: formResp.trim() || undefined,
        telefone_posto: formTel.trim() || undefined,
        praia_id: formPraiaId,
        ativa: true
      });
      setFormNome('');
      setFormResp('');
      setFormTel('');
      setModalNovaTenda(false);
    } catch (err: any) {
      setErro(err?.message || 'Erro ao cadastrar posto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <h3 className="text-base font-black text-[#1A1D1F]">Cadastrar Posto / Tenda</h3>
          <button onClick={() => setModalNovaTenda(false)} className="text-[#6B7280] hover:text-[#1A1D1F] p-1">
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
            <label className="block font-bold mb-1">Nome do Posto *</label>
            <input
              type="text"
              required
              placeholder="Ex: Tenda 01 - Praia do Morro"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold">Praia de Localização *</label>
              <span className="text-[10px] text-[#FF6B35] font-semibold">Preenche GPS automático</span>
            </div>
            <select
              required
              value={formPraia}
              onChange={(e) => {
                const praiaNome = e.target.value;
                setFormPraia(praiaNome);
                const praiaObj = praiasCadastradas.find(p => p.nome === praiaNome);
                if (praiaObj) {
                  setFormPraiaId(praiaObj.id);
                  setFormLat(praiaObj.latitude_padrao.toFixed(6));
                  setFormLng(praiaObj.longitude_padrao.toFixed(6));
                }
              }}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1D1F] font-bold outline-none focus:border-[#FF6B35]"
            >
              <option value="" disabled>Selecione uma praia oficial de Guarapari...</option>
              {praiasCadastradas.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} ({p.regiao})
                </option>
              ))}
            </select>
          </div>

          {/* Localização & Coordenadas */}
          <div className="p-3 bg-[#F9F1E7]/50 rounded-2xl border border-[#FF6B35]/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1A1D1F] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" /> Coordenadas do Posto
              </label>
              <button
                type="button"
                onClick={handleCapturarGps}
                disabled={capturandoGps}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-lg font-bold text-[10px] transition-colors disabled:opacity-50"
              >
                <Crosshair className={`w-3 h-3 ${capturandoGps ? 'animate-spin' : ''}`} />
                {capturandoGps ? 'Obtendo GPS...' : 'Pegar GPS Atual'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#6B7280] font-semibold mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  placeholder="-20.6590"
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] outline-none font-mono text-xs bg-white focus:border-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#6B7280] font-semibold mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
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
                      setFormPraia(preset.praia);
                      setFormLat(preset.lat.toFixed(6));
                      setFormLng(preset.lng.toFixed(6));
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
              value={formResp}
              onChange={(e) => setFormResp(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Telefone / Rádio</label>
            <input
              type="text"
              placeholder="Ex: (27) 99777-6655"
              value={formTel}
              onChange={(e) => setFormTel(e.target.value)}
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
  );
};

export const ModalEdicaoTenda: React.FC = () => {
  const {
    modalEdicaoTenda,
    setModalEdicaoTenda,
    praiasCadastradas,
    atualizarTenda
  } = useAdminStore();

  const [capturandoGps, setCapturandoGps] = useState(false);

  if (!modalEdicaoTenda) return null;

  const handleCapturarGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não suportada neste navegador.');
      return;
    }
    setCapturandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCapturandoGps(false);
        setModalEdicaoTenda({
          ...modalEdicaoTenda,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        });
      },
      (err) => {
        setCapturandoGps(false);
        console.warn('GPS não capturado:', err);
        alert('Não foi possível obter o GPS com precisão. Verifique a permissão de localização do navegador.');
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicaoTenda?.id || !modalEdicaoTenda.nome.trim()) return;

    await atualizarTenda(modalEdicaoTenda.id, {
      nome: modalEdicaoTenda.nome,
      praia: modalEdicaoTenda.praia,
      praia_id: modalEdicaoTenda.praia_id,
      latitude: modalEdicaoTenda.latitude,
      longitude: modalEdicaoTenda.longitude,
      responsavel_posto: modalEdicaoTenda.responsavel_posto,
      telefone_posto: modalEdicaoTenda.telefone_posto,
      ativa: modalEdicaoTenda.ativa !== false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <h3 className="text-base font-black text-[#1A1D1F]">Editar Posto / Tenda</h3>
          <button onClick={() => setModalEdicaoTenda(null)} className="text-[#6B7280] hover:text-[#1A1D1F] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold">Praia de Localização *</label>
              <span className="text-[10px] text-[#FF6B35] font-semibold">Preenche GPS automático</span>
            </div>
            <select
              required
              value={modalEdicaoTenda.praia || ''}
              onChange={(e) => {
                const praiaNome = e.target.value;
                const praiaObj = praiasCadastradas.find(p => p.nome === praiaNome);
                setModalEdicaoTenda({
                  ...modalEdicaoTenda,
                  praia: praiaNome,
                  praia_id: praiaObj?.id || modalEdicaoTenda.praia_id || null,
                  latitude: praiaObj ? praiaObj.latitude_padrao : modalEdicaoTenda.latitude,
                  longitude: praiaObj ? praiaObj.longitude_padrao : modalEdicaoTenda.longitude,
                });
              }}
              className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1D1F] font-bold outline-none focus:border-[#FF6B35]"
            >
              <option value="" disabled>Selecione uma praia oficial de Guarapari...</option>
              {praiasCadastradas.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} ({p.regiao})
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Localização e Coordenadas para Edição */}
          <div className="p-3 bg-[#F9F1E7]/50 rounded-2xl border border-[#FF6B35]/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1A1D1F] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" /> Coordenadas do Posto
              </label>
              <button
                type="button"
                onClick={handleCapturarGps}
                disabled={capturandoGps}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-lg font-bold text-[10px] transition-colors disabled:opacity-50"
              >
                <Crosshair className={`w-3 h-3 ${capturandoGps ? 'animate-spin' : ''}`} />
                {capturandoGps ? 'Obtendo GPS...' : 'Pegar GPS Atual'}
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
  );
};

export const ModalExclusaoTenda: React.FC = () => {
  const {
    modalExclusaoTenda,
    setModalExclusaoTenda,
    excluirTenda
  } = useAdminStore();

  if (!modalExclusaoTenda) return null;

  const handleExcluir = async () => {
    if (!modalExclusaoTenda?.id) return;
    await excluirTenda(modalExclusaoTenda.id);
  };

  return (
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
            onClick={handleExcluir}
            className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  Heart, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import { dataService } from '../lib/supabase';
import confetti from 'canvas-confetti';

export const AlertPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pulseiraUrl = searchParams.get('pulseira') || '';

  const [numeroPulseira, setNumeroPulseira] = useState(pulseiraUrl);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [coordenadasEnviadas, setCoordenadasEnviadas] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (pulseiraUrl) {
      setNumeroPulseira(pulseiraUrl);
    }
  }, [pulseiraUrl]);

  const dispararAlertaComCoordenadas = async (lat: number, lng: number, precisao = 10) => {
    setLoading(true);
    setErro(null);

    try {
      if (!numeroPulseira.trim()) {
        throw new Error('Por favor, informe o número gravado na pulseira da criança.');
      }

      await dataService.dispararAlerta({
        numero_pulseira: numeroPulseira.trim(),
        latitude: lat,
        longitude: lng,
        precisao_metros: precisao,
      });

      setCoordenadasEnviadas({ lat, lng });
      setSucesso(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Silencioso
      }
    } catch (err: any) {
      console.error(err);
      setErro(err.message || 'Erro ao enviar o chamado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapturarGPS = () => {
    if (!numeroPulseira.trim()) {
      setErro('Por favor, informe o número da pulseira.');
      return;
    }

    if (!('geolocation' in navigator)) {
      // Coordenadas centrais da Praia do Morro (Guarapari)
      dispararAlertaComCoordenadas(-20.6552, -40.4880, 40);
      return;
    }

    setLoading(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispararAlertaComCoordenadas(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy
        );
      },
      (err) => {
        console.warn('GPS não liberado:', err);
        setErro('O acesso ao GPS não foi autorizado. Deseja enviar com a localização aproximada da praia?');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0,
      }
    );
  };

  const handleUsarLocalizacaoAproximada = () => {
    // Praia do Morro - Guarapari com leve dispersão
    const lat = -20.6550 + (Math.random() - 0.5) * 0.003;
    const lng = -40.4880 + (Math.random() - 0.5) * 0.003;
    dispararAlertaComCoordenadas(lat, lng, 25);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between">
      
      {/* Topo Limpo */}
      <header className="p-4 flex items-center justify-between max-w-md mx-auto w-full">
        <Link 
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A1D1F] font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Acesso Operacional</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1D1F]">
          <LifeBuoy className="w-4 h-4 text-[#FF6B35]" />
          <span>Anjos da Praia</span>
        </div>
      </header>

      {/* Card Central Limpo e de Alto Impacto */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          
          {/* Header do Card (Areia Clara #F9F1E7) */}
          <div className="bg-[#F9F1E7] p-6 text-center border-b border-[#E5E7EB]">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-[#E5E7EB]">
              <ShieldAlert className="w-8 h-8 text-[#FF6B35]" />
            </div>
            <h1 className="text-2xl font-black text-[#1A1D1F] tracking-tight leading-tight">
              Criança Perdida na Praia?
            </h1>
            <p className="text-xs font-semibold text-[#6B7280] mt-1">
              Acione a equipe de socorristas da tenda em 1 clique
            </p>
          </div>

          <div className="p-6">
            {!sucesso ? (
              <div className="space-y-5">
                
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 text-xs text-[#1D4ED8] flex items-start gap-3">
                  <Heart className="w-5 h-5 text-[#0B6EFD] flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="block text-[#1E3A8A] font-bold mb-0.5">Mantenha a calma!</strong>
                    Nossos voluntários estão a postos na orla. Fique com a criança no local visível enquanto enviamos as coordenadas.
                  </div>
                </div>

                {/* Número da Pulseira */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1A1D1F] mb-1.5 text-center">
                    Número na Pulseira da Criança:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: 1001"
                      value={numeroPulseira}
                      onChange={(e) => setNumeroPulseira(e.target.value)}
                      className="w-full text-center text-4xl tracking-widest font-black py-3 px-4 rounded-2xl border-2 border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 outline-none transition-all placeholder:text-slate-300 text-[#1A1D1F]"
                    />
                    {pulseiraUrl && (
                      <span className="absolute right-3 top-4 text-[10px] bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                        Via QR Code
                      </span>
                    )}
                  </div>
                </div>

                {/* Erro e Fallback */}
                {erro && (
                  <div className="bg-[#FEE2E2] border border-[#FCA5A5] text-[#DC2626] text-xs p-3.5 rounded-xl space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{erro}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleUsarLocalizacaoAproximada}
                      className="w-full bg-white hover:bg-red-50 text-[#DC2626] font-bold py-1.5 px-3 rounded-lg text-xs border border-[#FCA5A5] transition-colors"
                    >
                      Enviar com Localização de Praia do Morro
                    </button>
                  </div>
                )}

                {/* BOTÃO PRINCIPAL DE AÇÃO (CORAL / SOL #FF6B35) */}
                <button
                  type="button"
                  disabled={loading || !numeroPulseira.trim()}
                  onClick={handleCapturarGPS}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                    loading || !numeroPulseira.trim()
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-[#FF6B35] hover:bg-[#E8531F] active:scale-[0.98] alert-pulse'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Capturando GPS e Enviando...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-6 h-6" />
                      <span>ENVIAR LOCALIZAÇÃO AGORA</span>
                    </>
                  )}
                </button>

                {/* Mensagem Institucional de Parceiro (Item 7 do Edital) */}
                <div className="pt-3 border-t border-[#E5E7EB] text-center">
                  <p className="text-[11px] text-[#6B7280] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Apoio: Prefeitura de Guarapari & Corpo de Bombeiros Militar ES</span>
                  </p>
                </div>
              </div>
            ) : (
              /* TELA DE CONFIRMAÇÃO */
              <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-[#DCFCE7] text-[#16A34A] rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-[#BBF7D0]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <span className="inline-block bg-[#DCFCE7] text-[#15803D] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                    Alerta Enviado à Tenda!
                  </span>
                  <h2 className="text-2xl font-black text-[#1A1D1F]">
                    A equipe já está a caminho!
                  </h2>
                </div>

                <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB] text-left space-y-2 text-xs text-[#1A1D1F]">
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-1.5">
                    <span className="text-[#6B7280]">Pulseira da Criança:</span>
                    <span className="font-extrabold text-[#1A1D1F]">#{numeroPulseira}</span>
                  </div>
                  {coordenadasEnviadas && (
                    <div className="flex justify-between border-b border-[#E5E7EB] pb-1.5">
                      <span className="text-[#6B7280]">Coordenadas GPS:</span>
                      <span className="font-mono text-[#1A1D1F]">
                        {coordenadasEnviadas.lat.toFixed(4)}, {coordenadasEnviadas.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Status da Operação:</span>
                    <span className="text-[#0B6EFD] font-bold">Socorristas Notificados</span>
                  </div>
                </div>

                <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-3.5 text-left text-xs text-[#B45309] space-y-1">
                  <strong className="block font-bold">Orientações de Segurança:</strong>
                  <p>1. Permaneça no local exato onde você enviou este alerta.</p>
                  <p>2. Busque um ponto de referência visível (um quiosque ou guarda-sol colorido).</p>
                  <p>3. A equipe dos Anjos da Praia está uniformizada e chegará em instantes.</p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSucesso(false);
                      setNumeroPulseira('');
                    }}
                    className="text-xs text-[#6B7280] hover:text-[#1A1D1F] font-semibold underline"
                  >
                    Registrar outro chamado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-[11px] text-[#6B7280]">
        Associação Anjos da Praia • Guarapari - ES
      </footer>
    </div>
  );
};

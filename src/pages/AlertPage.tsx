import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  Heart, 
  ArrowLeft, 
  PhoneCall, 
  Loader2, 
  HelpCircle,
  Sparkles
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

      // Dispara confete suave para alívio emocional
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Silencioso se der falha
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
      setErro('Por favor, digite o número da pulseira.');
      return;
    }

    if (!('geolocation' in navigator)) {
      // Fallback para coordenadas padrão de Guarapari caso o navegador não suporte
      dispararAlertaComCoordenadas(-20.6552, -40.4880, 50);
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
        console.warn('Erro ou recusa no GPS:', err);
        // Não travar o fluxo se o banhista estiver no desktop ou recusou por engano
        // Oferece fallback amigável usando as coordenadas da praia
        setErro('Não foi possível obter o GPS com precisão exata. Deseja enviar com localização aproximada da praia?');
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
    // Coordenadas centrais da Praia do Morro (Guarapari) com leve jitter para demonstração
    const latBase = -20.6548 + (Math.random() - 0.5) * 0.004;
    const lngBase = -40.4875 + (Math.random() - 0.5) * 0.004;
    dispararAlertaComCoordenadas(latBase, lngBase, 25);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-500/10 via-slate-50 to-ocean-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-200/60 overflow-hidden">
        
        {/* Banner de Urgência / Cabeçalho */}
        <div className="bg-amber-500 text-slate-950 p-6 text-center relative">
          <Link 
            to="/" 
            className="absolute top-4 left-4 p-2 text-slate-900 hover:bg-amber-400 rounded-full transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
            <ShieldAlert className="w-9 h-9 text-amber-600" />
          </div>

          <h1 className="text-2xl font-black tracking-tight leading-tight">
            Criança Perdida na Praia?
          </h1>
          <p className="text-xs font-semibold text-slate-900 mt-1 opacity-90">
            Associação Anjos da Praia • Guarapari - ES
          </p>
        </div>

        {/* Corpo do Fluxo */}
        <div className="p-6">
          {!sucesso ? (
            <div className="space-y-5">
              <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-4 text-xs text-ocean-900 leading-relaxed flex items-start gap-3">
                <Heart className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-ocean-950 font-bold mb-0.5">Fique tranquilo(a)!</strong>
                  Você está a 1 clique de acionar a equipe de socorristas da tenda na praia. Mantenha a criança em segurança ao seu lado.
                </div>
              </div>

              {/* Campo do Número da Pulseira */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Número na Pulseira da Criança:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 1001"
                    value={numeroPulseira}
                    onChange={(e) => setNumeroPulseira(e.target.value)}
                    className="w-full text-center text-3xl tracking-widest font-black py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition-all placeholder:text-slate-300 text-slate-800"
                  />
                  {pulseiraUrl && (
                    <span className="absolute right-3 top-3.5 text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      Via QR Code
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-1.5">
                  Identifique o número impresso na fita plástica colocada na tenda.
                </p>
              </div>

              {/* Mensagem de Erro com Fallback */}
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{erro}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUsarLocalizacaoAproximada}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-900 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                  >
                    Enviar com Localização de Praia do Morro
                  </button>
                </div>
              )}

              {/* BOTÃO PRINCIPAL DE AÇÃO */}
              <button
                type="button"
                disabled={loading || !numeroPulseira.trim()}
                onClick={handleCapturarGPS}
                className={`w-full py-4 px-6 rounded-2xl font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                  loading || !numeroPulseira.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 active:scale-[0.98] alert-pulse'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Capturando GPS e Enviando...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-6 h-6 animate-bounce" />
                    <span>ENVIAR LOCALIZAÇÃO AGORA</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleUsarLocalizacaoAproximada}
                  className="text-xs text-slate-500 hover:text-ocean-700 underline font-medium"
                >
                  Dificuldades com GPS? Testar envio aproximado de demonstração
                </button>
              </div>

              {/* Mensagem Institucional de Parceiro (Item 7 do Edital) */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Apoio: Prefeitura Municipal de Guarapari & Corpo de Bombeiros Militar ES</span>
                </p>
              </div>
            </div>
          ) : (
            /* TELA DE SUCESSO E TRANQUILIZAÇÃO */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                  Alerta Transmitido em Tempo Real!
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  A equipe já está a caminho!
                </h2>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Pulseira Identificada:</span>
                  <span className="font-extrabold text-slate-900">#{numeroPulseira}</span>
                </div>
                {coordenadasEnviadas && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Coordenada GPS:</span>
                    <span className="font-mono text-slate-800">
                      {coordenadasEnviadas.lat.toFixed(4)}, {coordenadasEnviadas.lng.toFixed(4)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Operacional:</span>
                  <span className="text-amber-700 font-bold">Equipe Mobilizada</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left text-xs text-amber-900 space-y-1">
                <strong className="block font-bold">Orientações de Segurança:</strong>
                <p>1. Permaneça no local onde você enviou o chamado com a criança.</p>
                <p>2. Procure um ponto de referência visível (um quiosque ou guarda-sol colorido).</p>
                <p>3. Os voluntários Anjos da Praia estão uniformizados e chegarão em instantes.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/admin"
                  className="w-full bg-ocean-700 hover:bg-ocean-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow"
                >
                  Ver Ocorrência no Painel da Tenda (Demonstração)
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSucesso(false);
                    setNumeroPulseira('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 py-1"
                >
                  Registrar outra ocorrência
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

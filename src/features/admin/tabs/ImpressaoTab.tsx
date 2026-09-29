import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';

export const ImpressaoTab: React.FC = () => {
  const {
    tipoImpressao,
    setTipoImpressao,
    loteInicio,
    setLoteInicio,
    loteQuantidade,
    setLoteQuantidade
  } = useAdminStore();

  const isIndividual = tipoImpressao === 'individual' || tipoImpressao === 'pulseiras';
  const isGeral = tipoImpressao === 'geral' || tipoImpressao === 'cartazes';

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#FF6B35]" />
            <span>Emissão de Etiquetas & Cartazes para a Orla</span>
          </h2>
          <p className="text-xs text-[#6B7280]">
            Atende ao modelo de alta tiragem econômica (QR Geral) e identificação individual rápida
          </p>
        </div>

        {/* Seletor de Modelo de Impressão */}
        <div className="flex items-center gap-2 bg-[#F9FAFB] p-1.5 rounded-xl border border-[#E5E7EB]">
          <button
            onClick={() => setTipoImpressao('individual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isIndividual
                ? 'bg-[#FF6B35] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A1D1F]'
            }`}
          >
            Pulseiras com QR Individual
          </button>
          <button
            onClick={() => setTipoImpressao('geral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isGeral
                ? 'bg-[#0B6EFD] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A1D1F]'
            }`}
          >
            Cartazes de Quiosque (QR Geral)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isIndividual ? (
            <>
              <div className="flex items-center gap-1.5 text-xs">
                <label className="font-bold">Início #:</label>
                <input
                  type="number"
                  value={loteInicio}
                  onChange={(e) => setLoteInicio(parseInt(e.target.value) || 1001)}
                  className="w-16 sm:w-20 p-1.5 border border-[#E5E7EB] rounded-lg text-center font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <label className="font-bold">Qtd:</label>
                <select
                  value={loteQuantidade}
                  onChange={(e) => setLoteQuantidade(parseInt(e.target.value))}
                  className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white font-bold text-xs"
                >
                  <option value={6}>6 un</option>
                  <option value={12}>12 un</option>
                  <option value={24}>24 un</option>
                </select>
              </div>
            </>
          ) : (
            <div className="text-xs text-[#6B7280] font-semibold">
              Pronto para impressão em formato A4
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E8531F] text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden xs:inline">Imprimir Folha</span>
          </button>
        </div>
      </div>

      {/* MODO A: Grade de Pulseiras Individuais */}
      {isIndividual && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
          {Array.from({ length: loteQuantidade }).map((_, i) => {
            const num = String(loteInicio + i);
            const qrUrl = `${window.location.origin}/alerta?pulseira=${num}`;

            return (
              <div key={num} className="bg-white p-3 rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center space-y-2 flex flex-col items-center justify-center overflow-hidden">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#FF6B35]">
                  ANJOS DA PRAIA
                </div>
                <div className="p-2 bg-white rounded-xl shadow-inner border border-[#E5E7EB] flex items-center justify-center max-w-full">
                  <QRCodeSVG 
                    value={qrUrl} 
                    className="w-24 h-24 sm:w-28 sm:h-28 max-w-full" 
                    level="M" 
                  />
                </div>
                <div className="text-base font-black font-mono text-[#1A1D1F]">
                  #{num}
                </div>
                <div className="text-[9px] text-[#6B7280] leading-tight max-w-[180px]">
                  Aponte a câmera em caso de emergência
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODO B: Cartazes / Totens de Praia com QR Code Geral (Requisito 3 do Edital) */}
      {isGeral && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
          {/* Cartaz para Quiosque / Posto de Salva-Vidas */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#FF6B35] text-center space-y-4 shadow-sm flex flex-col items-center">
            <div className="inline-block bg-[#FFF5F1] text-[#FF6B35] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#FFD8C7]">
              POSTO DE APOIO & QUIOSQUES DA PRAIA
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1A1D1F]">
                CRIANÇA PERDIDA NA PRAIA?
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Aponte a câmera para o QR Code abaixo e acione os Anjos da Praia
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#FF6B35] shadow-sm">
              <QRCodeSVG 
                value={`${window.location.origin}/alerta`} 
                className="w-40 h-40" 
                level="Q" 
              />
            </div>
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 rounded-xl text-xs text-[#1D4ED8] max-w-sm">
              <strong>Como funciona:</strong> Ao escanear, o banhista digita o número gravado no braço da criança e envia a localização em 1 toque.
            </div>
            <div className="text-[10px] text-[#6B7280] font-semibold">
              Parceria CBMES • Prefeitura Municipal de Guarapari
            </div>
          </div>

          {/* Cartaz Informativo para Famílias */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#0B6EFD] text-center space-y-4 shadow-sm flex flex-col items-center">
            <div className="inline-block bg-[#EFF6FF] text-[#0B6EFD] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#BFDBFE]">
              ORIENTAÇÃO ÀS FAMÍLIAS
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1A1D1F]">
                PROTEJA SEU FILHO NA AREIA
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Cadastre a pulseira gratuita nos postos da Associação Anjos da Praia
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#0B6EFD] shadow-sm">
              <QRCodeSVG 
                value={`${window.location.origin}/alerta`} 
                className="w-40 h-40" 
                level="Q" 
              />
            </div>
            <div className="bg-[#FEF3C7] border border-[#FDE68A] p-2.5 rounded-xl text-xs text-[#92400E] max-w-sm">
              <strong>Dica de Segurança:</strong> Ao chegar à praia, mostre à criança o posto dos salva-vidas e os voluntários uniformizados.
            </div>
            <div className="text-[10px] text-[#6B7280] font-semibold">
              Associação Anjos da Praia • Guarapari - ES
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

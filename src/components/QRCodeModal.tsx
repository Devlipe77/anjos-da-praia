import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink, Smartphone, Printer, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroPulseira: string;
  nomeCrianca?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  numeroPulseira,
  nomeCrianca,
}) => {
  if (!isOpen) return null;

  const alertUrl = `${window.location.origin}/alerta?pulseira=${encodeURIComponent(numeroPulseira)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D1F]/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center relative border border-[#E5E7EB] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#1A1D1F] p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-[#FEF3C7] text-[#FF6B35] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-[#1A1D1F]">
          Pulseira #{numeroPulseira}
        </h3>
        {nomeCrianca && (
          <p className="text-sm font-semibold text-[#0B6EFD] mt-0.5">
            {nomeCrianca}
          </p>
        )}

        <p className="text-xs text-[#6B7280] mt-2">
          Aponte a câmera do celular para simular a leitura pelo banhista na praia:
        </p>

        <div className="bg-[#F9FAFB] p-5 rounded-2xl border border-[#E5E7EB] inline-block my-4 shadow-inner">
          <QRCodeSVG
            value={alertUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="bg-[#F9F1E7] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#1A1D1F] text-left flex items-start gap-2.5 mb-4">
          <Smartphone className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-0.5" />
          <span className="leading-snug">
            Ao escanear, a página web abre sem baixar aplicativo e transmite o GPS da criança em 1 toque.
          </span>
        </div>

        <div className="flex gap-2">
          <a
            href={alertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FF6B35] hover:bg-[#E8531F] text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir URL
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors border border-[#E5E7EB]"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

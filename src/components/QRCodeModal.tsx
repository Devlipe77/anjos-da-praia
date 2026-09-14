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

  // URL gerada para a pulseira física
  const alertUrl = `${window.location.origin}/alerta?pulseira=${encodeURIComponent(numeroPulseira)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-slate-900">
          Pulseira #{numeroPulseira}
        </h3>
        {nomeCrianca && (
          <p className="text-sm font-medium text-ocean-700 mt-0.5">
            {nomeCrianca}
          </p>
        )}

        <p className="text-xs text-slate-500 mt-2">
          Aponte a câmera do celular para simular a leitura pelo banhista na praia:
        </p>

        {/* QR Code Container */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 inline-block my-4 shadow-inner">
          <QRCodeSVG
            value={alertUrl}
            size={190}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 text-left flex items-start gap-2 mb-4">
          <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            Ao escanear, o banhista acessa a página sem instalar nenhum app e transmite o GPS da criança em 1 toque.
          </span>
        </div>

        <div className="flex gap-2">
          <a
            href={alertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-ocean-700 hover:bg-ocean-800 text-white text-xs font-semibold py-2.5 px-3 rounded-lg shadow transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir URL Direta
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

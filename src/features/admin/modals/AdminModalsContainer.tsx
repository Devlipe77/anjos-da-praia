import React from 'react';
import { useAdminStore } from '../../../store/useAdminStore';
import { QRCodeModal, QRScannerModal } from '../../../components/QRCodeModal';
import { 
  ModalNovaPulseira, 
  ModalEdicaoPulseira, 
  ModalExclusaoPulseira 
} from './PulseiraModals';
import { 
  ModalNovaTenda, 
  ModalEdicaoTenda, 
  ModalExclusaoTenda 
} from './TendaModals';
import { 
  ModalExclusaoOcorrencia, 
  ModalHistoricoOcorrencia 
} from './OcorrenciaModals';
import { 
  ModalEdicaoOperador, 
  ModalExclusaoOperador, 
  ModalNovoUsuario, 
  ModalNovoConvite 
} from './OperadorModals';

export const AdminModalsContainer: React.FC = () => {
  const {
    qrModalOpen,
    qrNumero,
    qrCrianca,
    fecharQrModal,
    scannerAdminAberto,
    setScannerAdminAberto,
    setTermoBuscaPulseira,
    setSecaoAtiva,
    mostrarToast
  } = useAdminStore();

  const handleScanSuccess = (texto: string) => {
    let num = texto;
    try {
      if (texto.includes('pulseira=')) {
        const url = new URL(texto);
        const p = url.searchParams.get('pulseira');
        if (p) num = p;
      }
    } catch {}
    const match = num.match(/\d+/);
    const finalNum = match ? match[0] : num.trim();
    setTermoBuscaPulseira(finalNum);
    setSecaoAtiva('pulseiras');
    mostrarToast('sucesso', `Pulseira #${finalNum} escaneada com sucesso!`);
  };

  return (
    <>
      {/* Pulseira Modals */}
      <ModalNovaPulseira />
      <ModalEdicaoPulseira />
      <ModalExclusaoPulseira />

      {/* Tenda Modals */}
      <ModalNovaTenda />
      <ModalEdicaoTenda />
      <ModalExclusaoTenda />

      {/* Ocorrencia Modals */}
      <ModalExclusaoOcorrencia />
      <ModalHistoricoOcorrencia />

      {/* Operador & Convite Modals */}
      <ModalEdicaoOperador />
      <ModalExclusaoOperador />
      <ModalNovoUsuario />
      <ModalNovoConvite />

      {/* Modal QR Code Individual */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={fecharQrModal}
        numeroPulseira={qrNumero}
        nomeCrianca={qrCrianca}
      />

      {/* Modal Scanner de Câmera */}
      <QRScannerModal
        isOpen={scannerAdminAberto}
        onClose={() => setScannerAdminAberto(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};

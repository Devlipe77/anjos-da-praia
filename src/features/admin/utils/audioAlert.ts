/**
 * Sintetizador sonoro procedural para alertas táteis de emergência e novas ocorrências
 * utilizando a Web Audio API (sem dependência de arquivos de áudio estáticos externos).
 */
export const tocarBipAlerta = (somAtivado = true): void => {
  if (!somAtivado) return;
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    const audioCtx = new AudioCtxClass();

    // Bip duplo procedural de atenção (frequências 880Hz e 1174Hz - padrão CBMES)
    const playTone = (freq: number, delay: number, dur: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + dur);
    };

    playTone(880, 0, 0.2);
    playTone(1174, 0.25, 0.3);
  } catch (e) {
    console.warn('Audio não suportado ou bloqueado pelo navegador:', e);
  }
};

/**
 * Emissor de notificações nativas da Web Notification API para navegadores móveis e desktop
 */
export const dispararNotificacaoPush = (titulo: string, corpo: string): void => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(titulo, {
        body: corpo,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Falha ao exibir notificação nativa:', e);
    }
  }
};

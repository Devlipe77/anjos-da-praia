import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Registrar Service Worker para PWA (Desktop e Mobile) com recarregamento suave de novas versões
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Nova versão disponível na orla.');
  },
  onOfflineReady() {
    console.log('[PWA] Sistema pronto para operação offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


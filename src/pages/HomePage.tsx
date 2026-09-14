import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LifeBuoy, 
  AlertTriangle, 
  Shield, 
  QrCode, 
  MapPin, 
  Smartphone, 
  HeartHandshake, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { QRCodeModal } from '../components/QRCodeModal';
import { isSupabaseConfigured } from '../lib/supabase';

export const HomePage: React.FC = () => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [pulseiraDemo, setPulseiraDemo] = useState('1001');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ocean-800 via-ocean-700 to-ocean-900 text-white">
        {/* Elemento de fundo decorativo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-ocean-950/60 border border-ocean-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-ocean-200 mb-6 backdrop-blur-sm">
            <LifeBuoy className="w-4 h-4 text-amber-400" />
            <span>Hackathon Ciência da Computação Anhanguera 2026.2 • Desafio 3</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-4">
            ANJOS DA PRAIA
          </h1>
          <p className="text-lg sm:text-xl text-ocean-100 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Tecnologia de geolocalização e QR Code para localização ágil e reencontro de crianças perdidas no litoral capixaba.
          </p>

          {/* Cards de Acesso Rápido aos dois Fluxos Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            
            {/* Fluxo 1: Banhista */}
            <Link
              to="/alerta?pulseira=1001"
              className="group p-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-slate-950 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border border-amber-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-6 h-6 text-slate-950" />
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900/80">
                  Visão do Banhista (Mobile)
                </div>
                <h2 className="text-xl font-black mt-0.5 mb-1">
                  Encontrei uma Criança
                </h2>
                <p className="text-xs text-slate-900/90 leading-snug">
                  Fluxo 100% web sem login. Lê o QR Code e envia a coordenada GPS em 1 clique.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-950/10 flex items-center justify-between text-xs font-bold">
                <span>Testar fluxo /alerta</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Fluxo 2: Painel da Tenda */}
            <Link
              to="/admin"
              className="group p-5 bg-white/10 backdrop-blur-md rounded-2xl text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border border-white/20 flex flex-col justify-between hover:bg-white/15"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-amber-300" />
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-ocean-200">
                  Visão da Equipe Operacional
                </div>
                <h2 className="text-xl font-black mt-0.5 mb-1">
                  Painel da Tenda
                </h2>
                <p className="text-xs text-ocean-100 leading-snug">
                  Cadastre pulseiras, acompanhe o mapa com tiles Esri e notifique os pais via WhatsApp.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-ocean-200">
                <span>Acessar painel /admin</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>

          {/* Botão de Demonstração Interativa via Celular */}
          <div className="mt-8">
            <button
              onClick={() => {
                setPulseiraDemo('1001');
                setQrModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-ocean-950/80 hover:bg-ocean-950 text-ocean-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-ocean-600 transition-colors shadow-lg"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Abrir QR Code de Teste (Para escanear com a câmera do celular)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Fluxo Oficial do Sistema Anjos da Praia
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
            Projetado para eliminar barreiras técnicas e garantir o reencontro familiar no menor tempo possível.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-ocean-100 text-ocean-700 font-black text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">
              Cadastro na Tenda
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A família recebe a pulseira numerada. Os dados do responsável (nome e telefone) ficam seguros e restritos à equipe.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-black text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">
              Escaneamento do QR Code
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quem encontra a criança aponta a câmera do celular. O link abre uma página web direta sem necessidade de instalar aplicativo.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">
              GPS & Realtime
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O banhista autoriza o GPS em 1 clique. O painel da tenda recebe o chamado instantaneamente via WebSockets.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">
              Reencontro com os Pais
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A equipe da tenda abre a rota no Google Maps, liga ou envia mensagem via WhatsApp para os pais e realiza o acolhimento.
            </p>
          </div>

        </div>

        {/* Banner de Conformidade LGPD & Arquitetura */}
        <div className="mt-10 bg-slate-100 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>LGPD e Minimização de Dados:</strong> O banhista anônimo nunca acessa ou informa dados pessoais dos pais. Apenas o número da pulseira e coordenadas geográficas pontuais são transmitidos.
            </span>
          </div>

          <div className="flex-shrink-0 font-semibold text-ocean-700">
            {isSupabaseConfigured ? '🟢 Supabase Ativo' : '🟡 Modo Demonstração'}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800">
        <p className="font-semibold text-slate-300">
          Anjos da Praia • Desenvolvido para o Hackathon Ciência da Computação 2026.2
        </p>
        <p className="mt-1 text-slate-500">
          Faculdade Anhanguera de Guarapari • Espírito Santo
        </p>
      </footer>

      {/* Modal de QR Code para teste interativo */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        numeroPulseira={pulseiraDemo}
        nomeCrianca="Lucas Souza (Exemplo de Demonstração)"
      />
    </div>
  );
};

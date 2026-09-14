import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LifeBuoy, Shield, AlertTriangle, Home, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-ocean-700 text-white font-medium' : 'text-ocean-100 hover:bg-ocean-600 hover:text-white';
  };

  return (
    <header className="bg-ocean-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-ocean-900 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-6 h-6 text-ocean-900" />
            </div>
            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white">
                ANJOS DA PRAIA
              </div>
              <div className="text-[11px] text-ocean-200 tracking-wider uppercase font-semibold">
                Guarapari • ES
              </div>
            </div>
          </Link>

          {/* Status do Backend Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Supabase Conectado</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-amber-950/70 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30" title="Para conectar ao banco real, preencha o arquivo .env.local">
                <Database className="w-3.5 h-3.5" />
                <span>Modo Demonstração Ativo</span>
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${isActive('/')}`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Início</span>
            </Link>

            <Link
              to="/alerta"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${isActive('/alerta')} bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm`}
            >
              <AlertTriangle className="w-4 h-4 text-slate-950" />
              <span>Achei Criança</span>
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${isActive('/admin')}`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Painel Tenda</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { StatusOcorrencia } from '../types';
import { AlertCircle, Navigation, ShieldCheck, HeartHandshake } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusOcorrencia;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  switch (status) {
    case 'Criança localizada':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses} ${className}`}>
          <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Criança localizada</span>
        </span>
      );
    case 'Equipe a caminho':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-300 ${sizeClasses} ${className}`}>
          <Navigation className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Equipe a caminho</span>
        </span>
      );
    case 'Criança recebida':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-300 ${sizeClasses} ${className}`}>
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Criança recebida na tenda</span>
        </span>
      );
    case 'Reencontro realizado':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses} ${className}`}>
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Reencontro realizado 🎉</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-800 ${sizeClasses} ${className}`}>
          {status}
        </span>
      );
  }
};

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
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  switch (status) {
    case 'Criança localizada':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] ${sizeClasses} ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
          <span>Criança localizada</span>
        </span>
      );
    case 'Equipe a caminho':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] ${sizeClasses} ${className}`}>
          <Navigation className="w-3.5 h-3.5 text-[#0B6EFD] animate-spin" style={{ animationDuration: '3s' }} />
          <span>Equipe a caminho</span>
        </span>
      );
    case 'Criança recebida':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] ${sizeClasses} ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-[#9333EA]" />
          <span>Criança na tenda</span>
        </span>
      );
    case 'Reencontro realizado':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] ${sizeClasses} ${className}`}>
          <HeartHandshake className="w-3.5 h-3.5 text-[#16A34A]" />
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

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  titleColorClass?: string;
  valueColorClass?: string;
  iconColorClass?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  titleColorClass = 'text-[#6B7280]',
  valueColorClass = 'text-[#1A1D1F]',
  iconColorClass = 'text-[#0B6EFD]',
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
      <div className={`flex items-center justify-between ${titleColorClass} text-xs font-bold uppercase mb-2`}>
        <span>{title}</span>
        <Icon className={`w-4 h-4 ${iconColorClass}`} />
      </div>
      <div className={`text-3xl font-black ${valueColorClass}`}>{value}</div>
      <p className="text-[11px] text-[#6B7280] mt-1">{subtitle}</p>
    </div>
  );
};

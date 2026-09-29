import React, { useEffect } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';

export const AdminToast: React.FC = () => {
  const { toast, fecharToast } = useAdminStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      fecharToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, fecharToast]);

  if (!toast) return null;

  const isErro = toast.tipo === 'erro';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-3 duration-200 shadow-2xl">
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
        isErro
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className={`p-1.5 rounded-xl ${
          isErro ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {isErro ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
        </div>
        <div className="flex-1 text-xs">
          <div className="font-black text-sm mb-0.5">
            {isErro ? 'Atenção Operacional' : 'Operação Concluída'}
          </div>
          <p className="leading-relaxed font-medium">{toast.mensagem}</p>
        </div>
        <button 
          onClick={fecharToast}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

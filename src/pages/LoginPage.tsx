import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LifeBuoy, 
  Lock, 
  Mail, 
  User as UserIcon, 
  MapPin, 
  AlertTriangle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { dataService, supabase } from '../lib/supabase';
import { Tenda, traduzirErroSupabase } from '../types';
import { validateEmail } from '@felipe7/valida-form';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'cadastro'>('login');
  
  // Campos
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [tendaId, setTendaId] = useState('');
  const [codigoAutorizacao, setCodigoAutorizacao] = useState('');
  const [roleOperador, setRoleOperador] = useState<'operador' | 'admin'>('operador');
  const [tendas, setTendas] = useState<Tenda[]>([]);

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Se já estiver logado, redireciona para o admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin', { replace: true });
      }
    });

    // Carregar lista de tendas para vincular o operador
    dataService.listarTendas().then((lista) => {
      setTendas(lista);
      if (lista.length > 0) {
        setTendaId(lista[0].id || '');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    // Validação de E-mail utilizando o pacote oficial @felipe7/valida-form
    const emailResult = validateEmail(email.trim());
    if (!emailResult.isValid) {
      setErro(emailResult.error || 'Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        await dataService.fazerLogin(email.trim(), senha);
        navigate('/admin', { replace: true });
      } else {
        if (!nome.trim()) {
          throw new Error('Por favor, informe seu nome completo.');
        }
        if (!codigoAutorizacao.trim()) {
          throw new Error('Por favor, informe o Código de Autorização Institucional fornecido pela coordenação.');
        }
        await dataService.cadastrarOperador({
          email: email.trim(),
          senha,
          nome,
          tendaId: tendaId || undefined,
          codigoAutorizacao: codigoAutorizacao.trim(),
          role: roleOperador,
        });

        setSucesso('Conta de operador autorizada e criada com sucesso! Entrando...');
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setErro(err?.message ? err.message : traduzirErroSupabase(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between">
      {/* Top Banner de Identidade */}
      <header className="bg-white border-b border-[#E5E7EB] py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-md p-1.5 overflow-hidden">
              <img 
                src="https://agpynfhvmyaiupynrznx.supabase.co/storage/v1/object/public/padrao/wings.png" 
                alt="Anjos da Praia Logo" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-contain filter brightness-0 invert" 
              />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-[#1A1D1F] leading-none">
                ANJOS DA PRAIA
              </div>
              <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mt-0.5">
                Guarapari • ES
              </div>
            </div>
          </div>

          <Link
            to="/alerta"
            className="inline-flex items-center gap-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] font-bold text-xs py-2 px-3 rounded-xl transition-colors border border-[#FDE68A]"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Encontrei uma Criança</span>
          </Link>
        </div>
      </header>

      {/* Card Central de Login / Cadastro */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          
          {/* Header do Card (Areia Clara #F9F1E7) */}
          <div className="bg-[#F9F1E7] p-4 sm:p-6 text-center border-b border-[#E5E7EB]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm border border-[#E5E7EB]">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B35]" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#1A1D1F] tracking-tight">
              Central Operacional da Tenda
            </h1>
            <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 sm:mt-1">
              Acesso exclusivo para voluntários e socorristas institucionais
            </p>

            {/* Alternador Entrar vs Novo Operador */}
            <div className="flex bg-white/80 p-1 rounded-xl border border-[#E5E7EB] mt-3.5 sm:mt-5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => { setTab('login'); setErro(null); }}
                className={`flex-1 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-[#FF6B35] text-white shadow'
                    : 'text-[#6B7280] hover:text-[#1A1D1F]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setTab('cadastro'); setErro(null); }}
                className={`flex-1 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tab === 'cadastro'
                    ? 'bg-[#FF6B35] text-white shadow'
                    : 'text-[#6B7280] hover:text-[#1A1D1F]'
                }`}
              >
                Novo Operador
              </button>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            
            {erro && (
              <div className="bg-[#FEE2E2] border border-[#FCA5A5] text-[#DC2626] text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            {sucesso && (
              <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] text-xs p-3 rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{sucesso}</span>
              </div>
            )}

            {tab === 'cadastro' && (
              <div>
                <label className="block text-xs font-bold text-[#1A1D1F] mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none text-[#1A1D1F]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1A1D1F] mb-1">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="operador@anjosdapraia.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none text-[#1A1D1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D1F] mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none text-[#1A1D1F]"
                />
              </div>
            </div>

            {tab === 'cadastro' && tendas.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#1A1D1F] mb-1">
                  Posto / Tenda de Atuação
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <select
                    value={tendaId}
                    onChange={(e) => setTendaId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none text-[#1A1D1F] bg-white"
                  >
                    {tendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.praia})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {tab === 'cadastro' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#1A1D1F] mb-1">
                    Função / Nível de Acesso
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleOperador('operador')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        roleOperador === 'operador'
                          ? 'border-[#FF6B35] bg-[#FFF5F1] text-[#FF6B35] shadow-sm'
                          : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                      }`}
                    >
                      Voluntário / Posto
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleOperador('admin')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        roleOperador === 'admin'
                          ? 'border-[#0B6EFD] bg-[#EFF6FF] text-[#0B6EFD] shadow-sm'
                          : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                      }`}
                    >
                      Coordenador Geral
                    </button>
                  </div>
                </div>

                <div className="bg-[#FEF3C7] border border-[#FDE68A] p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#B45309] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Código de Autorização Institucional</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCodigoAutorizacao('ANJOS2026')}
                      className="text-[10px] font-bold text-[#B45309] underline hover:text-[#92400E]"
                      title="Preencher com a chave padrão da Associação para teste"
                    >
                      Preencher código padrão
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Chave fornecida pela Associação (Ex: ANJOS2026)"
                    value={codigoAutorizacao}
                    onChange={(e) => setCodigoAutorizacao(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-lg border border-[#FCD34D] focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] outline-none text-[#92400E] bg-white"
                  />
                  <p className="text-[10px] text-[#92400E] leading-tight">
                    * Bloqueia cadastros públicos não autorizados para proteção de dados infantis (LGPD).
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#FF6B35] hover:bg-[#E8531F] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Conectando ao Supabase...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Entrar na Central' : 'Cadastrar Operador'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Rodapé de Segurança e LGPD */}
          <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] text-center text-[11px] text-[#6B7280]">
            🔒 Sistema protegido com criptografia e políticas RLS no PostgreSQL
          </div>
        </div>
      </main>

      {/* Rodapé Geral */}
      <footer className="py-4 text-center text-xs text-[#6B7280] border-t border-[#E5E7EB] bg-white">
        <p className="font-semibold text-[#1A1D1F]">
          Associação Anjos da Praia • Hackathon Ciência da Computação 2026.2
        </p>
        <p className="text-[11px] mt-0.5">
          Faculdade Anhanguera de Guarapari - ES
        </p>
      </footer>
    </div>
  );
};

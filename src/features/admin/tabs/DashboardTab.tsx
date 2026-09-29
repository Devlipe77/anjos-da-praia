import React, { useMemo } from 'react';
import { 
  Filter, 
  Users, 
  Bell, 
  CheckCircle, 
  Clock, 
  Flame, 
  Tent 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { StatusBadge } from '../../../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';

export const DashboardTab: React.FC = () => {
  const {
    filtroDashTendaId,
    setFiltroDashTendaId,
    filtroDashSituacao,
    setFiltroDashSituacao,
    filtroDashStatus,
    setFiltroDashStatus,
    operadorTendaId,
    tendas,
    setSecaoAtiva,
    setSelectedOcorrencia,
    ocorrencias,
    cadastros
  } = useAdminStore();

  const chamadosAtivos = useMemo(
    () => ocorrencias.filter(o => o.status !== 'Reencontro realizado'),
    [ocorrencias]
  );

  const ocorrenciasDashboard = useMemo(() => {
    return ocorrencias.filter(o => {
      if (filtroDashStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
      if (filtroDashStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;
      if (filtroDashSituacao !== 'todas' && o.status !== filtroDashSituacao) return false;
      if (filtroDashTendaId !== 'todas') {
        const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
        if (tendaIdOco !== filtroDashTendaId) return false;
      }
      return true;
    });
  }, [ocorrencias, filtroDashStatus, filtroDashSituacao, filtroDashTendaId]);

  const dashCadastrosCount = useMemo(() => {
    if (filtroDashTendaId === 'todas') return cadastros.length;
    return cadastros.filter(c => c.tenda_id === filtroDashTendaId).length;
  }, [cadastros, filtroDashTendaId]);

  const dashAtivosCount = useMemo(
    () => ocorrenciasDashboard.filter(o => o.status !== 'Reencontro realizado').length,
    [ocorrenciasDashboard]
  );

  const dashConcluidosCount = useMemo(
    () => ocorrenciasDashboard.filter(o => o.status === 'Reencontro realizado').length,
    [ocorrenciasDashboard]
  );

  const taxaSucesso = ocorrenciasDashboard.length > 0 
    ? Math.round((dashConcluidosCount / ocorrenciasDashboard.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Barra de Filtro Rápido do Dashboard */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#0B6EFD]">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-[#1A1D1F]">Filtro de Operação</span>
            <p className="text-[10px] text-[#6B7280]">Restrinja a visão geral a uma tenda ou status específico</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Tenda / Praia */}
          <div className="relative">
            <select
              value={filtroDashTendaId}
              onChange={(e) => setFiltroDashTendaId(e.target.value)}
              className="text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
            >
              <option value="todas">📍 Toda Guarapari (Geral)</option>
              {operadorTendaId && (
                <option value={operadorTendaId}>⭐ Meu Posto Atual</option>
              )}
              {tendas.map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.praia})</option>
              ))}
            </select>
          </div>

          {/* Seletor de Situação / Etapa */}
          <div className="relative">
            <select
              value={filtroDashSituacao}
              onChange={(e) => setFiltroDashSituacao(e.target.value)}
              className="text-xs font-bold py-1.5 px-3 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
              title="Filtrar por etapa ou situação da ocorrência"
            >
              <option value="todas">📋 Todas as Situações</option>
              <option value="Criança localizada">⚠️ Criança localizada</option>
              <option value="Equipe a caminho">🏃 Equipe a caminho</option>
              <option value="Criança recebida">🛡️ Criança na tenda</option>
              <option value="Responsáveis localizados">👤 Pais contatados</option>
              <option value="Reencontro realizado">🎉 Reencontro realizado</option>
            </select>
          </div>

          {/* Pílulas de Status */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setFiltroDashStatus('todos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filtroDashStatus === 'todos' ? 'bg-white text-[#1A1D1F] shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroDashStatus('ativos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filtroDashStatus === 'ativos' ? 'bg-[#FF6B35] text-white shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              🔥 Ativos ({chamadosAtivos.length})
            </button>
            <button
              onClick={() => setFiltroDashStatus('concluidos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filtroDashStatus === 'concluidos' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              ✅ Concluídos
            </button>
          </div>

          {(filtroDashTendaId !== 'todas' || filtroDashStatus !== 'todos' || filtroDashSituacao !== 'todas') && (
            <button
              onClick={() => {
                setFiltroDashTendaId('todas');
                setFiltroDashStatus('todos');
                setFiltroDashSituacao('todas');
              }}
              className="text-xs font-bold text-[#DC2626] hover:underline px-1"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* KPIs Principais Reativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Crianças Cadastradas"
          value={dashCadastrosCount}
          subtitle={filtroDashTendaId === 'todas' ? 'Total em todas as tendas' : 'Cadastradas neste posto'}
          icon={Users}
          titleColorClass="text-[#6B7280]"
          valueColorClass="text-[#1A1D1F]"
          iconColorClass="text-[#0B6EFD]"
        />

        <KpiCard
          title="Alertas em Aberto"
          value={dashAtivosCount}
          subtitle="Aguardando reencontro"
          icon={Bell}
          titleColorClass="text-[#B45309]"
          valueColorClass="text-[#FF6B35]"
          iconColorClass="text-[#FF6B35]"
        />

        <KpiCard
          title="Reencontros Feitos"
          value={dashConcluidosCount}
          subtitle={`Taxa: ${taxaSucesso}% de sucesso`}
          icon={CheckCircle}
          titleColorClass="text-[#15803D]"
          valueColorClass="text-[#16A34A]"
          iconColorClass="text-[#16A34A]"
        />

        <KpiCard
          title="Tempo Médio GPS"
          value="< 4 min"
          subtitle="Graças à rota geodésica imediata"
          icon={Clock}
          titleColorClass="text-[#0B6EFD]"
          valueColorClass="text-[#0B6EFD]"
          iconColorClass="text-[#0B6EFD]"
        />
      </div>

      {/* Bloco 2: Ocorrências Recentes e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tabela Resumida de Ocorrências com Filtro */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF6B35]" />
              <h2 className="text-sm font-extrabold text-[#1A1D1F]">
                Últimos Chamados em Tempo Real
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#6B7280]">
                {ocorrenciasDashboard.length} exibidos
              </span>
            </div>
            <button
              onClick={() => setSecaoAtiva('monitoramento')}
              className="text-xs font-bold text-[#0B6EFD] hover:underline"
            >
              Abrir Mapa Completo →
            </button>
          </div>

          {ocorrenciasDashboard.length === 0 ? (
            <div className="py-12 text-center text-[#6B7280]">
              <CheckCircle className="w-10 h-10 text-[#16A34A] mx-auto mb-2 opacity-80" />
              <div className="font-bold text-sm text-[#1A1D1F]">Nenhuma ocorrência encontrada</div>
              <p className="text-xs mt-1">Nenhum chamado corresponde ao filtro selecionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1A1D1F]">
                <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-2.5 px-3">Pulseira</th>
                    <th className="py-2.5 px-3">Criança / Responsável</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Tenda Próxima</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {ocorrenciasDashboard.slice(0, 6).map((oco) => (
                    <tr key={oco.id} className="hover:bg-[#F9FAFB]">
                      <td className="py-3 px-3 font-mono font-black text-[#FF6B35]">
                        #{oco.numero_pulseira}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold">{oco.cadastro?.nome_crianca || 'Não identificado'}</div>
                        <div className="text-[11px] text-[#6B7280]">{oco.cadastro?.nome_responsavel || '-'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={oco.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#6B7280]">
                        {oco.tendaMaisProxima ? `${oco.tendaMaisProxima.tenda.nome} (~${oco.tendaMaisProxima.distanciaMetros}m)` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedOcorrencia(oco);
                            setSecaoAtiva('monitoramento');
                          }}
                          className="text-xs font-bold text-[#0B6EFD] hover:underline"
                        >
                          Ver no Mapa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card Lateral: Postos na Orla e Horários */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#F9F1E7] p-5 rounded-2xl border border-[#E5E7EB]">
            <h3 className="font-black text-sm text-[#1A1D1F] flex items-center gap-2 mb-2">
              <Tent className="w-4 h-4 text-[#FF6B35]" />
              <span>Postos Ativos em Guarapari</span>
            </h3>
            <p className="text-xs text-[#6B7280] mb-3">
              {tendas.filter(t => t.ativa !== false).length} tendas em funcionamento na orla
            </p>
            <div className="space-y-2">
              {tendas.slice(0, 4).map((t) => (
                <div key={t.id} className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] text-xs flex items-center justify-between">
                  <span className="font-bold text-[#1A1D1F]">{t.nome}</span>
                  <span className="text-[10px] text-[#0B6EFD] font-mono">{t.praia}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] text-xs space-y-2">
            <span className="font-extrabold text-[#1A1D1F] block">Horário de Pico na Areia</span>
            <p className="text-[#6B7280] leading-relaxed">
              Maior concentração histórica de desencontros ocorre entre <strong>14:00 e 16:30</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

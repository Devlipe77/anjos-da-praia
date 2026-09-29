import React, { useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Phone, 
  MessageCircle, 
  Navigation, 
  History, 
  ShieldCheck, 
  Trash2 
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { StatusOcorrencia } from '../../../types';
import { MapView } from '../../../components/MapView';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatarWhatsapp, formatarDataHora } from '../utils/formatters';

export const MonitoramentoTab: React.FC = () => {
  const {
    filtroMonitorBusca,
    setFiltroMonitorBusca,
    filtroMonitorTendaId,
    setFiltroMonitorTendaId,
    filtroMonitorStatus,
    setFiltroMonitorStatus,
    filtroMonitorSituacao,
    setFiltroMonitorSituacao,
    operadorTendaId,
    tendas,
    selectedOcorrencia,
    setSelectedOcorrencia,
    mudarStatusOcorrencia,
    setModalHistoricoOcorrencia,
    setModalExclusaoOcorrencia,
    ocorrencias
  } = useAdminStore();

  const chamadosAtivos = useMemo(
    () => ocorrencias.filter(o => o.status !== 'Reencontro realizado'),
    [ocorrencias]
  );

  const ocorrenciasMonitoramento = useMemo(() => {
    return ocorrencias.filter(o => {
      // Filtro de Status
      if (filtroMonitorStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
      if (filtroMonitorStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

      // Filtro de Situação / Etapa
      if (filtroMonitorSituacao !== 'todas' && o.status !== filtroMonitorSituacao) return false;

      // Filtro de Tenda
      if (filtroMonitorTendaId !== 'todas') {
        const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
        if (tendaIdOco !== filtroMonitorTendaId) return false;
      }

      // Filtro de Busca Texto
      if (filtroMonitorBusca.trim()) {
        const q = filtroMonitorBusca.toLowerCase().trim();
        const pulseiraMatch = o.numero_pulseira.toLowerCase().includes(q);
        const criancaMatch = o.cadastro?.nome_crianca?.toLowerCase().includes(q);
        const respMatch = o.cadastro?.nome_responsavel?.toLowerCase().includes(q);
        const telMatch = o.cadastro?.telefone_contato?.includes(q);
        if (!pulseiraMatch && !criancaMatch && !respMatch && !telMatch) return false;
      }

      return true;
    });
  }, [ocorrencias, filtroMonitorStatus, filtroMonitorSituacao, filtroMonitorTendaId, filtroMonitorBusca]);

  const handleMudarStatus = (id: string, novoStatus: StatusOcorrencia, oco?: any) => {
    mudarStatusOcorrencia(id, novoStatus, oco);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-8.5rem)] animate-in fade-in duration-200">
      
      {/* Lista de Chamados à Esquerda */}
      <div className="lg:col-span-5 flex flex-col h-full space-y-3 overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-extrabold text-[#1A1D1F] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF6B35]" />
            <span>Fila Operacional ({chamadosAtivos.length} ativos)</span>
          </h2>
          <span className="text-[11px] font-bold text-[#6B7280]">
            {ocorrenciasMonitoramento.length} filtrados
          </span>
        </div>

        {/* Barra de Filtros Operacionais Compacta */}
        <div className="bg-white p-2.5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por pulseira, nome..."
                value={filtroMonitorBusca}
                onChange={(e) => setFiltroMonitorBusca(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#E5E7EB] outline-none focus:border-[#FF6B35] text-[#1A1D1F]"
              />
              {filtroMonitorBusca && (
                <button 
                  onClick={() => setFiltroMonitorBusca('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtro de Posto / Tenda */}
            <select
              value={filtroMonitorTendaId}
              onChange={(e) => setFiltroMonitorTendaId(e.target.value)}
              className="text-xs font-bold py-1.5 px-2 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35] text-[#1A1D1F] cursor-pointer max-w-[140px] truncate"
            >
              <option value="todas">📍 Todas</option>
              {operadorTendaId && (
                <option value={operadorTendaId}>⭐ Meu Posto</option>
              )}
              {tendas.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          {/* Linha 2: Pílulas de Status e Filtro de Situação */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFiltroMonitorStatus('ativos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  filtroMonitorStatus === 'ativos'
                    ? 'bg-[#FF6B35] text-white shadow-xs'
                    : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                }`}
              >
                🔥 Ativos
              </button>
              <button
                onClick={() => setFiltroMonitorStatus('concluidos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  filtroMonitorStatus === 'concluidos'
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                }`}
              >
                ✅ Concluídos
              </button>
              <button
                onClick={() => setFiltroMonitorStatus('todos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  filtroMonitorStatus === 'todos'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                }`}
              >
                Todos
              </button>

              {/* Filtro por Situação / Etapa */}
              <select
                value={filtroMonitorSituacao}
                onChange={(e) => setFiltroMonitorSituacao(e.target.value)}
                className="text-xs font-bold py-1.5 px-2 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#FF6B35] text-[#1A1D1F] cursor-pointer"
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

            {(filtroMonitorStatus !== 'ativos' || filtroMonitorSituacao !== 'todas' || filtroMonitorTendaId !== 'todas' || filtroMonitorBusca) && (
              <button
                onClick={() => {
                  setFiltroMonitorStatus('ativos');
                  setFiltroMonitorSituacao('todas');
                  setFiltroMonitorTendaId('todas');
                  setFiltroMonitorBusca('');
                }}
                className="text-xs font-bold text-[#DC2626] hover:underline px-1"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {ocorrenciasMonitoramento.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center text-xs text-[#6B7280]">
            Nenhum alerta corresponde aos filtros selecionados.
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1.5">
            {ocorrenciasMonitoramento.map((oco) => {
              const isSelected = selectedOcorrencia?.id === oco.id;
              const isFinalizado = oco.status === 'Reencontro realizado';

              return (
                <div
                  key={oco.id}
                  onClick={() => setSelectedOcorrencia(oco)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-[#FF6B35] shadow-md ring-2 ring-[#FF6B35]/20'
                      : isFinalizado
                        ? 'bg-slate-50 border-[#E5E7EB] opacity-70'
                        : 'bg-white border-[#E5E7EB] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-lg border border-[#FDE68A]">
                        #{oco.numero_pulseira}
                      </span>
                      {oco.cadastro?.nome_crianca && (
                        <span className="font-extrabold text-sm text-[#1A1D1F]">
                          {oco.cadastro.nome_crianca}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#6B7280] bg-slate-100 px-1.5 py-0.5 rounded-md border border-[#E5E7EB]">
                        {formatarDataHora(oco.horario_alerta)}
                      </span>
                      <StatusBadge status={oco.status} size="sm" />
                    </div>
                  </div>

                  {/* Dados da Família */}
                  {oco.cadastro ? (
                    <div className="bg-[#F9FAFB] rounded-xl p-2.5 text-xs text-[#1A1D1F] space-y-1 mb-2.5 border border-[#E5E7EB]">
                      <div>
                        <span className="text-[#6B7280]">Responsável:</span> <strong>{oco.cadastro.nome_responsavel}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7280]">Telefone:</span>
                        <span className="font-mono text-[#0B6EFD] font-bold">{oco.cadastro.telefone_contato}</span>
                      </div>
                      {oco.cadastro.observacoes && (
                        <div className="text-[11px] text-[#B45309] bg-[#FEF3C7] p-1.5 rounded border border-[#FDE68A]">
                          ⚠️ {oco.cadastro.observacoes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#B45309] bg-[#FEF3C7] p-2 rounded-lg mb-2">
                      Pulseira #{oco.numero_pulseira} ainda não cadastrada.
                    </div>
                  )}

                  {/* Tenda Mais Próxima */}
                  {oco.tendaMaisProxima && (
                    <div className="bg-[#EFF6FF] text-[#1D4ED8] text-[11px] p-2 rounded-xl mb-2.5 border border-[#BFDBFE]">
                      📍 <strong>Tenda Mais Próxima:</strong> {oco.tendaMaisProxima.tenda.nome} (~{oco.tendaMaisProxima.distanciaMetros} metros)
                    </div>
                  )}

                  {/* Ações Táticas */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                    {oco.cadastro?.telefone_contato && (
                      <>
                        <a
                          href={`tel:${oco.cadastro.telefone_contato}`}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] text-xs font-semibold py-1.5 px-2.5 rounded-lg"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Ligar</span>
                        </a>

                        <a
                          href={`https://wa.me/${formatarWhatsapp(oco.cadastro.telefone_contato)}?text=Ol%C3%A1!%20Aqui%20%C3%A9%20da%20equipe%20Anjos%20da%20Praia.%20Recebemos%20a%20localiza%C3%A7%C3%A3o%20da%20pulseira%20%23${oco.numero_pulseira}%20e%20j%C3%A1%20estamos%20no%20local!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#BBF7D0]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${oco.latitude},${oco.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-[#F9F1E7] hover:bg-[#E5E7EB] text-[#1A1D1F] text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#E5E7EB]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>Rota GPS</span>
                    </a>

                    {/* Botão de Linha do Tempo / Histórico de Auditoria */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalHistoricoOcorrencia(oco);
                      }}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-[#1A1D1F] text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#E5E7EB] transition-colors"
                      title="Ver histórico de alterações e operadores"
                    >
                      <History className="w-3.5 h-3.5 text-[#0B6EFD]" />
                      <span className="hidden xs:inline">Histórico</span>
                    </button>

                    {/* Status: Seletor Operacional ou Selo Bloqueado de Finalizado */}
                    {oco.id && (
                      isFinalizado ? (
                        <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] text-xs font-black ml-auto shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Reencontro Concluído</span>
                        </div>
                      ) : (
                        <select
                          value={oco.status}
                          onChange={(e) => handleMudarStatus(oco.id!, e.target.value as StatusOcorrencia, oco)}
                          className="text-xs font-bold py-1 px-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1A1D1F] ml-auto outline-none focus:border-[#FF6B35]"
                        >
                          <option value="Criança localizada">Criança localizada</option>
                          <option value="Equipe a caminho">Equipe a caminho</option>
                          <option value="Criança recebida">Criança na tenda</option>
                          <option value="Responsáveis localizados">Pais contatados</option>
                          <option value="Reencontro realizado">Reencontro realizado 🎉</option>
                        </select>
                      )
                    )}

                    {/* Cancelar Alarme Falso (bloqueado se já finalizado) */}
                    {!isFinalizado && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalExclusaoOcorrencia(oco);
                        }}
                        className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancelar alarme falso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mapa Leaflet à Direita (Altura total da tela) */}
      <div className="lg:col-span-7 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-sm h-full min-h-[550px] flex flex-col">
        <MapView
          ocorrencias={ocorrenciasMonitoramento}
          tendas={tendas}
          selectedOcorrencia={selectedOcorrencia}
          onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
        />
      </div>

    </div>
  );
};

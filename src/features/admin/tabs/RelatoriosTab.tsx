import React from 'react';
import { 
  FileSpreadsheet, 
  FileDown, 
  Filter, 
  Search, 
  MapPin 
} from 'lucide-react';
import { 
  useAdminStore, 
  selectOcorrenciasRelatorios 
} from '../../../store/useAdminStore';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatarDataHora } from '../utils/formatters';
import { exportarRelatorioCSV } from '../utils/exportCsv';

export const RelatoriosTab: React.FC = () => {
  const {
    ocorrencias,
    praiasCadastradas,
    filtroRelatorioPraia,
    setFiltroRelatorioPraia,
    filtroRelatorioStatus,
    setFiltroRelatorioStatus,
    filtroRelatorioSituacao,
    setFiltroRelatorioSituacao,
    filtroRelatorioPeriodo,
    setFiltroRelatorioPeriodo,
    filtroRelatorioBusca,
    setFiltroRelatorioBusca,
    mostrarToast
  } = useAdminStore();

  const ocorrenciasRelatorios = useAdminStore(selectOcorrenciasRelatorios);

  const handleExportarCsv = () => {
    exportarRelatorioCSV(ocorrenciasRelatorios, (msg, tipo) => {
      mostrarToast(tipo, msg);
    });
  };

  const limparFiltros = () => {
    setFiltroRelatorioPraia('todas');
    setFiltroRelatorioStatus('todos');
    setFiltroRelatorioSituacao('todas');
    setFiltroRelatorioPeriodo('tudo');
    setFiltroRelatorioBusca('');
  };

  const temFiltroAtivo = 
    filtroRelatorioPraia !== 'todas' || 
    filtroRelatorioStatus !== 'todos' || 
    filtroRelatorioSituacao !== 'todas' || 
    filtroRelatorioPeriodo !== 'tudo' || 
    filtroRelatorioBusca !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header do Relatório com Exportador Inteligente */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#1A1D1F] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#FF6B35]" />
            <span>Relatório Consolidado de Ocorrências & Praias</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Histórico auditado para prestação de contas com a Prefeitura de Guarapari e Corpo de Bombeiros Militar ES
          </p>
        </div>

        <button
          onClick={handleExportarCsv}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0B6EFD] hover:bg-[#0857CC] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          title="Baixar planilha CSV com os filtros atualmente aplicados"
        >
          <FileDown className="w-4 h-4" />
          <span>Baixar Planilha Filtrada (.CSV)</span>
        </button>
      </div>

      {/* Barra de Filtros de Relatórios */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0B6EFD]" />
            <span className="text-xs font-black text-[#1A1D1F]">Filtros do Relatório & Auditoria</span>
          </div>
          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="text-xs font-bold text-[#DC2626] hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca por Texto */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por pulseira, nome, tel..."
              value={filtroRelatorioBusca}
              onChange={(e) => setFiltroRelatorioBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E7EB] outline-none focus:border-[#0B6EFD] text-[#1A1D1F]"
            />
          </div>

          {/* Filtro por Praia */}
          <div>
            <select
              value={filtroRelatorioPraia}
              onChange={(e) => setFiltroRelatorioPraia(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
            >
              <option value="todas">📍 Todas as Praias de Guarapari</option>
              {praiasCadastradas.map(p => (
                <option key={p.nome} value={p.nome}>{p.nome}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={filtroRelatorioStatus}
              onChange={(e) => setFiltroRelatorioStatus(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
            >
              <option value="todos">⚡ Todos os Status</option>
              <option value="ativos">🔥 Apenas Chamados em Aberto</option>
              <option value="concluidos">✅ Apenas Reencontros Concluídos</option>
            </select>
          </div>

          {/* Filtro por Situação / Etapa */}
          <div>
            <select
              value={filtroRelatorioSituacao}
              onChange={(e) => setFiltroRelatorioSituacao(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
              title="Filtrar por situação da ocorrência"
            >
              <option value="todas">📋 Todas as Situações</option>
              <option value="Criança localizada">⚠️ Criança localizada</option>
              <option value="Equipe a caminho">🏃 Equipe a caminho</option>
              <option value="Criança recebida">🛡️ Criança na tenda</option>
              <option value="Responsáveis localizados">👤 Pais contatados</option>
              <option value="Reencontro realizado">🎉 Reencontro realizado</option>
            </select>
          </div>

          {/* Filtro por Período */}
          <div>
            <select
              value={filtroRelatorioPeriodo}
              onChange={(e) => setFiltroRelatorioPeriodo(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#0B6EFD] text-[#1A1D1F] cursor-pointer"
            >
              <option value="tudo">📅 Todo o Histórico</option>
              <option value="hoje">☀️ Hoje (Últimas 24h)</option>
              <option value="7dias">🗓️ Últimos 7 dias (Semana)</option>
              <option value="30dias">📆 Últimos 30 dias (Mês)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Indicadores Dinâmicos por Praia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { praia: 'Praia do Morro', cor: 'border-[#FF6B35]' },
          { praia: 'Praia das Castanheiras', cor: 'border-[#0B6EFD]' },
          { praia: 'Praia da Areia Preta', cor: 'border-[#10B981]' },
          { praia: 'Praia de Meaípe', cor: 'border-[#8B5CF6]' }
        ].map(({ praia, cor }) => {
          const ocosPraia = ocorrenciasRelatorios.filter(o => o.cadastro?.praia_origem === praia || o.tendaMaisProxima?.tenda?.praia === praia);
          const concluidas = ocosPraia.filter(o => o.status === 'Reencontro realizado').length;
          const taxa = ocosPraia.length > 0 ? Math.round((concluidas / ocosPraia.length) * 100) : 100;

          return (
            <div key={praia} className={`bg-white p-5 rounded-2xl border-t-4 ${cor} border border-[#E5E7EB] shadow-sm space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1A1D1F] truncate">{praia}</span>
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#1A1D1F]">{ocosPraia.length}</span>
                <span className="text-[11px] text-[#16A34A] font-bold">{taxa}% reencontrados</span>
              </div>
              <div className="text-[10px] text-[#6B7280] pt-1 border-t border-[#E5E7EB] flex justify-between">
                <span>{concluidas} finalizados</span>
                <span>{ocosPraia.length - concluidas} em aberto</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela de Registro Geral com Auditoria LGPD Filtrada */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-[#1A1D1F]">
              Auditoria de Ocorrências Registradas
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EFD]">
              {ocorrenciasRelatorios.length} de {ocorrencias.length}
            </span>
          </div>
          <span className="text-[11px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
            Dados protegidos conforme LGPD
          </span>
        </div>

        {ocorrenciasRelatorios.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#6B7280]">
            Nenhuma ocorrência encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A1D1F]">
              <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-2.5 px-3">Pulseira</th>
                  <th className="py-2.5 px-3">Criança</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Horário</th>
                  <th className="py-2.5 px-3">Tenda Próxima</th>
                  <th className="py-2.5 px-3 text-right">Telefone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {ocorrenciasRelatorios.map((oco) => (
                  <tr key={oco.id} className="hover:bg-[#F9FAFB]">
                    <td className="py-3 px-3 font-mono font-black text-[#FF6B35]">
                      #{oco.numero_pulseira}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {oco.cadastro?.nome_crianca || 'Não identificado'}
                    </td>
                    <td className="py-3 px-3 text-[#6B7280]">
                      {oco.cadastro?.nome_responsavel || 'Desconhecido'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={oco.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#6B7280] whitespace-nowrap">
                      {formatarDataHora(oco.horario_alerta)}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#6B7280]">
                      {oco.tendaMaisProxima?.tenda?.nome || 'Pendente'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px]">
                      {oco.cadastro?.telefone_contato || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

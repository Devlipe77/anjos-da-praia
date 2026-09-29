import { Ocorrencia } from '../../../types';

/**
 * Exportação de relatório geral de ocorrências em formato CSV com codificação UTF-8 BOM,
 * delimitador ponto e vírgula (;) compatível com Excel e LibreOffice.
 */
export const exportarRelatorioCSV = (
  listaParaExportar: Ocorrencia[],
  onFeedback?: (mensagem: string, tipo: 'sucesso' | 'erro') => void
): void => {
  try {
    const headers = [
      'ID Ocorrencia',
      'Numero Pulseira',
      'Crianca',
      'Responsavel',
      'Telefone',
      'Status',
      'Horario Alerta',
      'Latitude',
      'Longitude',
      'Tenda Mais Proxima',
      'Distancia (m)'
    ];

    const linhas = listaParaExportar.map(oco => [
      `"${oco.id || ''}"`,
      `"${oco.numero_pulseira || ''}"`,
      `"${oco.cadastro?.nome_crianca || 'Nao identificado'}"`,
      `"${oco.cadastro?.nome_responsavel || ''}"`,
      `"${oco.cadastro?.telefone_contato || ''}"`,
      `"${oco.status || ''}"`,
      `"${oco.horario_alerta ? new Date(oco.horario_alerta).toLocaleString('pt-BR') : ''}"`,
      `"${oco.latitude || ''}"`,
      `"${oco.longitude || ''}"`,
      `"${oco.tendaMaisProxima?.tenda?.nome || 'N/A'}"`,
      `"${oco.tendaMaisProxima?.distanciaMetros ?? ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...linhas.map(l => l.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_anjos_da_praia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onFeedback) {
      onFeedback('Relatório CSV exportado com sucesso!', 'sucesso');
    }
  } catch (e: any) {
    if (onFeedback) {
      onFeedback('Erro ao gerar relatório CSV: ' + (e?.message || 'Erro desconhecido'), 'erro');
    } else {
      console.error('Erro ao exportar relatório CSV:', e);
    }
  }
};

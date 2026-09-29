/**
 * Utilitários de formatação de strings e datas para o módulo administrativo.
 */

/**
 * Higieniza o número de telefone e garante o prefixo DDI 55 do Brasil para links wa.me
 */
export const formatarWhatsapp = (tel: string): string => {
  const limpo = tel.replace(/\D/g, '');
  return limpo.startsWith('55') ? limpo : `55${limpo}`;
};

/**
 * Formatação completa e precisa da data e hora em padrão brasileiro: dd/mm/aaaa hh:mm:ss
 */
export const formatarDataHora = (dataIso?: string | null): string => {
  if (!dataIso) return '-';
  try {
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return dataIso;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    const segundos = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
  } catch {
    return dataIso;
  }
};

import { Praia } from '../../../types';

/**
 * Matriz estática de contingência com 32 praias oficiais de Guarapari/ES
 * e coordenadas geográficas de referência para geodésia e mapeamento.
 */
export const PRAIAS_GUARAPARI_PADRAO: Praia[] = [
  { nome: 'Praia do Morro', regiao: 'Praia do Morro', latitude_padrao: -20.6552, longitude_padrao: -40.4880 },
  { nome: 'Praia das Castanheiras', regiao: 'Centro', latitude_padrao: -20.6720, longitude_padrao: -40.4975 },
  { nome: 'Praia da Areia Preta', regiao: 'Centro', latitude_padrao: -20.6765, longitude_padrao: -40.5005 },
  { nome: 'Praia dos Namorados', regiao: 'Centro', latitude_padrao: -20.6708, longitude_padrao: -40.4962 },
  { nome: 'Praia do Meio', regiao: 'Centro', latitude_padrao: -20.6740, longitude_padrao: -40.4990 },
  { nome: 'Praia das Virtudes', regiao: 'Centro', latitude_padrao: -20.6701, longitude_padrao: -40.4948 },
  { nome: 'Praia da Fonte', regiao: 'Centro', latitude_padrao: -20.6715, longitude_padrao: -40.4935 },
  { nome: 'Prainha de Muquiçaba', regiao: 'Muquiçaba', latitude_padrao: -20.6610, longitude_padrao: -40.5040 },
  { nome: 'Praia do Riacho', regiao: 'Ipiranga', latitude_padrao: -20.6900, longitude_padrao: -40.5120 },
  { nome: 'Praia de Bacutia', regiao: 'Enseada Azul', latitude_padrao: -20.7180, longitude_padrao: -40.5210 },
  { nome: 'Praia de Peracanga', regiao: 'Enseada Azul', latitude_padrao: -20.7130, longitude_padrao: -40.5190 },
  { nome: 'Praia de Guaibura', regiao: 'Enseada Azul', latitude_padrao: -20.7070, longitude_padrao: -40.5160 },
  { nome: 'Praia dos Padres', regiao: 'Enseada Azul', latitude_padrao: -20.7230, longitude_padrao: -40.5240 },
  { nome: 'Praia de Mucunã', regiao: 'Enseada Azul', latitude_padrao: -20.7095, longitude_padrao: -40.5175 },
  { nome: 'Praia de Meaípe', regiao: 'Meaípe', latitude_padrao: -20.7420, longitude_padrao: -40.5280 },
  { nome: 'Praia de Maimbá', regiao: 'Sul', latitude_padrao: -20.7550, longitude_padrao: -40.5350 },
  { nome: 'Praia de Porto Grande', regiao: 'Sul', latitude_padrao: -20.7620, longitude_padrao: -40.5420 },
  { nome: 'Praia de Ubu (Divisa)', regiao: 'Sul', latitude_padrao: -20.7890, longitude_padrao: -40.5750 },
  { nome: 'Praia da Cerca', regiao: 'Norte', latitude_padrao: -20.6480, longitude_padrao: -40.4820 },
  { nome: 'Praia de Santa Mônica', regiao: 'Santa Mônica', latitude_padrao: -20.6280, longitude_padrao: -40.4680 },
  { nome: 'Praia de Setiba', regiao: 'Setiba', latitude_padrao: -20.6120, longitude_padrao: -40.4500 },
  { nome: 'Praia de Setiba Pina', regiao: 'Setiba', latitude_padrao: -20.6080, longitude_padrao: -40.4460 },
  { nome: 'Praia de Setibão', regiao: 'Setiba', latitude_padrao: -20.6020, longitude_padrao: -40.4410 },
  { nome: 'Praia de Una', regiao: 'Norte', latitude_padrao: -20.5850, longitude_padrao: -40.4320 },
  { nome: 'Três Praias', regiao: 'Norte', latitude_padrao: -20.6380, longitude_padrao: -40.4720 },
  { nome: 'Praia dos Adventistas', regiao: 'Norte', latitude_padrao: -20.6330, longitude_padrao: -40.4690 },
  { nome: 'Praia do Morcego', regiao: 'Norte', latitude_padrao: -20.6410, longitude_padrao: -40.4750 },
  { nome: 'Praia de Mateus Lopes', regiao: 'Norte', latitude_padrao: -20.6360, longitude_padrao: -40.4710 },
  { nome: 'Praia do Ermitão', regiao: 'Morro da Pescaria', latitude_padrao: -20.6500, longitude_padrao: -40.4740 },
  { nome: 'Praia da Areia Vermelha', regiao: 'Morro da Pescaria', latitude_padrao: -20.6520, longitude_padrao: -40.4760 },
  { nome: 'Praia da Raposa', regiao: 'Morro da Pescaria', latitude_padrao: -20.6540, longitude_padrao: -40.4790 },
  { nome: 'Prainha dos Pescadores', regiao: 'Morro da Pescaria', latitude_padrao: -20.6560, longitude_padrao: -40.4810 }
];

export interface PresetGuarapari {
  nome: string;
  praia: string;
  lat: number;
  lng: number;
}

/**
 * Atalhos rápidos de localização para cadastro ágil de postos/tendas.
 */
export const PRESETS_GUARAPARI: PresetGuarapari[] = [
  { nome: 'Praia do Morro (Central)', praia: 'Praia do Morro', lat: -20.6552, lng: -40.4880 },
  { nome: 'Pedra do Siribeira', praia: 'Praia do Morro', lat: -20.6525, lng: -40.4850 },
  { nome: 'Castanheiras', praia: 'Praia das Castanheiras', lat: -20.6720, lng: -40.4975 },
  { nome: 'Areia Preta', praia: 'Praia da Areia Preta', lat: -20.6765, lng: -40.5005 },
  { nome: 'Meaípe', praia: 'Praia de Meaípe', lat: -20.7420, lng: -40.5280 },
  { nome: 'Bacutia', praia: 'Praia de Bacutia', lat: -20.7180, lng: -40.5210 },
  { nome: 'Setiba', praia: 'Praia de Setiba', lat: -20.6120, lng: -40.4500 }
];

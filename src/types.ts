export type StatusOcorrencia = 
  | 'Criança localizada' 
  | 'Equipe a caminho' 
  | 'Criança recebida' 
  | 'Reencontro realizado';

export interface PulseiraCadastro {
  id?: string;
  numero_pulseira: string;
  nome_responsavel: string;
  telefone_contato: string;
  nome_crianca?: string;
  praia_origem?: string;
  observacoes?: string;
  data_cadastro?: string;
  ativo?: boolean;
}

export interface Ocorrencia {
  id?: string;
  numero_pulseira: string;
  latitude: number;
  longitude: number;
  precisao_metros?: number;
  status: StatusOcorrencia;
  horario_alerta: string;
  finalizada_em?: string | null;
  atendido_por?: string | null;
  // Joins enriquecidos pelo sistema da tenda
  cadastro?: PulseiraCadastro;
}

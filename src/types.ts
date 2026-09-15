export type StatusOcorrencia = 
  | 'Criança localizada' 
  | 'Equipe a caminho' 
  | 'Criança recebida' 
  | 'Reencontro realizado';

export interface Tenda {
  id?: string;
  nome: string;
  praia: string;
  latitude: number;
  longitude: number;
  responsavel_posto?: string;
  telefone_posto?: string;
  ativa?: boolean;
  criado_em?: string;
}

export interface Operador {
  id: string;
  nome: string;
  email?: string;
  tenda_id?: string | null;
  role?: string;
  criado_em?: string;
}

export interface PulseiraCadastro {
  id?: string;
  numero_pulseira: string;
  nome_responsavel: string;
  telefone_contato: string;
  nome_crianca?: string;
  praia_origem?: string;
  observacoes?: string;
  tenda_id?: string | null;
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
  notas_atendimento?: string | null;
  tenda_atendimento_id?: string | null;
  // Campos calculados ou populados em runtime
  cadastro?: PulseiraCadastro;
  tendaMaisProxima?: {
    tenda: Tenda;
    distanciaMetros: number;
  };
}

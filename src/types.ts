export type StatusOcorrencia = 
  | 'Criança localizada' 
  | 'Equipe a caminho' 
  | 'Criança recebida' 
  | 'Responsáveis localizados'
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

/**
 * Utilitário para tradução e formatação amigável de erros do Supabase e PostgreSQL.
 * Transforma códigos técnicos como "duplicate key violates unique constraint"
 * e "Invalid login credentials" em mensagens claras e orientadas à ação para o usuário.
 */
export function traduzirErroSupabase(erro: any): string {
  if (!erro) return 'Ocorreu um erro inesperado. Tente novamente.';

  const mensagemOriginal = erro?.message || (typeof erro === 'string' ? erro : '');
  const detalhes = erro?.details || '';
  const hint = erro?.hint || '';
  const codigo = erro?.code || '';
  const status = erro?.status;

  const textoCompleto = `${mensagemOriginal} ${detalhes} ${hint}`.toLowerCase();

  // 1. Chaves Duplicadas (PostgreSQL 23505)
  if (codigo === '23505' || textoCompleto.includes('duplicate key') || textoCompleto.includes('unique constraint')) {
    if (textoCompleto.includes('cadastros_pulseiras_numero_pulseira_key') || textoCompleto.includes('numero_pulseira')) {
      return 'Já existe uma criança cadastrada com o número desta pulseira! Verifique o número digitado ou utilize outro.';
    }
    if (textoCompleto.includes('operadores_email_key') || textoCompleto.includes('email')) {
      return 'Este e-mail já está cadastrado no sistema para outro operador.';
    }
    if (textoCompleto.includes('tendas_nome_key') || textoCompleto.includes('nome')) {
      return 'Já existe um posto ou tenda cadastrada com este mesmo nome.';
    }
    return 'Já existe um registro com estes mesmos dados no sistema (registro duplicado).';
  }

  // 2. Erros de Autenticação Supabase Auth
  if (textoCompleto.includes('invalid login credentials') || textoCompleto.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Verifique os dados digitados e tente novamente.';
  }

  if (textoCompleto.includes('user already registered') || textoCompleto.includes('email already in use')) {
    return 'Este e-mail já possui uma conta cadastrada. Faça login ou utilize outro e-mail.';
  }

  if (textoCompleto.includes('password should be at least') || textoCompleto.includes('password is too short')) {
    return 'A senha informada é muito curta. Crie uma senha com pelo menos 6 caracteres.';
  }

  if (textoCompleto.includes('signup requires a valid password')) {
    return 'Por favor, informe uma senha válida para o cadastro.';
  }

  if (textoCompleto.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou spam.';
  }

  if (textoCompleto.includes('rate limit') || textoCompleto.includes('over_email_send_rate_limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
  }

  // 3. Foreign Key / Integridade Relacional (PostgreSQL 23503)
  if (codigo === '23503' || textoCompleto.includes('violates foreign key')) {
    return 'Não foi possível concluir a ação pois este item está vinculado a outros registros no sistema.';
  }

  // 4. Campos Nulos Obrigatórios (PostgreSQL 23502)
  if (codigo === '23502' || textoCompleto.includes('not-null constraint')) {
    return 'Um ou mais campos obrigatórios não foram preenchidos.';
  }

  // 5. Erros de Rede / Conexão
  if (textoCompleto.includes('failed to fetch') || textoCompleto.includes('network request failed')) {
    return 'Falha de conexão com os servidores. Verifique sua conexão com a internet e tente novamente.';
  }

  // 6. Sessão / Permissões (JWT expirado ou RLS)
  if (status === 401 || status === 403 || textoCompleto.includes('jwt') || textoCompleto.includes('permission denied')) {
    return 'Sua sessão expirou ou você não tem permissão para realizar esta ação. Faça login novamente.';
  }

  return mensagemOriginal || 'Não foi possível completar a operação no momento.';
}

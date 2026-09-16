import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PulseiraCadastro, Ocorrencia, StatusOcorrencia, Tenda, Operador, ItemHistoricoStatus } from '../types';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// ==========================================================
// CÁLCULO GEODÉSICO DE DISTÂNCIA (Fórmula de Haversine)
// ==========================================================
function calcularDistanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// ==========================================================
// SERVIÇO DE DADOS SUPABASE (CRUD DIRETO E 100% REAL)
// ==========================================================

export const dataService = {
  // --------------------------------------------------------
  // 1. TENDAS E POSTOS
  // --------------------------------------------------------
  async listarTendas(): Promise<Tenda[]> {
    const { data, error } = await supabase
      .from('tendas')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.warn('Tabela tendas pode ainda estar sendo criada no Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  async criarTenda(tenda: Omit<Tenda, 'id' | 'criado_em'>): Promise<Tenda> {
    const { data, error } = await supabase
      .from('tendas')
      .insert([{
        nome: tenda.nome.trim(),
        praia: tenda.praia.trim(),
        latitude: tenda.latitude,
        longitude: tenda.longitude,
        responsavel_posto: tenda.responsavel_posto?.trim() || null,
        telefone_posto: tenda.telefone_posto?.trim() || null,
        ativa: tenda.ativa ?? true,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizarTenda(id: string, dados: Partial<Tenda>): Promise<Tenda> {
    const { data, error } = await supabase
      .from('tendas')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluirTenda(id: string): Promise<void> {
    const { error } = await supabase
      .from('tendas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  calcularTendaMaisProxima(
    lat: number, 
    lng: number, 
    tendas: Tenda[]
  ): { tenda: Tenda; distanciaMetros: number } | null {
    const ativas = tendas.filter(t => t.ativa !== false);
    if (ativas.length === 0) return null;

    let maisProxima = ativas[0];
    let menorDistancia = calcularDistanciaMetros(lat, lng, ativas[0].latitude, ativas[0].longitude);

    for (let i = 1; i < ativas.length; i++) {
      const d = calcularDistanciaMetros(lat, lng, ativas[i].latitude, ativas[i].longitude);
      if (d < menorDistancia) {
        menorDistancia = d;
        maisProxima = ativas[i];
      }
    }

    return { tenda: maisProxima, distanciaMetros: menorDistancia };
  },

  // --------------------------------------------------------
  // 2. CADASTROS DE PULSEIRAS (CRUD)
  // --------------------------------------------------------
  async listarCadastros(): Promise<PulseiraCadastro[]> {
    const { data, error } = await supabase
      .from('cadastros_pulseiras')
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async buscarCadastroPorPulseira(numero: string): Promise<PulseiraCadastro | null> {
    const { data, error } = await supabase
      .from('cadastros_pulseiras')
      .select('*')
      .eq('numero_pulseira', numero.trim())
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar pulseira:', error);
      return null;
    }
    return data;
  },

  async cadastrarPulseira(cadastro: Omit<PulseiraCadastro, 'id' | 'data_cadastro' | 'ativo'>): Promise<PulseiraCadastro> {
    const { data, error } = await supabase
      .from('cadastros_pulseiras')
      .insert([{
        numero_pulseira: cadastro.numero_pulseira.trim(),
        nome_responsavel: cadastro.nome_responsavel.trim(),
        telefone_contato: cadastro.telefone_contato.trim(),
        nome_crianca: cadastro.nome_crianca?.trim() || null,
        praia_origem: cadastro.praia_origem || 'Praia do Morro',
        observacoes: cadastro.observacoes || null,
        tenda_id: cadastro.tenda_id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizarPulseira(id: string, dados: Partial<PulseiraCadastro>): Promise<PulseiraCadastro> {
    const { data, error } = await supabase
      .from('cadastros_pulseiras')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluirPulseira(id: string): Promise<void> {
    const { error } = await supabase
      .from('cadastros_pulseiras')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --------------------------------------------------------
  // 3. OCORRÊNCIAS (BANHISTA + ATENDIMENTO + CRUD)
  // --------------------------------------------------------
  async dispararAlerta(dados: {
    numero_pulseira: string;
    latitude: number;
    longitude: number;
    precisao_metros?: number;
  }): Promise<Ocorrencia> {
    const numero = dados.numero_pulseira.trim();

    const agora = new Date().toISOString();

    const { data, error } = await supabase
      .from('ocorrencias')
      .insert([{
        numero_pulseira: numero,
        latitude: dados.latitude,
        longitude: dados.longitude,
        precisao_metros: dados.precisao_metros || 0,
        status: 'Criança localizada',
        horario_alerta: agora,
        historico_status: [
          {
            status: 'Criança localizada',
            data: agora,
            operador: 'Sistema (QR Code / Banhista)',
          }
        ],
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listarOcorrencias(): Promise<Ocorrencia[]> {
    const { data: ocorrencias, error: errOco } = await supabase
      .from('ocorrencias')
      .select('*')
      .order('horario_alerta', { ascending: false });

    if (errOco) throw errOco;

    // Buscar cadastros e tendas para enriquecer a ocorrência
    const [resCad, resTen] = await Promise.all([
      supabase.from('cadastros_pulseiras').select('*'),
      supabase.from('tendas').select('*'),
    ]);

    const cadMap = new Map((resCad.data || []).map(c => [c.numero_pulseira, c]));
    const tendasList: Tenda[] = resTen.data || [];

    return (ocorrencias || []).map((oco) => {
      const maisProxima = tendasList.length > 0 
        ? dataService.calcularTendaMaisProxima(oco.latitude, oco.longitude, tendasList)
        : null;

      return {
        ...oco,
        cadastro: cadMap.get(oco.numero_pulseira),
        tendaMaisProxima: maisProxima || undefined,
      };
    });
  },

  async atualizarStatusOcorrencia(
    id: string,
    novoStatus: StatusOcorrencia,
    atendidoPor?: string,
    notasAtendimento?: string,
    tendaAtendimentoId?: string,
    historicoAtual?: ItemHistoricoStatus[] | null
  ): Promise<void> {
    const agora = new Date().toISOString();
    const finalizada = novoStatus === 'Reencontro realizado' ? agora : null;

    // Construir novo histórico incremental
    const novoItem: ItemHistoricoStatus = {
      status: novoStatus,
      data: agora,
      operador: atendidoPor || 'Operador Central',
    };

    const historicoAtualizado: ItemHistoricoStatus[] = Array.isArray(historicoAtual) 
      ? [...historicoAtual, novoItem] 
      : [novoItem];

    const updatePayload: Record<string, any> = {
      status: novoStatus,
      finalizada_em: finalizada,
      historico_status: historicoAtualizado,
    };

    if (atendidoPor !== undefined) updatePayload.atendido_por = atendidoPor;
    if (notasAtendimento !== undefined) updatePayload.notas_atendimento = notasAtendimento;
    if (tendaAtendimentoId !== undefined) updatePayload.tenda_atendimento_id = tendaAtendimentoId;

    const { error } = await supabase
      .from('ocorrencias')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;
  },

  async excluirOcorrencia(id: string): Promise<void> {
    const { error } = await supabase
      .from('ocorrencias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --------------------------------------------------------
  // 4. REALTIME (ESCUTA EM TEMPO REAL)
  // --------------------------------------------------------
  subscribeOcorrencias(callback: () => void): () => void {
    const channel = supabase
      .channel('ocorrencias-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ocorrencias' },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // --------------------------------------------------------
  // 5. AUTENTICAÇÃO DE OPERADORES (SUPABASE AUTH)
  // --------------------------------------------------------
  async cadastrarOperador(params: {
    email: string;
    senha: string;
    nome: string;
    tendaId?: string;
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.senha,
      options: {
        data: {
          nome: params.nome.trim(),
          tenda_id: params.tendaId || null,
        }
      }
    });

    if (authError) throw authError;

    // Registrar perfil na tabela operadores se o usuário foi criado
    if (authData.user) {
      try {
        await supabase.from('operadores').upsert([{
          id: authData.user.id,
          nome: params.nome.trim(),
          email: params.email.trim(),
          tenda_id: params.tendaId || null,
        }]);
      } catch (e) {
        console.warn('Perfil de operador salvo nos metadados do Auth.');
      }
    }

    return authData;
  },

  async fazerLogin(email: string, senha: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    if (error) throw error;
    return data;
  },

  async fazerLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async obterUsuarioAtual(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
};

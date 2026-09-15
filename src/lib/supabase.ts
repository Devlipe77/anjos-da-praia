import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PulseiraCadastro, Ocorrencia, StatusOcorrencia } from '../types';

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
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================================
// ARMAZENAMENTO LOCAL (MODO DEMO / FALLBACK)
// Garante funcionamento em 100% dos testes mesmo sem chaves
// ==========================================================

const LOCAL_STORAGE_CADASTROS = 'anjos_praia_cadastros_v1';
const LOCAL_STORAGE_OCORRENCIAS = 'anjos_praia_ocorrencias_v1';

const MOCK_CADASTROS_INICIAIS: PulseiraCadastro[] = [
  {
    id: 'cad-1001',
    numero_pulseira: '1001',
    nome_responsavel: 'Mariana Souza (Mãe)',
    telefone_contato: '27998765432',
    nome_crianca: 'Lucas Souza (5 anos)',
    praia_origem: 'Praia do Morro - Guarapari',
    observacoes: 'Bermuda azul, camiseta amarela de proteção UV',
    data_cadastro: new Date(Date.now() - 3600000 * 3).toISOString(),
    ativo: true,
  },
  {
    id: 'cad-1002',
    numero_pulseira: '1002',
    nome_responsavel: 'Carlos Eduardo Lima (Pai)',
    telefone_contato: '27981123344',
    nome_crianca: 'Sofia Lima (4 anos)',
    praia_origem: 'Praia das Castanheiras - Guarapari',
    observacoes: 'Maiô rosa com laço',
    data_cadastro: new Date(Date.now() - 3600000 * 2).toISOString(),
    ativo: true,
  },
  {
    id: 'cad-1003',
    numero_pulseira: '1003',
    nome_responsavel: 'Renata Vasconcelos (Tia)',
    telefone_contato: '27999887766',
    nome_crianca: 'Bernardo Vasconcelos (6 anos)',
    praia_origem: 'Praia de Meaípe - Guarapari',
    observacoes: 'Chapéu de palha infantil',
    data_cadastro: new Date(Date.now() - 3600000).toISOString(),
    ativo: true,
  }
];

const MOCK_OCORRENCIAS_INICIAIS: Ocorrencia[] = [
  {
    id: 'oco-1',
    numero_pulseira: '1001',
    latitude: -20.6548,
    longitude: -40.4875,
    precisao_metros: 8.5,
    status: 'Criança localizada',
    horario_alerta: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 min atrás
    finalizada_em: null,
    atendido_por: null,
  }
];

function getStoredCadastros(): PulseiraCadastro[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CADASTROS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_CADASTROS, JSON.stringify(MOCK_CADASTROS_INICIAIS));
      return MOCK_CADASTROS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_CADASTROS_INICIAIS;
  }
}

function getStoredOcorrencias(): Ocorrencia[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_OCORRENCIAS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_OCORRENCIAS, JSON.stringify(MOCK_OCORRENCIAS_INICIAIS));
      return MOCK_OCORRENCIAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_OCORRENCIAS_INICIAIS;
  }
}

// Emissor de eventos no navegador para sincronizar abas em modo demo
const DEMO_EVENT_NAME = 'anjos_praia_sync_event';
function triggerLocalSync() {
  window.dispatchEvent(new CustomEvent(DEMO_EVENT_NAME));
}

// ==========================================================
// SERVIÇO UNIFICADO DE DADOS (SUPABASE OU LOCAL)
// ==========================================================

export const dataService = {
  // 1. Cadastrar pulseira na tenda
  async cadastrarPulseira(cadastro: Omit<PulseiraCadastro, 'id' | 'data_cadastro' | 'ativo'>): Promise<PulseiraCadastro> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cadastros_pulseiras')
        .insert([{
          numero_pulseira: cadastro.numero_pulseira.trim(),
          nome_responsavel: cadastro.nome_responsavel.trim(),
          telefone_contato: cadastro.telefone_contato.trim(),
          nome_crianca: cadastro.nome_crianca?.trim() || null,
          praia_origem: cadastro.praia_origem || 'Praia do Morro - Guarapari',
          observacoes: cadastro.observacoes || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const list = getStoredCadastros();
      const existing = list.find(c => c.numero_pulseira === cadastro.numero_pulseira);
      if (existing) {
        throw new Error(`A pulseira #${cadastro.numero_pulseira} já está cadastrada.`);
      }
      const novo: PulseiraCadastro = {
        id: 'cad-' + Date.now(),
        ...cadastro,
        data_cadastro: new Date().toISOString(),
        ativo: true,
      };
      list.unshift(novo);
      localStorage.setItem(LOCAL_STORAGE_CADASTROS, JSON.stringify(list));
      triggerLocalSync();
      return novo;
    }
  },

  // 2. Buscar cadastro por número de pulseira
  async buscarCadastroPorPulseira(numero: string): Promise<PulseiraCadastro | null> {
    const num = numero.trim();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cadastros_pulseiras')
        .select('*')
        .eq('numero_pulseira', num)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar pulseira:', error);
        return null;
      }
      return data;
    } else {
      const list = getStoredCadastros();
      return list.find(c => c.numero_pulseira === num) || null;
    }
  },

  // 3. Listar todos os cadastros
  async listarCadastros(): Promise<PulseiraCadastro[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cadastros_pulseiras')
        .select('*')
        .order('data_cadastro', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return getStoredCadastros();
    }
  },

  // 4. Banhista: Disparar alerta via QR Code / GPS
  async dispararAlerta(dados: {
    numero_pulseira: string;
    latitude: number;
    longitude: number;
    precisao_metros?: number;
  }): Promise<Ocorrencia> {
    const numero = dados.numero_pulseira.trim();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ocorrencias')
        .insert([{
          numero_pulseira: numero,
          latitude: dados.latitude,
          longitude: dados.longitude,
          precisao_metros: dados.precisao_metros || 0,
          status: 'Criança localizada',
          horario_alerta: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const ocorrencias = getStoredOcorrencias();
      const nova: Ocorrencia = {
        id: 'oco-' + Date.now(),
        numero_pulseira: numero,
        latitude: dados.latitude,
        longitude: dados.longitude,
        precisao_metros: dados.precisao_metros || 10,
        status: 'Criança localizada',
        horario_alerta: new Date().toISOString(),
        finalizada_em: null,
      };
      ocorrencias.unshift(nova);
      localStorage.setItem(LOCAL_STORAGE_OCORRENCIAS, JSON.stringify(ocorrencias));
      triggerLocalSync();
      return nova;
    }
  },

  // 5. Listar ocorrências para o painel da tenda
  async listarOcorrencias(): Promise<Ocorrencia[]> {
    if (isSupabaseConfigured && supabase) {
      const { data: ocorrencias, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('horario_alerta', { ascending: false });

      if (error) throw error;

      // Enriquecer com dados do cadastro
      const { data: cadastros } = await supabase
        .from('cadastros_pulseiras')
        .select('*');

      const cadMap = new Map((cadastros || []).map(c => [c.numero_pulseira, c]));

      return (ocorrencias || []).map(oco => ({
        ...oco,
        cadastro: cadMap.get(oco.numero_pulseira),
      }));
    } else {
      const ocorrencias = getStoredOcorrencias();
      const cadastros = getStoredCadastros();
      const cadMap = new Map(cadastros.map(c => [c.numero_pulseira, c]));

      return ocorrencias.map(oco => ({
        ...oco,
        cadastro: cadMap.get(oco.numero_pulseira),
      }));
    }
  },

  // 6. Atualizar status da ocorrência
  async atualizarStatusOcorrencia(
    id: string, 
    novoStatus: StatusOcorrencia,
    atendidoPor?: string
  ): Promise<void> {
    const finalizada = novoStatus === 'Reencontro realizado' ? new Date().toISOString() : null;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('ocorrencias')
        .update({
          status: novoStatus,
          finalizada_em: finalizada,
          atendido_por: atendidoPor || null,
        })
        .eq('id', id);

      if (error) throw error;
    } else {
      const list = getStoredOcorrencias();
      const item = list.find(o => o.id === id);
      if (item) {
        item.status = novoStatus;
        if (finalizada) item.finalizada_em = finalizada;
        if (atendidoPor) item.atendido_por = atendidoPor;
        localStorage.setItem(LOCAL_STORAGE_OCORRENCIAS, JSON.stringify(list));
        triggerLocalSync();
      }
    }
  },

  // 7. Inscrição Realtime (Supabase Channel ou Evento Local)
  subscribeOcorrencias(callback: () => void): () => void {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('ocorrencias-realtime')
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
    } else {
      const handleSync = () => callback();
      window.addEventListener(DEMO_EVENT_NAME, handleSync);
      window.addEventListener('storage', handleSync);
      return () => {
        window.removeEventListener(DEMO_EVENT_NAME, handleSync);
        window.removeEventListener('storage', handleSync);
      };
    }
  }
};

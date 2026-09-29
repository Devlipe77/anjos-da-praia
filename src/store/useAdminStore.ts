import { create } from 'zustand';
import { 
  Ocorrencia, 
  PulseiraCadastro, 
  Tenda, 
  Operador, 
  ConviteOperador, 
  Praia, 
  StatusOcorrencia,
  traduzirErroSupabase 
} from '../types';
import { dataService, supabase } from '../lib/supabase';
import { PRAIAS_GUARAPARI_PADRAO } from '../features/admin/constants/adminConstants';
import { tocarBipAlerta } from '../features/admin/utils/audioAlert';
import confetti from 'canvas-confetti';

export type SecaoAdmin = 
  | 'dashboard' 
  | 'monitoramento' 
  | 'pulseiras' 
  | 'tendas' 
  | 'impressao' 
  | 'relatorios' 
  | 'usuarios';

export interface AdminToast {
  tipo: 'sucesso' | 'erro' | 'info';
  mensagem: string;
}

export interface AdminState {
  // Navigation & UI Shell
  secaoAtiva: SecaoAdmin;
  sidebarAberta: boolean;
  toast: AdminToast | null;
  somAtivado: boolean;
  scannerAdminAberto: boolean;
  pwaInstalavel: boolean;
  appJaInstalado: boolean;
  deferredPrompt: any;

  // Collections & Loading
  ocorrencias: Ocorrencia[];
  cadastros: PulseiraCadastro[];
  tendas: Tenda[];
  operadoresLista: Operador[];
  convitesLista: ConviteOperador[];
  praiasCadastradas: Praia[];
  loading: boolean;
  selectedOcorrencia: Ocorrencia | null;

  // Authenticated Operator Session
  operadorUserId: string | null;
  operadorEmail: string | null;
  operadorNome: string;
  operadorRole: string;
  operadorStatus: string;
  operadorTendaId: string | null;
  tendaOperador: string;
  tendaOperadorObj?: Tenda | null;

  // Tab Filters
  termoBuscaPulseira: string;
  filtroMonitorStatus: string;
  filtroMonitorSituacao: string;
  filtroMonitorTendaId: string;
  filtroMonitorBusca: string;
  filtroDashTendaId: string;
  filtroDashStatus: string;
  filtroDashSituacao: string;
  filtroRelatorioPraia: string;
  filtroRelatorioStatus: string;
  filtroRelatorioSituacao: string;
  filtroRelatorioPeriodo: string;
  filtroRelatorioBusca: string;

  // Batch Print
  loteInicio: number;
  loteQuantidade: number;
  tipoImpressao: 'individual' | 'geral' | 'pulseiras' | 'cartazes';

  // Modals Visibility & Selected Entity Targets
  modalNovaPulseira: boolean;
  modalEdicaoPulseira: PulseiraCadastro | null;
  modalExclusaoPulseira: PulseiraCadastro | null;
  modalNovaTenda: boolean;
  modalEdicaoTenda: Tenda | null;
  modalExclusaoTenda: Tenda | null;
  modalExclusaoOcorrencia: Ocorrencia | null;
  modalHistoricoOcorrencia: Ocorrencia | null;
  modalNovoUsuario: boolean;
  modalEdicaoOperador: Operador | null;
  modalExclusaoOperador: Operador | null;
  modalNovoConvite: boolean;
  conviteGeradoRecente: ConviteOperador | null;
  qrModalOpen: boolean;
  qrNumero: string;
  qrCrianca: string;

  // Actions - Navigation & UI
  setSecaoAtiva: (secao: SecaoAdmin) => void;
  setSidebarAberta: (aberta: boolean) => void;
  mostrarToast: (tipo: 'sucesso' | 'erro' | 'info', mensagem: string) => void;
  fecharToast: () => void;
  showToast: (mensagemOuTipo: string, tipoOuMensagem?: 'sucesso' | 'erro' | 'info' | string) => void;
  hideToast: () => void;
  setSomAtivado: (ativado: boolean) => void;
  toggleSomAtivado: () => void;
  toggleSom: () => void;
  setScannerAdminAberto: (aberto: boolean) => void;
  setPwaInstalavel: (instalavel: boolean) => void;
  setAppJaInstalado: (instalado: boolean) => void;
  setDeferredPrompt: (prompt: any) => void;
  setPWAState: (state: Partial<Pick<AdminState, 'deferredPrompt' | 'pwaInstalavel' | 'appJaInstalado'>>) => void;

  setSelectedOcorrencia: (oco: Ocorrencia | null) => void;
  setTermoBuscaPulseira: (termo: string) => void;
  setTendaOperadorId: (tendaId: string | null) => void;
  setTendaOperador: (tendaNome: string) => void;
  setOperadorSession: (dados: Partial<Pick<AdminState, 'operadorUserId' | 'operadorEmail' | 'operadorNome' | 'operadorRole' | 'operadorStatus' | 'operadorTendaId' | 'tendaOperador'>>) => void;
  carregarSessao: (navigate: (path: string, options?: any) => void) => Promise<void>;
  inicializarSessao: (navigate: (path: string, options?: any) => void) => Promise<void>;

  // Filter setters
  setFiltroMonitorStatus: (s: string) => void;
  setFiltroMonitorSituacao: (s: string) => void;
  setFiltroMonitorTendaId: (s: string) => void;
  setFiltroMonitorBusca: (s: string) => void;
  resetFiltrosMonitor: () => void;

  setFiltroDashTendaId: (s: string) => void;
  setFiltroDashStatus: (s: string) => void;
  setFiltroDashSituacao: (s: string) => void;
  resetFiltrosDash: () => void;

  setFiltroRelatorioPraia: (s: string) => void;
  setFiltroRelatorioStatus: (s: string) => void;
  setFiltroRelatorioSituacao: (s: string) => void;
  setFiltroRelatorioPeriodo: (s: string) => void;
  setFiltroRelatorioBusca: (s: string) => void;
  resetFiltrosRelatorio: () => void;

  // Print setters
  setLoteInicio: (inicio: number) => void;
  setLoteQuantidade: (qtd: number) => void;
  setTipoImpressao: (tipo: 'individual' | 'geral' | 'pulseiras' | 'cartazes') => void;

  // Modal open/close actions
  setModalNovaPulseira: (open: boolean) => void;
  setModalEdicaoPulseira: (item: PulseiraCadastro | null) => void;
  setModalExclusaoPulseira: (item: PulseiraCadastro | null) => void;
  setModalNovaTenda: (open: boolean) => void;
  setModalEdicaoTenda: (item: Tenda | null) => void;
  setModalExclusaoTenda: (item: Tenda | null) => void;
  setModalExclusaoOcorrencia: (item: Ocorrencia | null) => void;
  setModalHistoricoOcorrencia: (item: Ocorrencia | null) => void;
  setModalNovoUsuario: (open: boolean) => void;
  setModalEdicaoOperador: (item: Operador | null) => void;
  setModalExclusaoOperador: (item: Operador | null) => void;
  setModalNovoConvite: (open: boolean) => void;
  setConviteGeradoRecente: (convite: ConviteOperador | null) => void;
  abrirQrModal: (numero: string, crianca?: string) => void;
  fecharQrModal: () => void;
  openQRModal: (numero: string, crianca?: string) => void;
  closeQRModal: () => void;

  // Async server operations
  carregarDados: (tocarSom?: boolean) => Promise<void>;
  carregarOperadoresEConvites: () => Promise<void>;
  sincronizarOcorrenciaRealtime: (ocoPayload?: any) => void;
  definirTendaComoMinha: (tenda: Tenda) => Promise<void>;
  definirMinhaTenda: (tendaId: string, tendaNome: string) => Promise<void>;
  logout: (navigate: (path: string, options?: any) => void) => Promise<void>;
  atualizarStatusOcorrencia: (id: string, novoStatus: StatusOcorrencia, nota?: string) => Promise<boolean>;
  mudarStatusOcorrencia: (ocoId: string, novoStatus: StatusOcorrencia, ocoAtual?: Ocorrencia) => Promise<void>;
  excluirOcorrencia: (id: string) => Promise<void>;

  cadastrarPulseira: (dados: Omit<PulseiraCadastro, 'id' | 'data_cadastro' | 'ativo'>) => Promise<PulseiraCadastro>;
  atualizarPulseira: (id: string, dados: Partial<PulseiraCadastro>) => Promise<PulseiraCadastro>;
  excluirPulseira: (id: string) => Promise<void>;

  cadastrarTenda: (dados: Omit<Tenda, 'id' | 'criado_em'>) => Promise<Tenda>;
  atualizarTenda: (id: string, dados: Partial<Tenda>) => Promise<Tenda>;
  excluirTenda: (id: string) => Promise<void>;

  moderarOperador: (id: string, novoStatus: 'ativo' | 'bloqueado') => Promise<void>;
  atualizarOperador: (id: string, dados: Partial<Operador>) => Promise<void>;
  excluirOperador: (id: string) => Promise<void>;
  cadastrarOperadorDireto: (dados: any) => Promise<void>;
  criarConvite: (dados: any) => Promise<ConviteOperador>;

  subscribeRealtime: () => () => void;
}

const isTipoToast = (v?: string): v is 'sucesso' | 'erro' | 'info' =>
  v === 'sucesso' || v === 'erro' || v === 'info';

export const useAdminStore = create<AdminState>((set, get) => ({
  // Navigation & UI initial state
  secaoAtiva: 'dashboard',
  sidebarAberta: false,
  toast: null,
  somAtivado: true,
  scannerAdminAberto: false,
  pwaInstalavel: false,
  appJaInstalado: false,
  deferredPrompt: null,

  // Collections & Loading
  ocorrencias: [],
  cadastros: [],
  tendas: [],
  operadoresLista: [],
  convitesLista: [],
  praiasCadastradas: PRAIAS_GUARAPARI_PADRAO,
  loading: true,
  selectedOcorrencia: null,

  // Authenticated Operator Session initial state
  operadorUserId: null,
  operadorEmail: 'operador@anjosdapraia.org',
  operadorNome: 'Operador Central',
  operadorRole: 'operador',
  operadorStatus: 'ativo',
  operadorTendaId: null,
  tendaOperador: 'Posto Praia do Morro',
  tendaOperadorObj: null,

  // Tab Filters initial state
  termoBuscaPulseira: '',
  filtroMonitorStatus: 'ativos',
  filtroMonitorSituacao: 'todas',
  filtroMonitorTendaId: 'todas',
  filtroMonitorBusca: '',

  filtroDashTendaId: 'todas',
  filtroDashStatus: 'todos',
  filtroDashSituacao: 'todas',

  filtroRelatorioPraia: 'todas',
  filtroRelatorioStatus: 'todos',
  filtroRelatorioSituacao: 'todas',
  filtroRelatorioPeriodo: 'tudo',
  filtroRelatorioBusca: '',

  // Batch Print initial state
  loteInicio: 1001,
  loteQuantidade: 12,
  tipoImpressao: 'individual',

  // Modals initial state
  modalNovaPulseira: false,
  modalEdicaoPulseira: null,
  modalExclusaoPulseira: null,
  modalNovaTenda: false,
  modalEdicaoTenda: null,
  modalExclusaoTenda: null,
  modalExclusaoOcorrencia: null,
  modalHistoricoOcorrencia: null,
  modalNovoUsuario: false,
  modalEdicaoOperador: null,
  modalExclusaoOperador: null,
  modalNovoConvite: false,
  conviteGeradoRecente: null,
  qrModalOpen: false,
  qrNumero: '',
  qrCrianca: '',

  // Actions - UI & Navigation
  setSecaoAtiva: (secao) => set({ secaoAtiva: secao }),
  setSidebarAberta: (aberta) => set({ sidebarAberta: aberta }),
  mostrarToast: (tipo, mensagem) => set({ toast: { tipo, mensagem } }),
  fecharToast: () => set({ toast: null }),
  hideToast: () => set({ toast: null }),
  showToast: (mensagemOuTipo, tipoOuMensagem) => {
    let tipo: 'sucesso' | 'erro' | 'info' = 'sucesso';
    let mensagem = '';
    if (isTipoToast(mensagemOuTipo)) {
      tipo = mensagemOuTipo;
      mensagem = tipoOuMensagem || '';
    } else {
      mensagem = mensagemOuTipo;
      if (isTipoToast(tipoOuMensagem)) {
        tipo = tipoOuMensagem;
      }
    }
    set({ toast: { tipo, mensagem } });
  },
  setSomAtivado: (ativado) => set({ somAtivado: ativado }),
  toggleSomAtivado: () => set(s => ({ somAtivado: !s.somAtivado })),
  toggleSom: () => set(s => ({ somAtivado: !s.somAtivado })),
  setScannerAdminAberto: (aberto) => set({ scannerAdminAberto: aberto }),
  setPwaInstalavel: (instalavel) => set({ pwaInstalavel: instalavel }),
  setAppJaInstalado: (instalado) => set({ appJaInstalado: instalado }),
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setPWAState: (pwaState) => set(s => ({ ...s, ...pwaState })),

  setSelectedOcorrencia: (oco) => set({ selectedOcorrencia: oco }),
  setTermoBuscaPulseira: (termo) => set({ termoBuscaPulseira: termo }),
  setTendaOperadorId: (tendaId) => set({ operadorTendaId: tendaId }),
  setTendaOperador: (tendaNome) => set({ tendaOperador: tendaNome }),
  setOperadorSession: (dados) => set(s => ({ ...s, ...dados })),

  // Filter setters
  setFiltroMonitorStatus: (s) => set({ filtroMonitorStatus: s }),
  setFiltroMonitorSituacao: (s) => set({ filtroMonitorSituacao: s }),
  setFiltroMonitorTendaId: (s) => set({ filtroMonitorTendaId: s }),
  setFiltroMonitorBusca: (s) => set({ filtroMonitorBusca: s }),
  resetFiltrosMonitor: () => set({
    filtroMonitorStatus: 'ativos',
    filtroMonitorSituacao: 'todas',
    filtroMonitorTendaId: 'todas',
    filtroMonitorBusca: ''
  }),

  setFiltroDashTendaId: (s) => set({ filtroDashTendaId: s }),
  setFiltroDashStatus: (s) => set({ filtroDashStatus: s }),
  setFiltroDashSituacao: (s) => set({ filtroDashSituacao: s }),
  resetFiltrosDash: () => set({
    filtroDashTendaId: 'todas',
    filtroDashStatus: 'todos',
    filtroDashSituacao: 'todas'
  }),

  setFiltroRelatorioPraia: (s) => set({ filtroRelatorioPraia: s }),
  setFiltroRelatorioStatus: (s) => set({ filtroRelatorioStatus: s }),
  setFiltroRelatorioSituacao: (s) => set({ filtroRelatorioSituacao: s }),
  setFiltroRelatorioPeriodo: (s) => set({ filtroRelatorioPeriodo: s }),
  setFiltroRelatorioBusca: (s) => set({ filtroRelatorioBusca: s }),
  resetFiltrosRelatorio: () => set({
    filtroRelatorioPraia: 'todas',
    filtroRelatorioStatus: 'todos',
    filtroRelatorioSituacao: 'todas',
    filtroRelatorioPeriodo: 'tudo',
    filtroRelatorioBusca: ''
  }),

  // Print setters
  setLoteInicio: (inicio) => set({ loteInicio: inicio }),
  setLoteQuantidade: (qtd) => set({ loteQuantidade: qtd }),
  setTipoImpressao: (tipo) => set({ tipoImpressao: tipo }),

  // Modal actions
  setModalNovaPulseira: (open) => set({ modalNovaPulseira: open }),
  setModalEdicaoPulseira: (item) => set({ modalEdicaoPulseira: item }),
  setModalExclusaoPulseira: (item) => set({ modalExclusaoPulseira: item }),
  setModalNovaTenda: (open) => set({ modalNovaTenda: open }),
  setModalEdicaoTenda: (item) => set({ modalEdicaoTenda: item }),
  setModalExclusaoTenda: (item) => set({ modalExclusaoTenda: item }),
  setModalExclusaoOcorrencia: (item) => set({ modalExclusaoOcorrencia: item }),
  setModalHistoricoOcorrencia: (item) => set({ modalHistoricoOcorrencia: item }),
  setModalNovoUsuario: (open) => set({ modalNovoUsuario: open }),
  setModalEdicaoOperador: (item) => set({ modalEdicaoOperador: item }),
  setModalExclusaoOperador: (item) => set({ modalExclusaoOperador: item }),
  setModalNovoConvite: (open) => set({ modalNovoConvite: open }),
  setConviteGeradoRecente: (convite) => set({ conviteGeradoRecente: convite }),

  abrirQrModal: (numero, crianca = '') => set({ qrModalOpen: true, qrNumero: numero, qrCrianca: crianca }),
  fecharQrModal: () => set({ qrModalOpen: false, qrNumero: '', qrCrianca: '' }),
  openQRModal: (numero, crianca = '') => set({ qrModalOpen: true, qrNumero: numero, qrCrianca: crianca }),
  closeQRModal: () => set({ qrModalOpen: false, qrNumero: '', qrCrianca: '' }),

  // Auth & Session
  carregarSessao: async (navigate) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = session.user.id;
        const email = session.user.email || 'operador@anjosdapraia.org';
        const metaNome = session.user.user_metadata?.nome || 'Operador Central';

        set({
          operadorUserId: userId,
          operadorEmail: email,
          operadorNome: metaNome
        });

        const op = await dataService.obterOperador(userId);
        if (op) {
          if (op.status === 'bloqueado') {
            await dataService.fazerLogout();
            navigate('/login', { replace: true });
            return;
          }

          set({
            operadorNome: op.nome || metaNome,
            operadorRole: op.role || 'operador',
            operadorStatus: op.status || 'ativo',
            operadorTendaId: op.tenda_id || null,
          });

          if (op.tenda_id) {
            const todasTendas = await dataService.listarTendas();
            const tendaAssociada = todasTendas.find(t => t.id === op.tenda_id);
            if (tendaAssociada) {
              set({ 
                tendaOperador: tendaAssociada.nome,
                tendaOperadorObj: tendaAssociada 
              });
            }
          }
        }
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Erro ao verificar sessão do operador:', err);
      navigate('/login', { replace: true });
    }
  },

  inicializarSessao: async (navigate) => {
    await get().carregarSessao(navigate);
  },

  logout: async (navigate) => {
    try {
      await dataService.fazerLogout();
    } catch (err) {
      console.warn('Erro ao efetuar logout:', err);
    } finally {
      set({
        operadorUserId: null,
        operadorEmail: null,
        operadorNome: 'Operador Central',
        operadorRole: 'operador',
        operadorStatus: 'ativo',
        operadorTendaId: null,
        tendaOperador: 'Posto Praia do Morro',
        tendaOperadorObj: null,
      });
      navigate('/login', { replace: true });
    }
  },

  // Async server operations
  carregarDados: async (tocarSom = false) => {
    try {
      const [ocos, cads, tens, ops, prs, convs] = await Promise.all([
        dataService.listarOcorrencias(),
        dataService.listarCadastros(),
        dataService.listarTendas(),
        dataService.listarOperadores(),
        dataService.listarPraias(),
        dataService.listarConvites()
      ]);

      // Enriquecer ocorrências com cadastro da pulseira
      if (ocos.length > 0 && cads.length > 0) {
        const cadsMap = new Map<string, PulseiraCadastro>();
        cads.forEach(c => cadsMap.set(c.numero_pulseira, c));
        ocos.forEach(o => {
          o.cadastro = cadsMap.get(o.numero_pulseira);
        });
      }

      // Calcular tenda mais próxima
      if (ocos.length > 0 && tens.length > 0) {
        ocos.forEach(o => {
          o.tendaMaisProxima = dataService.calcularTendaMaisProxima(
            Number(o.latitude),
            Number(o.longitude),
            tens
          );
        });
      }

      const { operadorTendaId, selectedOcorrencia, somAtivado } = get();

      let novaTendaOperador = get().tendaOperador;
      let novaTendaObj = get().tendaOperadorObj;
      if (operadorTendaId) {
        const found = tens.find(t => t.id === operadorTendaId);
        if (found) {
          novaTendaOperador = found.nome;
          novaTendaObj = found;
        }
      }

      let novoSelected = selectedOcorrencia;
      if (ocos.length > 0 && (!selectedOcorrencia || !ocos.some(o => o.id === selectedOcorrencia.id))) {
        novoSelected = ocos[0];
      }

      set({
        ocorrencias: ocos,
        cadastros: cads,
        tendas: tens,
        operadoresLista: ops,
        praiasCadastradas: prs && prs.length > 0 ? prs : PRAIAS_GUARAPARI_PADRAO,
        convitesLista: convs,
        tendaOperador: novaTendaOperador,
        tendaOperadorObj: novaTendaObj,
        selectedOcorrencia: novoSelected,
        loading: false
      });

      if (tocarSom && somAtivado) {
        tocarBipAlerta(true);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
      set({ loading: false });
    }
  },

  carregarOperadoresEConvites: async () => {
    try {
      const [ops, convs] = await Promise.all([
        dataService.listarOperadores(),
        dataService.listarConvites()
      ]);
      set({ operadoresLista: ops, convitesLista: convs });
    } catch (err) {
      console.error('Erro ao recarregar equipe e convites:', err);
    }
  },

  sincronizarOcorrenciaRealtime: (_ocoPayload) => {
    // Recarrega todos os dados enriquecidos e toca alerta sonoro tático
    get().carregarDados(true);
  },

  definirTendaComoMinha: async (tenda: Tenda) => {
    set({
      tendaOperador: tenda.nome,
      operadorTendaId: tenda.id || null,
      tendaOperadorObj: tenda
    });
    const { operadorUserId } = get();
    if (operadorUserId && tenda.id) {
      try {
        await dataService.atualizarTendaOperador(operadorUserId, tenda.id);
        get().mostrarToast('sucesso', `Posto "${tenda.nome}" definido como sua base de operação!`);
      } catch (err: any) {
        console.error('Erro ao atualizar tenda do operador:', err);
        get().mostrarToast('erro', 'Erro ao salvar tenda no banco de dados: ' + (err.message || 'Erro desconhecido'));
      }
    }
  },

  definirMinhaTenda: async (tendaId: string, tendaNome: string) => {
    const { tendas } = get();
    const tendaEncontrada = tendas.find(t => t.id === tendaId) || {
      id: tendaId,
      nome: tendaNome,
      praia: 'Praia do Morro',
      latitude: -20.6552,
      longitude: -40.4880
    };
    await get().definirTendaComoMinha(tendaEncontrada);
  },

  atualizarStatusOcorrencia: async (id: string, novoStatus: StatusOcorrencia, nota?: string) => {
    try {
      const { ocorrencias, operadorNome } = get();
      const ocoAtual = ocorrencias.find(o => o.id === id);
      if (ocoAtual && ocoAtual.status === 'Reencontro realizado') {
        get().mostrarToast('erro', 'Esta ocorrência já foi finalizada e não pode ser alterada.');
        return false;
      }

      await dataService.atualizarStatusOcorrencia(
        id,
        novoStatus,
        operadorNome,
        nota,
        undefined,
        ocoAtual?.historico_status
      );

      if (novoStatus === 'Reencontro realizado') {
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore when non-DOM or test environment
        }
      }

      await get().carregarDados();
      get().mostrarToast('sucesso', `Status atualizado para: ${novoStatus}`);
      return true;
    } catch (err: any) {
      const msg = traduzirErroSupabase(err);
      get().mostrarToast('erro', msg);
      return false;
    }
  },

  mudarStatusOcorrencia: async (ocoId: string, novoStatus: StatusOcorrencia, ocoAtual?: Ocorrencia) => {
    if (ocoAtual && ocoAtual.status === 'Reencontro realizado') {
      get().mostrarToast('erro', 'Esta ocorrência já foi finalizada e não pode ser alterada.');
      return;
    }
    await get().atualizarStatusOcorrencia(ocoId, novoStatus);
  },

  excluirOcorrencia: async (id: string) => {
    try {
      await dataService.excluirOcorrencia(id);
      set(s => ({
        ocorrencias: s.ocorrencias.filter(o => o.id !== id),
        modalExclusaoOcorrencia: null
      }));
      get().mostrarToast('sucesso', 'Ocorrência removida do sistema.');
    } catch (err: any) {
      get().mostrarToast('erro', traduzirErroSupabase(err));
    }
  },

  cadastrarPulseira: async (dados) => {
    const nova = await dataService.cadastrarPulseira(dados);
    set(s => ({
      cadastros: [nova, ...s.cadastros],
      modalNovaPulseira: false
    }));
    get().mostrarToast('sucesso', 'Pulseira cadastrada com sucesso!');
    return nova;
  },

  atualizarPulseira: async (id, dados) => {
    const atualizada = await dataService.atualizarPulseira(id, dados);
    set(s => ({
      cadastros: s.cadastros.map(c => c.id === atualizada.id ? atualizada : c),
      modalEdicaoPulseira: null
    }));
    get().mostrarToast('sucesso', 'Cadastro atualizado com sucesso!');
    return atualizada;
  },

  excluirPulseira: async (id) => {
    await dataService.excluirPulseira(id);
    set(s => ({
      cadastros: s.cadastros.filter(c => c.id !== id),
      modalExclusaoPulseira: null
    }));
    get().mostrarToast('sucesso', 'Pulseira removida com sucesso.');
  },

  cadastrarTenda: async (dados) => {
    const nova = await dataService.criarTenda(dados);
    set(s => ({
      tendas: [...s.tendas, nova],
      modalNovaTenda: false
    }));
    get().mostrarToast('sucesso', 'Posto cadastrado com sucesso!');
    return nova;
  },

  atualizarTenda: async (id, dados) => {
    const atualizada = await dataService.atualizarTenda(id, dados);
    set(s => ({
      tendas: s.tendas.map(t => t.id === atualizada.id ? atualizada : t),
      modalEdicaoTenda: null
    }));
    get().mostrarToast('sucesso', 'Posto atualizado com sucesso!');
    return atualizada;
  },

  excluirTenda: async (id) => {
    await dataService.excluirTenda(id);
    set(s => ({
      tendas: s.tendas.filter(t => t.id !== id),
      modalExclusaoTenda: null
    }));
    get().mostrarToast('sucesso', 'Posto excluído com sucesso.');
  },

  moderarOperador: async (id, novoStatus) => {
    await dataService.atualizarOperador(id, { status: novoStatus });
    set(s => ({
      operadoresLista: s.operadoresLista.map(op =>
        op.id === id ? { ...op, status: novoStatus } : op
      )
    }));
    get().mostrarToast('sucesso', `Operador ${novoStatus === 'ativo' ? 'reativado' : 'bloqueado'} com sucesso.`);
  },

  atualizarOperador: async (id, dados) => {
    await dataService.atualizarOperador(id, dados);
    set(s => ({
      operadoresLista: s.operadoresLista.map(op =>
        op.id === id ? { ...op, ...dados } : op
      ),
      modalEdicaoOperador: null
    }));
    get().mostrarToast('sucesso', 'Operador atualizado com sucesso.');
  },

  excluirOperador: async (id) => {
    const { operadorUserId } = get();
    if (!operadorUserId) throw new Error('Operador não autenticado.');
    await dataService.excluirOperador(id, operadorUserId);
    set(s => ({
      operadoresLista: s.operadoresLista.filter(op => op.id !== id),
      modalExclusaoOperador: null
    }));
    get().mostrarToast('sucesso', 'Operador excluído com sucesso.');
  },

  cadastrarOperadorDireto: async (dados) => {
    const { operadorUserId } = get();
    if (!operadorUserId) throw new Error('Operador não autenticado.');
    await dataService.cadastrarOperadorDireto({
      ...dados,
      executadoPorUserId: operadorUserId
    });
    await get().carregarOperadoresEConvites();
    set({ modalNovoUsuario: false });
    get().mostrarToast('sucesso', 'Novo usuário cadastrado com sucesso!');
  },

  criarConvite: async (dados) => {
    const { operadorUserId } = get();
    if (!operadorUserId) throw new Error('Operador não autenticado.');
    const novoConvite = await dataService.criarConvite({
      ...dados,
      criadorId: operadorUserId
    });
    set(s => ({
      convitesLista: [novoConvite, ...s.convitesLista],
      conviteGeradoRecente: novoConvite
    }));
    get().mostrarToast('sucesso', 'Link de convite gerado com sucesso!');
    return novoConvite;
  },

  subscribeRealtime: () => {
    const unsubscribe = dataService.subscribeOcorrencias(() => {
      get().sincronizarOcorrenciaRealtime({ eventType: 'CHANGE' });
    });
    return unsubscribe;
  }
}));

// ==========================================================
// SELETORES GRANULARES E MEMOIZADOS (Substitutos de useMemo)
// ==========================================================

export const selectCadastrosFiltrados = (state: AdminState): PulseiraCadastro[] => {
  const q = state.termoBuscaPulseira.toLowerCase().trim();
  if (!q) return state.cadastros;
  return state.cadastros.filter(c =>
    c.numero_pulseira.toLowerCase().includes(q) ||
    c.nome_responsavel.toLowerCase().includes(q) ||
    (c.nome_crianca && c.nome_crianca.toLowerCase().includes(q)) ||
    c.telefone_contato.includes(q)
  );
};

export const selectChamadosAtivos = (state: AdminState): Ocorrencia[] =>
  state.ocorrencias.filter(o => o.status !== 'Reencontro realizado');

export const selectChamadosConcluidos = (state: AdminState): Ocorrencia[] =>
  state.ocorrencias.filter(o => o.status === 'Reencontro realizado');

export const selectOcorrenciasMonitoramento = (state: AdminState): Ocorrencia[] => {
  return state.ocorrencias.filter(o => {
    // Filtro de Status
    if (state.filtroMonitorStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
    if (state.filtroMonitorStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

    // Filtro de Situação / Etapa
    if (state.filtroMonitorSituacao !== 'todas' && o.status !== state.filtroMonitorSituacao) return false;

    // Filtro de Tenda
    if (state.filtroMonitorTendaId !== 'todas') {
      const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
      if (tendaIdOco !== state.filtroMonitorTendaId) return false;
    }

    // Filtro de Busca Texto
    if (state.filtroMonitorBusca.trim()) {
      const q = state.filtroMonitorBusca.toLowerCase().trim();
      const pulseiraMatch = o.numero_pulseira.toLowerCase().includes(q);
      const criancaMatch = o.cadastro?.nome_crianca?.toLowerCase().includes(q);
      const respMatch = o.cadastro?.nome_responsavel?.toLowerCase().includes(q);
      const telMatch = o.cadastro?.telefone_contato?.includes(q);
      if (!pulseiraMatch && !criancaMatch && !respMatch && !telMatch) return false;
    }

    return true;
  });
};

export const selectOcorrenciasDashboard = (state: AdminState): Ocorrencia[] => {
  return state.ocorrencias.filter(o => {
    if (state.filtroDashStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
    if (state.filtroDashStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

    // Filtro de Situação / Etapa
    if (state.filtroDashSituacao !== 'todas' && o.status !== state.filtroDashSituacao) return false;

    if (state.filtroDashTendaId !== 'todas') {
      const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
      if (tendaIdOco !== state.filtroDashTendaId) return false;
    }
    return true;
  });
};

export const selectDashCadastrosCount = (state: AdminState): number => {
  if (state.filtroDashTendaId === 'todas') return state.cadastros.length;
  return state.cadastros.filter(c => c.tenda_id === state.filtroDashTendaId).length;
};

export const selectDashAtivosCount = (state: AdminState): number => {
  const ocosDash = selectOcorrenciasDashboard(state);
  return ocosDash.filter(o => o.status !== 'Reencontro realizado').length;
};

export const selectDashConcluidosCount = (state: AdminState): number => {
  const ocosDash = selectOcorrenciasDashboard(state);
  return ocosDash.filter(o => o.status === 'Reencontro realizado').length;
};

export const selectDashboardKPIs = (state: AdminState) => {
  const ocosDash = selectOcorrenciasDashboard(state);
  const totalCadastros = selectDashCadastrosCount(state);
  const ativos = ocosDash.filter(o => o.status !== 'Reencontro realizado').length;
  const concluidos = ocosDash.filter(o => o.status === 'Reencontro realizado').length;
  const taxaSucesso = ocosDash.length > 0 ? Math.round((concluidos / ocosDash.length) * 100) : 100;

  return { totalCadastros, ativos, concluidos, taxaSucesso };
};

export const selectOcorrenciasRelatorios = (state: AdminState): Ocorrencia[] => {
  const agora = new Date().getTime();
  return state.ocorrencias.filter(o => {
    // Filtro de Praia
    if (state.filtroRelatorioPraia !== 'todas') {
      const praiaOco = o.cadastro?.praia_origem || o.tendaMaisProxima?.tenda?.praia;
      if (praiaOco !== state.filtroRelatorioPraia) return false;
    }

    // Filtro de Status
    if (state.filtroRelatorioStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
    if (state.filtroRelatorioStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;

    // Filtro de Situação / Etapa
    if (state.filtroRelatorioSituacao !== 'todas' && o.status !== state.filtroRelatorioSituacao) return false;

    // Filtro de Período
    if (state.filtroRelatorioPeriodo !== 'tudo') {
      const dataOco = new Date(o.horario_alerta).getTime();
      const diffHoras = (agora - dataOco) / (1000 * 60 * 60);
      if (state.filtroRelatorioPeriodo === 'hoje' && diffHoras > 24) return false;
      if (state.filtroRelatorioPeriodo === '7dias' && diffHoras > 24 * 7) return false;
      if (state.filtroRelatorioPeriodo === '30dias' && diffHoras > 24 * 30) return false;
    }

    // Filtro de Busca
    if (state.filtroRelatorioBusca.trim()) {
      const q = state.filtroRelatorioBusca.toLowerCase().trim();
      const pulseiraMatch = o.numero_pulseira.toLowerCase().includes(q);
      const criancaMatch = o.cadastro?.nome_crianca?.toLowerCase().includes(q);
      const respMatch = o.cadastro?.nome_responsavel?.toLowerCase().includes(q);
      const telMatch = o.cadastro?.telefone_contato?.includes(q);
      if (!pulseiraMatch && !criancaMatch && !respMatch && !telMatch) return false;
    }

    return true;
  });
};

// Aliases para conveniência
export const cadastrosFiltrados = selectCadastrosFiltrados;
export const chamadosAtivos = selectChamadosAtivos;
export const chamadosConcluidos = selectChamadosConcluidos;
export const ocorrenciasMonitoramento = selectOcorrenciasMonitoramento;
export const ocorrenciasDashboard = selectOcorrenciasDashboard;
export const dashCadastrosCount = selectDashCadastrosCount;
export const dashAtivosCount = selectDashAtivosCount;
export const dashConcluidosCount = selectDashConcluidosCount;
export const ocorrenciasRelatorios = selectOcorrenciasRelatorios;

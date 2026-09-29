# Análise Profunda de Gerenciamento de Estado do AdminPage.tsx & Arquitetura do Zustand Store

**Autor:** Explorer 2 (AdminState & Store Explorer)  
**Data:** 2026-09-28  
**Arquivo Alvo:** `c:\Users\felip\Documents\anjos-da-praia\src\pages\AdminPage.tsx` (3.892 linhas, 196.875 bytes)  
**Objetivo:** Catalogação exaustiva de hooks, mapeamento de dependências e dados cruzados, separação rigorosa de escopo (global vs. local) e especificação completa da arquitetura do store Zustand (`src/store/useAdminStore.ts`).

---

## 1. Catálogo Completo e Exaustivo de Hooks

Uma varredura linha por linha em `AdminPage.tsx` revelou que **todos os hooks do componente estão concentrados entre as linhas 62 e 638**. A partir da linha 639 até a 3892, encontram-se apenas funções auxiliares de eventos e o retorno JSX (incluindo mais de 1.180 linhas de modais inline).

### 1.1 Resumo Quantitativo de Hooks

| Tipo de Hook | Ocorrências | Observações |
|---|---|---|
| `useState` | **57** | Controla coleções de dados, perfil de sessão, filtros de 4 seções distintas, 14 modais e múltiplos inputs de formulários. |
| `useEffect` | **3** | Gerencia ciclo de vida do PWA (L272), permissões de Notificações Nativas (L364) e sessão Supabase + carregamento inicial + Realtime subscription (L468). |
| `useMemo` | **11** | Lista de 32 praias padrão de Guarapari (L186), lista unificada de praias ativas (L222), pulseiras filtradas (L524), contadores de chamados (L536, L537), ocorrências do monitoramento (L540), ocorrências do dashboard (L570), KPIs reativos do dashboard (L587, L592, L596) e ocorrências dos relatórios (L601). |
| `useRef` | **0** | Não importado nem utilizado diretamente. |
| `useReducer` | **0** | Não importado nem utilizado diretamente. |
| `useCallback` | **0** | Não importado nem utilizado diretamente (todos os handlers são recriados a cada renderização). |

---

### 1.2 Catálogo Detalhado de cada `useState` (57 Estados)

| Linha | Identificador do Estado | Tipo TypeScript | Valor Inicial | Domínio Funcional |
|---|---|---|---|---|
| **66** | `[secaoAtiva, setSecaoAtiva]` | `'dashboard' \| 'monitoramento' \| 'pulseiras' \| 'tendas' \| 'impressao' \| 'relatorios' \| 'usuarios'` | `'dashboard'` | Navegação / Layout |
| **67** | `[sidebarAberta, setSidebarAberta]` | `boolean` | `false` | Navegação / Drawer Mobile |
| **70** | `[ocorrencias, setOcorrencias]` | `Ocorrencia[]` | `[]` | Entidade Principal |
| **71** | `[cadastros, setCadastros]` | `PulseiraCadastro[]` | `[]` | Entidade Principal |
| **72** | `[tendas, setTendas]` | `Tenda[]` | `[]` | Entidade Principal |
| **73** | `[operadoresLista, setOperadoresLista]` | `Operador[]` | `[]` | Entidade Principal |
| **74** | `[loading, setLoading]` | `boolean` | `true` | UI / Carregamento Global |
| **75** | `[selectedOcorrencia, setSelectedOcorrencia]` | `Ocorrencia \| null` | `null` | Monitoramento / Mapa |
| **78** | `[operadorUserId, setOperadorUserId]` | `string \| null` | `null` | Sessão do Operador |
| **79** | `[operadorEmail, setOperadorEmail]` | `string` | `'operador@anjosdapraia.org'` | Sessão do Operador |
| **80** | `[operadorNome, setOperadorNome]` | `string` | `'Operador Central'` | Sessão do Operador |
| **81** | `[operadorRole, setOperadorRole]` | `'admin' \| 'operador' \| string` | `'operador'` | Sessão / Permissões RBAC |
| **82** | `[operadorStatus, setOperadorStatus]` | `'ativo' \| 'bloqueado' \| string` | `'ativo'` | Sessão / Status de Acesso |
| **83** | `[operadorTendaId, setOperadorTendaId]` | `string \| null` | `null` | Sessão / Posto Vinculado |
| **84** | `[tendaOperador, setTendaOperador]` | `string` | `'Posto Praia do Morro'` | Sessão / Nome do Posto |
| **87** | `[termoBuscaPulseira, setTermoBuscaPulseira]` | `string` | `''` | Filtro / Pulseiras |
| **90** | `[filtroMonitorStatus, setFiltroMonitorStatus]` | `'todos' \| 'ativos' \| 'concluidos'` | `'ativos'` | Filtro / Monitoramento |
| **91** | `[filtroMonitorSituacao, setFiltroMonitorSituacao]` | `string` | `'todas'` | Filtro / Monitoramento |
| **92** | `[filtroMonitorTendaId, setFiltroMonitorTendaId]` | `string` | `'todas'` | Filtro / Monitoramento |
| **93** | `[filtroMonitorBusca, setFiltroMonitorBusca]` | `string` | `''` | Filtro / Monitoramento |
| **96** | `[filtroDashTendaId, setFiltroDashTendaId]` | `string` | `'todas'` | Filtro / Dashboard |
| **97** | `[filtroDashStatus, setFiltroDashStatus]` | `'todos' \| 'ativos' \| 'concluidos'` | `'todos'` | Filtro / Dashboard |
| **98** | `[filtroDashSituacao, setFiltroDashSituacao]` | `string` | `'todas'` | Filtro / Dashboard |
| **101** | `[filtroRelatorioPraia, setFiltroRelatorioPraia]` | `string` | `'todas'` | Filtro / Relatórios |
| **102** | `[filtroRelatorioStatus, setFiltroRelatorioStatus]` | `'todos' \| 'ativos' \| 'concluidos'` | `'todos'` | Filtro / Relatórios |
| **103** | `[filtroRelatorioSituacao, setFiltroRelatorioSituacao]` | `string` | `'todas'` | Filtro / Relatórios |
| **104** | `[filtroRelatorioPeriodo, setFiltroRelatorioPeriodo]` | `'tudo' \| 'hoje' \| '7dias' \| '30dias'` | `'tudo'` | Filtro / Relatórios |
| **105** | `[filtroRelatorioBusca, setFiltroRelatorioBusca]` | `string` | `''` | Filtro / Relatórios |
| **108** | `[modalNovaPulseira, setModalNovaPulseira]` | `boolean` | `false` | Modal / Pulseira |
| **109** | `[modalEdicaoPulseira, setModalEdicaoPulseira]` | `PulseiraCadastro \| null` | `null` | Modal / Pulseira |
| **110** | `[modalExclusaoPulseira, setModalExclusaoPulseira]` | `PulseiraCadastro \| null` | `null` | Modal / Pulseira |
| **113** | `[modalNovaTenda, setModalNovaTenda]` | `boolean` | `false` | Modal / Tenda |
| **114** | `[modalEdicaoTenda, setModalEdicaoTenda]` | `Tenda \| null` | `null` | Modal / Tenda |
| **115** | `[modalExclusaoTenda, setModalExclusaoTenda]` | `Tenda \| null` | `null` | Modal / Tenda |
| **118** | `[modalExclusaoOcorrencia, setModalExclusaoOcorrencia]` | `Ocorrencia \| null` | `null` | Modal / Ocorrência |
| **121** | `[modalHistoricoOcorrencia, setModalHistoricoOcorrencia]` | `Ocorrencia \| null` | `null` | Modal / Ocorrência |
| **124** | `[modalNovoUsuario, setModalNovoUsuario]` | `boolean` | `false` | Modal / Equipe |
| **125** | `[formUsuarioNome, setFormUsuarioNome]` | `string` | `''` | Formulário / Novo Usuário |
| **126** | `[formUsuarioEmail, setFormUsuarioEmail]` | `string` | `''` | Formulário / Novo Usuário |
| **127** | `[formUsuarioSenha, setFormUsuarioSenha]` | `string` | `''` | Formulário / Novo Usuário |
| **128** | `[formUsuarioTendaId, setFormUsuarioTendaId]` | `string` | `''` | Formulário / Novo Usuário |
| **129** | `[formUsuarioRole, setFormUsuarioRole]` | `'operador' \| 'admin'` | `'operador'` | Formulário / Novo Usuário |
| **130** | `[salvandoNovoUsuario, setSalvandoNovoUsuario]` | `boolean` | `false` | Loading / Novo Usuário |
| **131** | `[erroModalUsuario, setErroModalUsuario]` | `string \| null` | `null` | Validação / Novo Usuário |
| **133** | `[modalEdicaoOperador, setModalEdicaoOperador]` | `Operador \| null` | `null` | Modal / Operador |
| **134** | `[modalExclusaoOperador, setModalExclusaoOperador]` | `Operador \| null` | `null` | Modal / Operador |
| **135** | `[modalNovoConvite, setModalNovoConvite]` | `boolean` | `false` | Modal / Convite |
| **136** | `[convitesLista, setConvitesLista]` | `ConviteOperador[]` | `[]` | Entidade Principal |
| **137** | `[formConviteValidadeHoras, setFormConviteValidadeHoras]` | `number` | `24` | Formulário / Convite |
| **138** | `[formConviteTendaId, setFormConviteTendaId]` | `string` | `''` | Formulário / Convite |
| **139** | `[formConviteRole, setFormConviteRole]` | `'operador' \| 'admin'` | `'operador'` | Formulário / Convite |
| **140** | `[formConviteUsos, setFormConviteUsos]` | `number` | `1` | Formulário / Convite |
| **141** | `[conviteGeradoRecente, setConviteGeradoRecente]` | `ConviteOperador \| null` | `null` | Modal / Convite Resultado |
| **144** | `[qrModalOpen, setQrModalOpen]` | `boolean` | `false` | Modal / QR Code Individual |
| **145** | `[qrNumero, setQrNumero]` | `string` | `''` | Modal / QR Code Individual |
| **146** | `[qrCrianca, setQrCrianca]` | `string \| undefined` | `''` | Modal / QR Code Individual |
| **149** | `[formPulseiraNumero, setFormPulseiraNumero]` | `string` | `''` | Formulário / Nova Pulseira |
| **150** | `[formPulseiraResponsavel, setFormPulseiraResponsavel]` | `string` | `''` | Formulário / Nova Pulseira |
| **151** | `[formPulseiraTelefone, setFormPulseiraTelefone]` | `string` | `''` | Formulário / Nova Pulseira |
| **152** | `[formPulseiraCrianca, setFormPulseiraCrianca]` | `string` | `''` | Formulário / Nova Pulseira |
| **153** | `[formPulseiraPraia, setFormPulseiraPraia]` | `string` | `'Praia do Morro'` | Formulário / Nova Pulseira |
| **154** | `[formPulseiraObs, setFormPulseiraObs]` | `string` | `''` | Formulário / Nova Pulseira |
| **155** | `[erroModalPulseira, setErroModalPulseira]` | `string \| null` | `null` | Validação / Nova Pulseira |
| **158** | `[formTendaNome, setFormTendaNome]` | `string` | `''` | Formulário / Nova Tenda |
| **159** | `[formTendaPraia, setFormTendaPraia]` | `string` | `'Praia do Morro'` | Formulário / Nova Tenda |
| **160** | `[formTendaLat, setFormTendaLat]` | `string` | `'-20.6590'` | Formulário / Nova Tenda |
| **161** | `[formTendaLng, setFormTendaLng]` | `string` | `'-40.4950'` | Formulário / Nova Tenda |
| **162** | `[formTendaResp, setFormTendaResp]` | `string` | `''` | Formulário / Nova Tenda |
| **163** | `[formTendaTel, setFormTendaTel]` | `string` | `''` | Formulário / Nova Tenda |
| **164** | `[erroModalTenda, setErroModalTenda]` | `string \| null` | `null` | Validação / Nova Tenda |
| **167** | `[loteInicio, setLoteInicio]` | `number` | `1001` | Impressão em Lote |
| **168** | `[loteQuantidade, setLoteQuantidade]` | `number` | `12` | Impressão em Lote |
| **169** | `[tipoImpressao, setTipoImpressao]` | `'individual' \| 'geral'` | `'individual'` | Impressão em Lote |
| **172** | `[toast, setToast]` | `{ tipo: 'erro' \| 'sucesso'; mensagem: string } \| null` | `null` | UI / Feedback Visual |
| **182** | `[praiasCadastradas, setPraiasCadastradas]` | `Praia[]` | `[]` | Entidade Principal |
| **183** | `[formTendaPraiaId, setFormTendaPraiaId]` | `string \| undefined` | `undefined` | Formulário / Nova Tenda |
| **238** | `[capturandoGpsTenda, setCapturandoGpsTenda]` | `boolean` | `false` | Formulário / GPS Geolocation |
| **264** | `[somAtivado, setSomAtivado]` | `boolean` | `true` | UI / Áudio Tático |
| **265** | `[scannerAdminAberto, setScannerAdminAberto]` | `boolean` | `false` | UI / Leitor de Câmera |
| **268** | `[deferredPrompt, setDeferredPrompt]` | `any` | `null` | PWA Lifecycle |
| **269** | `[pwaInstalavel, setPwaInstalavel]` | `boolean` | `false` | PWA Lifecycle |
| **270** | `[appJaInstalado, setAppJaInstalado]` | `boolean` | `false` | PWA Lifecycle |

---

### 1.3 Catálogo Detalhado de `useEffect` (3 Efeitos)

1. **Linhas 272 a 332: PWA Lifecycle & Standalone Detection**
   - **Gatilhos (`deps`):** `[]` (Executa apenas na montagem).
   - **Comportamento:**
     - Checa via `window.matchMedia('(display-mode: standalone)')` se a janela já está em modo PWA nativo.
     - Registra listener para evento nativo do Chromium `beforeinstallprompt`, salvando `deferredPrompt` e ativando `pwaInstalavel = true`.
     - Registra listener `appinstalled` para confirmar instalação e limpar prompt.
   - **Teardown / Cleanup:** Remove listeners de `beforeinstallprompt`, `appinstalled` e `matchMedia`.
2. **Linhas 364 a 368: Permissão para Notificações Nativas**
   - **Gatilhos (`deps`):** `[]`.
   - **Comportamento:** Se `'Notification' in window` e a permissão for `'default'`, invoca `Notification.requestPermission()`.
3. **Linhas 468 a 516: Sessão Supabase, Carga Inicial e Realtime Subscription**
   - **Gatilhos (`deps`):** `[]`.
   - **Comportamento:**
     - Busca sessão ativa via `supabase.auth.getSession()`.
     - Se logado, obtém registro do operador via `dataService.obterOperador(session.user.id)`.
     - Executa verificação crítica de segurança: se `op.status === 'bloqueado'`, encerra a sessão imediatamente e redireciona para `/login`.
     - Executa `carregarDados()` (Promise.all de todas as coleções com enriquecimento cruzado e Haversine).
     - Ativa canal em tempo real do Supabase: `dataService.subscribeOcorrencias(() => { carregarDados(true); })`.
   - **Teardown / Cleanup:** Invoca `unsubscribe()` retornado por `subscribeOcorrencias`.

---

### 1.4 Catálogo Detalhado de `useMemo` (11 Memoizações)

1. **L186–219 (`PRAIAS_GUARAPARI_PADRAO`):** Matriz estática com 32 praias oficiais de Guarapari e coordenadas de latitude/longitude padrão.
2. **L222–224 (`listaPraiasAtivas`):** Retorna `praiasCadastradas` se houver registros no banco, ou fallback para `PRAIAS_GUARAPARI_PADRAO`.
3. **L524–533 (`cadastrosFiltrados`):** Filtra a lista de pulseiras cadastradas por número, responsável, criança ou telefone a partir de `termoBuscaPulseira`.
4. **L536 (`chamadosAtivos`):** Ocorrências onde `status !== 'Reencontro realizado'`.
5. **L537 (`chamadosConcluidos`):** Ocorrências onde `status === 'Reencontro realizado'`.
6. **L540–567 (`ocorrenciasMonitoramento`):** Aplica filtros de status ('ativos' \| 'concluidos' \| 'todos'), situação da etapa, ID da tenda e busca textual nas ocorrências.
7. **L570–584 (`ocorrenciasDashboard`):** Aplica filtros de status, situação e tenda para a visualização inicial do Dashboard.
8. **L587–590 (`dashCadastrosCount`):** Contagem de cadastros de pulseiras reativa ao filtro de tenda do Dashboard.
9. **L592–594 (`dashAtivosCount`):** Contagem de alertas ativos nas ocorrências filtradas do Dashboard.
10. **L596–598 (`dashConcluidosCount`):** Contagem de alertas concluídos nas ocorrências filtradas do Dashboard.
11. **L601–638 (`ocorrenciasRelatorios`):** Filtra ocorrências para a auditoria de relatórios com base em praia, status, situação, janela temporal (24h, 7d, 30d, tudo) e busca textual.

---

## 2. Agrupamento de Estados por Domínio

Para desenhar o store do Zustand sem complexidade desnecessária, os 57 estados foram consolidados em **6 domínios essenciais**:

```
                              ┌─────────────────────────────────────────┐
                              │           useAdminStore                 │
                              └───────────────────┬─────────────────────┘
         ┌───────────────────┬────────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                    ▼                   ▼                   ▼
  ┌──────────────┐   ┌──────────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │  authSlice   │   │  dataSlice   │     │ filterSlice  │    │   uiSlice    │    │  modalSlice  │
  ├──────────────┤   ├──────────────┤     ├──────────────┤    ├──────────────┤    ├──────────────┤
  │ operador*    │   │ ocorrencias  │     │ filtroMon*   │    │ secaoAtiva   │    │ modais (14)  │
  │ tendaOperador│   │ cadastros    │     │ filtroDash*  │    │ sidebar      │    │ target items │
  │ session auth │   │ tendas       │     │ filtroRel*   │    │ som/scanner  │    │ QR modal     │
  │ login/logout │   │ operadores   │     │ termoPulseira│    │ toast/PWA    │    │              │
  │              │   │ convites     │     │              │    │ impressao    │    │              │
  └──────────────┘   └──────────────┘     └──────────────┘    └──────────────┘    └──────────────┘
```

### Domínio 1: Autenticação & Sessão do Operador (Auth & RBAC)
- **Variáveis:** `operadorUserId`, `operadorEmail`, `operadorNome`, `operadorRole`, `operadorStatus`, `operadorTendaId`, `tendaOperador`.
- **Papel:** Identificar o usuário corrente, alimentar selos na sidebar/topbar, preencher automaticamente o nome do operador ao mudar status de chamados e proteger ações administrativas (ex: apenas `role === 'admin'` vê gestão de usuários).

### Domínio 2: Coleções de Servidor (Core Server Entities & Sync)
- **Variáveis:** `ocorrencias`, `cadastros`, `tendas`, `operadoresLista`, `convitesLista`, `praiasCadastradas`, `loading`.
- **Papel:** Manter a fonte única da verdade para todos os dados trazidos do Supabase via `Promise.all`. Inclui os enriquecimentos em memória (relacionamento ocorrência ↔ cadastro e cálculo geodésico de tenda mais próxima).

### Domínio 3: Filtros de Busca & Critérios por Seção (Filters)
- **Monitoramento:** `filtroMonitorStatus`, `filtroMonitorSituacao`, `filtroMonitorTendaId`, `filtroMonitorBusca`.
- **Dashboard:** `filtroDashTendaId`, `filtroDashStatus`, `filtroDashSituacao`.
- **Pulseiras:** `termoBuscaPulseira`.
- **Relatórios:** `filtroRelatorioPraia`, `filtroRelatorioStatus`, `filtroRelatorioSituacao`, `filtroRelatorioPeriodo`, `filtroRelatorioBusca`.

### Domínio 4: Navegação, Layout & Shell Operacional (UI Shell)
- **Variáveis:** `secaoAtiva`, `sidebarAberta`, `selectedOcorrencia`, `somAtivado`, `scannerAdminAberto`, `toast`, `loteInicio`, `loteQuantidade`, `tipoImpressao`, `deferredPrompt`, `pwaInstalavel`, `appJaInstalado`.
- **Papel:** Controlar qual seção está visível na tela, a gaveta do menu móvel, o chamado selecionado para destaque no mapa Leaflet, alternador de áudio tático, banner de toast e suporte ao PWA.

### Domínio 5: Modais Globais & Entidades Alvo (Modal & Dialog Targets)
- **Variáveis:**
  - Pulseiras: `modalNovaPulseira`, `modalEdicaoPulseira`, `modalExclusaoPulseira`.
  - Tendas: `modalNovaTenda`, `modalEdicaoTenda`, `modalExclusaoTenda`.
  - Ocorrências: `modalExclusaoOcorrencia`, `modalHistoricoOcorrencia`.
  - Operadores/Convites: `modalNovoUsuario`, `modalEdicaoOperador`, `modalExclusaoOperador`, `modalNovoConvite`, `conviteGeradoRecente`.
  - QR Code: `qrModalOpen`, `qrNumero`, `qrCrianca`.

### Domínio 6: Formulários Efêmeros (Modal Draft Inputs - MANTER LOCAL)
- **Variáveis:** Todos os `formPulseira*`, `formTenda*`, `formUsuario*`, `formConvite*`, `erroModal*`, `salvandoNovoUsuario`, `capturandoGpsTenda`.
- **Papel:** **Estes estados NÃO devem ir para o store global do Zustand**. Devem permanecer encapsulados dentro dos seus respectivos componentes modais (`<ModalNovaPulseira />`, `<ModalNovaTenda />`, `<ModalNovoUsuario />`, etc.) para evitar re-renderizações globais a cada tecla digitada.

---

## 3. Mapeamento de Dependências e Fluxo de Dados Cruzado

Uma das descobertas mais importantes desta investigação são os **gatilhos cruzados de estado** existentes no `AdminPage.tsx`:

### 3.1 Gatilho Cruzado 1: Dashboard → Monitoramento & Mapa
- **Localização:** Linha 1424.
- **Ação:** O usuário clica em *"Ver no Mapa"* em uma ocorrência na tabela do Dashboard.
- **Efeito:**
  ```typescript
  setSelectedOcorrencia(oco);
  setSecaoAtiva('monitoramento');
  ```
- **Dependência:** O `selectedOcorrencia` precisa ser compartilhado entre o Dashboard e o Monitoramento/`MapView`. Se o estado fosse local ao componente do Monitoramento, essa navegação rápida perderia o item selecionado.

### 3.2 Gatilho Cruzado 2: TopBar (Câmera Scanner) → Pulseiras
- **Localização:** Linha 3349.
- **Ação:** O operador clica no botão *"Ler Pulseira"* no cabeçalho global e escaneia um QR Code.
- **Efeito:**
  ```typescript
  setTermoBuscaPulseira(finalNum);
  setSecaoAtiva('pulseiras');
  showToast(`Pulseira #${finalNum} escaneada com sucesso!`, 'sucesso');
  ```
- **Dependência:** O scanner fica no Header global, mas atualiza o filtro de busca da seção de Pulseiras e alterna a aba. Ambos devem estar no store Zustand.

### 3.3 Gatilho Cruzado 3: Tendas → Sessão do Operador
- **Localização:** Linha 1944.
- **Ação:** O operador clica em *"Definir como minha tenda"* em um dos cartões de tendas.
- **Efeito:**
  ```typescript
  setTendaOperador(t.nome);
  setOperadorTendaId(t.id);
  await dataService.atualizarTendaOperador(operadorUserId, t.id);
  ```
- **Dependência:** Atualiza o estado da sessão do operador, o que reflete imediatamente no rodapé da Sidebar, no seletor de filtros do Dashboard ("⭐ Meu Posto Atual") e no seletor de filtros do Monitoramento.

### 3.4 Gatilho Cruzado 4: Alerta Sonoro & Realtime
- **Localização:** Linhas 509–511.
- **Ação:** O evento do Supabase Realtime dispara `carregarDados(true)`.
- **Efeito:** O flag `somAtivado` é avaliado para decidir se o bip tático deve ser emitido via Web Audio API.

### 3.5 Gatilho Cruzado 5: Preservação de Filtros Durante Navegação
- **Cenário:** Se o operador filtra o monitoramento por "Meu Posto" e "Ativos", clica para cadastrar uma pulseira e depois volta para o monitoramento, os filtros devem permanecer intactos. Centralizar os filtros no store Zustand garante essa persistência natural entre mudanças de aba sem precisar de localStorage ou query params complexos.

---

## 4. Arquitetura do Zustand Store (`src/store/useAdminStore.ts`)

Abaixo está o design completo com as interfaces TypeScript, ações, slices e seletores otimizados.

### 4.1 Interfaces TypeScript do Store

```typescript
import { create } from 'zustand';
import { 
  Ocorrencia, 
  PulseiraCadastro, 
  Tenda, 
  Operador, 
  ConviteOperador, 
  Praia, 
  StatusOcorrencia 
} from '../types';

// ==========================================================
// 1. SLICE DE AUTENTICAÇÃO E SESSÃO DO OPERADOR
// ==========================================================
export interface AuthSlice {
  operadorUserId: string | null;
  operadorEmail: string;
  operadorNome: string;
  operadorRole: 'admin' | 'operador' | string;
  operadorStatus: 'ativo' | 'bloqueado' | string;
  operadorTendaId: string | null;
  tendaOperador: string;
  
  // Ações
  setOperadorSession: (dados: Partial<AuthSlice>) => void;
  definirMinhaTenda: (tendaId: string, tendaNome: string) => Promise<void>;
  carregarSessao: (navigate: (path: string, options?: any) => void) => Promise<void>;
  logout: (navigate: (path: string, options?: any) => void) => Promise<void>;
}

// ==========================================================
// 2. SLICE DE ENTIDADES E SINCRONIZAÇÃO DE DADOS
// ==========================================================
export interface DataSlice {
  ocorrencias: Ocorrencia[];
  cadastros: PulseiraCadastro[];
  tendas: Tenda[];
  operadoresLista: Operador[];
  convitesLista: ConviteOperador[];
  praiasCadastradas: Praia[];
  loading: boolean;

  // Ações Principais
  carregarDados: (tocarSom?: boolean) => Promise<void>;
  mudarStatusOcorrencia: (ocoId: string, novoStatus: StatusOcorrencia, ocoAtual?: Ocorrencia) => Promise<void>;
  excluirOcorrencia: (id: string) => Promise<void>;
  
  cadastrarPulseira: (dados: Omit<PulseiraCadastro, 'id' | 'data_cadastro'>) => Promise<PulseiraCadastro>;
  atualizarPulseira: (id: string, dados: Partial<PulseiraCadastro>) => Promise<void>;
  excluirPulseira: (id: string) => Promise<void>;

  cadastrarTenda: (dados: Omit<Tenda, 'id' | 'criado_em'>) => Promise<Tenda>;
  atualizarTenda: (id: string, dados: Partial<Tenda>) => Promise<void>;
  excluirTenda: (id: string) => Promise<void>;

  moderarOperador: (id: string, novoStatus: 'ativo' | 'bloqueado') => Promise<void>;
  atualizarOperador: (id: string, dados: Partial<Operador>) => Promise<void>;
  excluirOperador: (id: string) => Promise<void>;
  cadastrarOperadorDireto: (dados: any) => Promise<void>;
  criarConvite: (dados: any) => Promise<ConviteOperador>;
}

// ==========================================================
// 3. SLICE DE FILTROS POR ABA
// ==========================================================
export interface FilterSlice {
  // Monitoramento
  filtroMonitorStatus: 'todos' | 'ativos' | 'concluidos';
  filtroMonitorSituacao: string;
  filtroMonitorTendaId: string;
  filtroMonitorBusca: string;
  setFiltroMonitorStatus: (status: 'todos' | 'ativos' | 'concluidos') => void;
  setFiltroMonitorSituacao: (situacao: string) => void;
  setFiltroMonitorTendaId: (tendaId: string) => void;
  setFiltroMonitorBusca: (busca: string) => void;
  resetFiltrosMonitor: () => void;

  // Dashboard
  filtroDashTendaId: string;
  filtroDashStatus: 'todos' | 'ativos' | 'concluidos';
  filtroDashSituacao: string;
  setFiltroDashTendaId: (tendaId: string) => void;
  setFiltroDashStatus: (status: 'todos' | 'ativos' | 'concluidos') => void;
  setFiltroDashSituacao: (situacao: string) => void;
  resetFiltrosDash: () => void;

  // Pulseiras
  termoBuscaPulseira: string;
  setTermoBuscaPulseira: (termo: string) => void;

  // Relatórios
  filtroRelatorioPraia: string;
  filtroRelatorioStatus: 'todos' | 'ativos' | 'concluidos';
  filtroRelatorioSituacao: string;
  filtroRelatorioPeriodo: 'tudo' | 'hoje' | '7dias' | '30dias';
  filtroRelatorioBusca: string;
  setFiltroRelatorioPraia: (praia: string) => void;
  setFiltroRelatorioStatus: (status: 'todos' | 'ativos' | 'concluidos') => void;
  setFiltroRelatorioSituacao: (situacao: string) => void;
  setFiltroRelatorioPeriodo: (periodo: 'tudo' | 'hoje' | '7dias' | '30dias') => void;
  setFiltroRelatorioBusca: (busca: string) => void;
  resetFiltrosRelatorio: () => void;
}

// ==========================================================
// 4. SLICE DE NAVEGAÇÃO E SHELL OPERACIONAL (UI)
// ==========================================================
export interface UISlice {
  secaoAtiva: 'dashboard' | 'monitoramento' | 'pulseiras' | 'tendas' | 'impressao' | 'relatorios' | 'usuarios';
  sidebarAberta: boolean;
  selectedOcorrencia: Ocorrencia | null;
  somAtivado: boolean;
  scannerAdminAberto: boolean;
  toast: { tipo: 'erro' | 'sucesso'; mensagem: string } | null;

  // Emissão de Lote
  loteInicio: number;
  loteQuantidade: number;
  tipoImpressao: 'individual' | 'geral';

  // PWA
  deferredPrompt: any;
  pwaInstalavel: boolean;
  appJaInstalado: boolean;

  // Ações de UI
  setSecaoAtiva: (secao: UISlice['secaoAtiva']) => void;
  setSidebarAberta: (aberta: boolean) => void;
  setSelectedOcorrencia: (oco: Ocorrencia | null) => void;
  toggleSom: () => void;
  setScannerAdminAberto: (aberto: boolean) => void;
  showToast: (mensagem: string, tipo?: 'erro' | 'sucesso') => void;
  hideToast: () => void;
  setLoteInicio: (val: number) => void;
  setLoteQuantidade: (val: number) => void;
  setTipoImpressao: (tipo: 'individual' | 'geral') => void;
  setPWAState: (state: Partial<Pick<UISlice, 'deferredPrompt' | 'pwaInstalavel' | 'appJaInstalado'>>) => void;
}

// ==========================================================
// 5. SLICE DE GESTÃO DE MODAIS
// ==========================================================
export interface ModalSlice {
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
  qrCrianca?: string;

  // Setters de Modais
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
  setConviteGeradoRecente: (item: ConviteOperador | null) => void;
  openQRModal: (numero: string, crianca?: string) => void;
  closeQRModal: () => void;
}

// ESTORE UNIFICADO COMPLETO
export type AdminStore = AuthSlice & DataSlice & FilterSlice & UISlice & ModalSlice;
```

---

### 4.2 Seletores Granulares para Evitar Re-Renderizações

Para evitar que componentes filhos sofram re-renderização desnecessária, fornecemos seletores memoizados correspondentes aos antigos `useMemo`:

```typescript
// ==========================================================
// SELETORES DERIVADOS (Substitutos de useMemo)
// ==========================================================

export const selectCadastrosFiltrados = (state: AdminStore): PulseiraCadastro[] => {
  const q = state.termoBuscaPulseira.toLowerCase().trim();
  if (!q) return state.cadastros;
  return state.cadastros.filter(c =>
    c.numero_pulseira.toLowerCase().includes(q) ||
    c.nome_responsavel.toLowerCase().includes(q) ||
    (c.nome_crianca && c.nome_crianca.toLowerCase().includes(q)) ||
    c.telefone_contato.includes(q)
  );
};

export const selectChamadosAtivos = (state: AdminStore): Ocorrencia[] =>
  state.ocorrencias.filter(o => o.status !== 'Reencontro realizado');

export const selectChamadosConcluidos = (state: AdminStore): Ocorrencia[] =>
  state.ocorrencias.filter(o => o.status === 'Reencontro realizado');

export const selectOcorrenciasMonitoramento = (state: AdminStore): Ocorrencia[] => {
  return state.ocorrencias.filter(o => {
    if (state.filtroMonitorStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
    if (state.filtroMonitorStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;
    if (state.filtroMonitorSituacao !== 'todas' && o.status !== state.filtroMonitorSituacao) return false;
    if (state.filtroMonitorTendaId !== 'todas') {
      const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
      if (tendaIdOco !== state.filtroMonitorTendaId) return false;
    }
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

export const selectOcorrenciasDashboard = (state: AdminStore): Ocorrencia[] => {
  return state.ocorrencias.filter(o => {
    if (state.filtroDashStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
    if (state.filtroDashStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;
    if (state.filtroDashSituacao !== 'todas' && o.status !== state.filtroDashSituacao) return false;
    if (state.filtroDashTendaId !== 'todas') {
      const tendaIdOco = o.tendaMaisProxima?.tenda?.id || o.tenda_atendimento_id;
      if (tendaIdOco !== state.filtroDashTendaId) return false;
    }
    return true;
  });
};

export const selectDashboardKPIs = (state: AdminStore) => {
  const ocosDash = selectOcorrenciasDashboard(state);
  const totalCadastros = state.filtroDashTendaId === 'todas'
    ? state.cadastros.length
    : state.cadastros.filter(c => c.tenda_id === state.filtroDashTendaId).length;
  const ativos = ocosDash.filter(o => o.status !== 'Reencontro realizado').length;
  const concluidos = ocosDash.filter(o => o.status === 'Reencontro realizado').length;
  const taxaSucesso = ocosDash.length > 0 ? Math.round((concluidos / ocosDash.length) * 100) : 100;

  return { totalCadastros, ativos, concluidos, taxaSucesso };
};

export const selectOcorrenciasRelatorios = (state: AdminStore): Ocorrencia[] => {
  const agora = new Date().getTime();
  return state.ocorrencias.filter(o => {
    if (state.filtroRelatorioPraia !== 'todas') {
      const praiaOco = o.cadastro?.praia_origem || o.tendaMaisProxima?.tenda?.praia;
      if (praiaOco !== state.filtroRelatorioPraia) return false;
    }
    if (state.filtroRelatorioStatus === 'ativos' && o.status === 'Reencontro realizado') return false;
    if (state.filtroRelatorioStatus === 'concluidos' && o.status !== 'Reencontro realizado') return false;
    if (state.filtroRelatorioSituacao !== 'todas' && o.status !== state.filtroRelatorioSituacao) return false;
    if (state.filtroRelatorioPeriodo !== 'tudo') {
      const dataOco = new Date(o.horario_alerta).getTime();
      const diffHoras = (agora - dataOco) / (1000 * 60 * 60);
      if (state.filtroRelatorioPeriodo === 'hoje' && diffHoras > 24) return false;
      if (state.filtroRelatorioPeriodo === '7dias' && diffHoras > 24 * 7) return false;
      if (state.filtroRelatorioPeriodo === '30dias' && diffHoras > 24 * 30) return false;
    }
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
```

---

## 5. Cuidados Críticos na Migração de Estado (Migration Gotchas)

A refatoração de um arquivo monolítico de quase 4.000 linhas com 57 estados para componentes modulares com Zustand envolve armadilhas técnicas conhecidas:

### 5.1 Gotcha 1: Duplicação de Inscrições Supabase Realtime
- **Risco:** Se o `dataService.subscribeOcorrencias` for movido para dentro de um hook de seção ou inicializado em múltiplos componentes, conexões WebSockets duplicadas serão abertas, causando requisições em cascata e estourando a cota de conexões do Supabase.
- **Solução Recomendada:** Manter a subscrição Realtime restrita a **um único ponto de entrada**: no componente de composição `AdminPage.tsx` ou em um hook de inicialização global `useAdminInit()`, garantindo que o teardown `unsubscribe()` seja chamado no cleanup do unmount.

### 5.2 Gotcha 2: Stale Closures em Ações Assíncronas
- **Risco:** Em React clássico, funções como `carregarDados` capturam o valor de `selectedOcorrencia` e `operadorTendaId` no momento da criação da closure.
- **Solução no Zustand:** Ações do Zustand utilizam a função `get()`, que sempre lê o estado mais atualizado da store no momento da execução, eliminando por completo os bugs de stale closure. Exemplo:
  ```typescript
  const { operadorTendaId, selectedOcorrencia } = get();
  ```

### 5.3 Gotcha 3: Lentidão por Over-Globalization de Formulários (Keystroke Lag)
- **Risco:** Se cada letra digitada em `formUsuarioNome`, `formTendaNome` ou `formPulseiraNumero` despachar uma atualização para o Zustand store, componentes ouvintes poderão re-renderizar continuamente, gerando engasgos de digitação perceptíveis.
- **Solução:** O estado dos formulários de modais deve ser **100% local ao componente do modal**. O Zustand deve armazenar apenas o gatilho de abertura/fechamento e o item a ser editado (`modalEdicaoPulseira: PulseiraCadastro | null`). Ao submeter o formulário (`onSubmit`), o componente do modal despacha a ação para a store.

### 5.4 Gotcha 4: Fronteira Entre Store Zustand e React Router (`useNavigate`)
- **Risco:** A store do Zustand roda fora da árvore React (`vanilla store`) e não possui acesso nativo ao hook `useNavigate()`. Tentar invocar `useNavigate()` dentro de uma ação do Zustand causará erro fatal em tempo de execução.
- **Solução:** Passar a função `navigate` como parâmetro explícito nas ações que necessitam de redirecionamento de rota:
  ```typescript
  logout: async (navigate) => {
    await dataService.fazerLogout();
    navigate('/login', { replace: true });
  }
  ```

### 5.5 Gotcha 5: Instalação do Pacote `zustand`
- **Risco:** O `package.json` atual do projeto **não inclui a dependência `zustand`**. Se o refatorador tentar criar arquivos importando `'zustand'`, o build falhará (`Module not found`).
- **Ação Obrigatória:** O primeiro passo da implementação prática deve ser executar:
  ```bash
  npm install zustand
  ```

### 5.6 Gotcha 6: Estabilidade do Canvas do `MapView` (Leaflet)
- **Risco:** Componentes de mapa baseados em Leaflet recriam o container DOM ou disparam re-cálculos de tamanho (`invalidateSize`) se suas propriedades mudarem com frequência excessiva.
- **Solução:** O componente `MonitoringSection.tsx` deve isolar a renderização do `<MapView />`, fornecendo callbacks estáveis (`onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}`) para que a navegação do mapa não cause flickers visuais.

---

## 6. Conclusão da Investigação

1. O estado de `AdminPage.tsx` está catalogado em 100% de sua extensão (57 `useState`, 3 `useEffect`, 11 `useMemo`).
2. A separação entre estado global e local está estritamente delineada:
   - **Global (Zustand):** Dados do servidor, operador/sessão, navegação, filtros de abas, flags de modais abertos e toast.
   - **Local (React `useState` no componente):** Inputs de formulários, erros de validação imediatos e flags de progresso de upload/GPS.
3. A criação do store `src/store/useAdminStore.ts` com slices estruturadas proporcionará a redução do `AdminPage.tsx` de quase 4.000 linhas para uma casca de composição com menos de 250 linhas, com total paridade funcional e ganho expressivo de manutenibilidade.

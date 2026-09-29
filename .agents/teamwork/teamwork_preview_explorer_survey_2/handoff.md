# Handoff Report: AdminPage.tsx State Architecture Survey & Zustand Store Design

**Agent:** Explorer 2 (AdminState & Store Explorer)  
**Assigned Directory:** `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_explorer_survey_2`  
**Date:** 2026-09-28  
**Parent Conversation ID:** `b4e1b1e7-46d3-4c2f-94a3-3e510f42ff69`  
**Target Reference:** `c:\Users\felip\Documents\anjos-da-praia\src\pages\AdminPage.tsx`  
**Detailed Report:** `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_explorer_survey_2\analysis.md`

---

## 1. Observation

1. **Localização e Métricas de Código do AdminPage.tsx:**
   - Arquivo: `src/pages/AdminPage.tsx`
   - Total de linhas: 3.892 linhas (`(Get-Content src/pages/AdminPage.tsx).Length` = 3892).
   - Tamanho: 196.875 bytes (~192,3 KB).
   - O arquivo atua como uma página monolítica contendo todo o estado de sessão, dados de negócio, 7 abas funcionais, 14 modais e renderização de mapa/impressão.

2. **Inventário Completo de Hooks em `AdminPage.tsx`:**
   - **`useState`:** 57 chamadas distribuídas entre as linhas 66 e 270:
     - Navegação/Layout: `secaoAtiva` (L66), `sidebarAberta` (L67).
     - Entidades principais: `ocorrencias` (L70), `cadastros` (L71), `tendas` (L72), `operadoresLista` (L73), `convitesLista` (L136), `praiasCadastradas` (L182), `loading` (L74).
     - Operador autenticado: `operadorUserId` (L78), `operadorEmail` (L79), `operadorNome` (L80), `operadorRole` (L81), `operadorStatus` (L82), `operadorTendaId` (L83), `tendaOperador` (L84).
     - Seleção ativa: `selectedOcorrencia` (L75).
     - Filtros de abas: `termoBuscaPulseira` (L87), `filtroMonitorStatus` (L90), `filtroMonitorSituacao` (L91), `filtroMonitorTendaId` (L92), `filtroMonitorBusca` (L93), `filtroDashTendaId` (L96), `filtroDashStatus` (L97), `filtroDashSituacao` (L98), `filtroRelatorioPraia` (L101), `filtroRelatorioStatus` (L102), `filtroRelatorioSituacao` (L103), `filtroRelatorioPeriodo` (L104), `filtroRelatorioBusca` (L105).
     - Modais (14): `modalNovaPulseira` (L108), `modalEdicaoPulseira` (L109), `modalExclusaoPulseira` (L110), `modalNovaTenda` (L113), `modalEdicaoTenda` (L114), `modalExclusaoTenda` (L115), `modalExclusaoOcorrencia` (L118), `modalHistoricoOcorrencia` (L121), `modalNovoUsuario` (L124), `modalEdicaoOperador` (L133), `modalExclusaoOperador` (L134), `modalNovoConvite` (L135), `conviteGeradoRecente` (L141), `qrModalOpen` (L144).
     - Parâmetros de QR Code individual: `qrNumero` (L145), `qrCrianca` (L146).
     - Impressão em lote: `loteInicio` (L167), `loteQuantidade` (L168), `tipoImpressao` (L169).
     - UI, áudio e notificações: `toast` (L172), `somAtivado` (L264), `scannerAdminAberto` (L265).
     - PWA: `deferredPrompt` (L268), `pwaInstalavel` (L269), `appJaInstalado` (L270).
     - Inputs temporários de formulários: `formUsuarioNome` (L125), `formUsuarioEmail` (L126), `formUsuarioSenha` (L127), `formUsuarioTendaId` (L128), `formUsuarioRole` (L129), `salvandoNovoUsuario` (L130), `erroModalUsuario` (L131), `formConviteValidadeHoras` (L137), `formConviteTendaId` (L138), `formConviteRole` (L139), `formConviteUsos` (L140), `formPulseiraNumero` (L149), `formPulseiraResponsavel` (L150), `formPulseiraTelefone` (L151), `formPulseiraCrianca` (L152), `formPulseiraPraia` (L153), `formPulseiraObs` (L154), `erroModalPulseira` (L155), `formTendaNome` (L158), `formTendaPraia` (L159), `formTendaLat` (L160), `formTendaLng` (L161), `formTendaResp` (L162), `formTendaTel` (L163), `erroModalTenda` (L164), `formTendaPraiaId` (L183), `capturandoGpsTenda` (L238).
   - **`useRef`, `useReducer`, `useCallback`:** 0 ocorrências.
   - **`useEffect`:** 3 ocorrências:
     - L272–332: Lifecycle PWA (standalone + `beforeinstallprompt` + `appinstalled`).
     - L364–368: Notificações web nativas (`Notification.requestPermission()`).
     - L468–516: Sessão Supabase Auth, bloqueio de segurança, carga inicial de dados e `dataService.subscribeOcorrencias()`.
   - **`useMemo`:** 11 ocorrências:
     - L186: `PRAIAS_GUARAPARI_PADRAO` (32 praias).
     - L222: `listaPraiasAtivas`.
     - L524: `cadastrosFiltrados`.
     - L536: `chamadosAtivos`.
     - L537: `chamadosConcluidos`.
     - L540: `ocorrenciasMonitoramento`.
     - L570: `ocorrenciasDashboard`.
     - L587: `dashCadastrosCount`.
     - L592: `dashAtivosCount`.
     - L596: `dashConcluidosCount`.
     - L601: `ocorrenciasRelatorios`.

3. **Status de Dependência no `package.json`:**
   - Verificado em `package.json`: A biblioteca `zustand` **não está presente** nas dependências nem em `devDependencies`.
   - Teste de import via Node: `node -e "require('zustand')"` resultou em `MODULE_NOT_FOUND`.

4. **Gatilhos Cruzados de Estado:**
   - Dashboard → Monitoramento: Botão *"Ver no Mapa"* (L1424) executa `setSelectedOcorrencia(oco)` e `setSecaoAtiva('monitoramento')`.
   - TopBar Scanner → Pulseiras: Leitura de QR Code (L3349) executa `setTermoBuscaPulseira(num)` e `setSecaoAtiva('pulseiras')`.
   - Tendas → Operador: Ação *"Definir como minha tenda"* (L1944) executa `setTendaOperador` e `setOperadorTendaId`, atualizando a Sidebar e os filtros das demais abas.

---

## 2. Logic Chain

1. **Premissa 1 (Metas de Refatoração do Prompt Authoritativo):**
   - O prompt em `ORIGINAL_REQUEST.md` exige: modularizar o `AdminPage.tsx` para menos de 500 linhas e migrar seu gerenciamento de estado para `zustand` em `src/store/useAdminStore.ts`.
2. **Premissa 2 (Análise de Escopo e Performance):**
   - Se todos os 57 estados forem migrados indiscriminadamente para a raiz do Zustand, qualquer tecla digitada em um input de formulário (ex: `formPulseiraNumero`) disparará atualizações no store global, incorrendo em re-renderizações indesejadas dos ouvintes do store.
3. **Premissa 3 (Divisão Clara de Responsabilidade Global vs. Local):**
   - Os estados de coleções de servidor (`ocorrencias`, `cadastros`, `tendas`, `operadoresLista`, `convitesLista`, `praiasCadastradas`), sessão do operador (`operador*`), navegação (`secaoAtiva`, `sidebarAberta`), item selecionado (`selectedOcorrencia`), filtros de abas e modais de alto nível devem pertencer à store global do Zustand.
   - Os inputs de digitação de formulários e erros contextuais (`formPulseira*`, `formTenda*`, `formUsuario*`, `formConvite*`, `erroModal*`, `capturandoGpsTenda`) devem **permanecer como estados locais** dentro dos componentes dos respectivos modais.
4. **Premissa 4 (Slices e Seletores):**
   - A divisão do store em 5 slices especializadas (`authSlice`, `dataSlice`, `filterSlice`, `uiSlice`, `modalSlice`) garante código legível e manutenível.
   - O encapsulamento dos 11 `useMemo` em seletores puros derivados (como `selectOcorrenciasMonitoramento`, `selectCadastrosFiltrados`, `selectDashboardKPIs`) garante máxima performance com memoização e zero re-renderizações desnecessárias.

---

## 3. Caveats

1. **Necessidade de Instalar o Pacote Zustand:**
   - Antes de iniciar a implementação do store `src/store/useAdminStore.ts`, o pacote `zustand` deve ser instalado via `npm install zustand`. Sem isso, o build e o TypeScript falharão.
2. **Ciclo de Vida do Supabase Realtime:**
   - O `subscribeOcorrencias` deve ser instanciado em um único local no componente raiz `AdminPage.tsx` (ou custom hook `useAdminInit`) para evitar conexões WebSockets duplicadas.
3. **Vanilla Store vs. React Router:**
   - Ações que executam redirecionamento (`logout`, bloqueio de operador) devem receber a função `navigate` vinda do `useNavigate()` do React Router como argumento, pois a store Zustand não pode invocar hooks do React internamente.
4. **Áudio Procedural Bloqueado por Políticas de Autoplay:**
   - O Web Audio API (`tocarBipAlerta`) requer interação prévia do usuário no navegador para desbloquear o `AudioContext`.

---

## 4. Conclusion

A arquitetura de estado recomendada para o `src/store/useAdminStore.ts` consiste em:
- **5 Slices Modulares:** `authSlice`, `dataSlice`, `filterSlice`, `uiSlice`, `modalSlice`.
- **Preservação de Estado Local:** Formulários de cadastro de tendas, pulseiras, operadores e convites mantêm seus campos de texto e erros de validação imediatos localmente nos modais.
- **Seletores Memoizados:** Todos os filtros complexos de ocorrências, contadores de chamados ativos e KPIs são expostos como seletores puros.
- **Suporte Total aos Gatilhos Cruzados:** A seleção de ocorrência pelo Dashboard, a busca ativada pelo scanner da TopBar e a redefinição de tenda da Sidebar comunicam-se perfeitamente via store sem prop drilling.

O relatório técnico detalhado e o blueprint de código TypeScript para o Zustand store encontram-se em:
`c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_explorer_survey_2\analysis.md`.

---

## 5. Verification Method

Para verificar independentemente estas conclusões e testar a integridade antes e depois da refatoração:

1. **Inspeção de Contagem de Estados e Hooks:**
   ```powershell
   powershell -Command "Select-String -Path 'src/pages/AdminPage.tsx' -Pattern 'useState\(' | Measure-Object"
   # Confirma 57 chamadas de useState
   ```

2. **Verificação de Ausência do Pacote Zustand:**
   ```powershell
   node -e "try { require('zustand'); console.log('OK'); } catch (e) { console.log('Zustand ausente'); }"
   ```

3. **Verificação de Tipagem TypeScript Atual:**
   ```powershell
   npx tsc --noEmit
   # Deve passar sem erros no código base atual
   ```

4. **Verificação de Build Atual:**
   ```powershell
   npm run build
   # Deve completar com sucesso
   ```

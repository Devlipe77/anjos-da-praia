# Survey Arquitetural e Estrutural do AdminPage.tsx

## 1. Metadados do Arquivo e Resumo Executivo

- **Localização Exata:** `src/pages/AdminPage.tsx`
- **Caminho Absoluto:** `c:\Users\felip\Documents\anjos-da-praia\src\pages\AdminPage.tsx`
- **Contagem Exata de Linhas:** 3.892 linhas
- **Tamanho do Arquivo:** 196.875 bytes (~192,3 KB)
- **Papel na Aplicação:** Atua como o núcleo operacional e administrativo da plataforma Anjos da Praia, englobando dashboard de KPIs, visualização em mapa de ocorrências em tempo real, CRUD de pulseiras cadastradas, gestão de postos/tendas de apoio, geração e impressão de etiquetas/cartazes com QR Code, relatórios consolidados para órgãos públicos (CBMES e Prefeitura de Guarapari) e governança de equipe com permissões RBAC e convites temporários.
- **Problema Estrutural:** O arquivo concentra mais de 45 estados locais (`useState`), múltiplos efeitos colaterais de rede, áudio, notificações nativas, instalação de PWA, manipulação direta de DOM para impressão/download de CSV, 7 abas funcionais renderizadas inline e 14 caixas de diálogo / modais.

---

## 2. Enumeração Completa de Imports e Dependências

### 2.1 React & Hooks
- `React, { useState, useEffect, useMemo } from 'react'`
- Roteamento: `useNavigate from 'react-router-dom'`

### 2.2 Ícones Lucide React (50 Ícones)
```typescript
import { 
  BarChart3, MapPin, Users, Printer, Bell, PlusCircle, Search, Phone, 
  MessageCircle, Navigation, CheckCircle, Clock, QrCode, Edit3, Trash2, 
  LogOut, Menu, X, RefreshCw, LifeBuoy, Sparkles, Filter, Calendar, 
  Tent, AlertTriangle, User as UserIcon, UserCheck, Check, Flame, 
  Crosshair, FileSpreadsheet, FileDown, Camera, BellRing, Volume2, 
  VolumeX, Download, Smartphone, Laptop, ShieldCheck, History, Lock, 
  Share2, Copy, KeyRound, Ticket, UserMinus, ShieldAlert, UserPlus 
} from 'lucide-react';
```

### 2.3 Camada de Dados e Supabase
- `dataService, supabase from '../lib/supabase'`

### 2.4 Tipagens TypeScript e Utilitários de Domínio
- `PulseiraCadastro, Ocorrencia, Tenda, StatusOcorrencia, traduzirErroSupabase, Praia, Operador, ConviteOperador from '../types'`

### 2.5 Componentes Locais Customizados
- `MapView from '../components/MapView'` (renderizador do mapa Leaflet interativo)
- `StatusBadge from '../components/StatusBadge'` (selos visuais coloridos para status das ocorrências)
- `QRCodeModal, QRScannerModal from '../components/QRCodeModal'` (modal de exibição de QR Code individual e modal de leitor de câmera com html5-qrcode)

### 2.6 Bibliotecas de Terceiros
- `QRCodeSVG from 'qrcode.react'` (gerador vetorial SVG de QR codes para impressão e cartazes)
- `confetti from 'canvas-confetti'` (efeito festivo de confetes ao concluir reencontro de crianças)

---

## 3. Inventário Detalhado do Estado Local (State Inventory)

O arquivo possui aproximadamente 48 variáveis de estado gerenciadas via `useState`:

### 3.1 Navegação e Layout
- `secaoAtiva`: `'dashboard' | 'monitoramento' | 'pulseiras' | 'tendas' | 'impressao' | 'relatorios' | 'usuarios'` (default: `'dashboard'`)
- `sidebarAberta`: `boolean` (drawer lateral mobile)

### 3.2 Dados Principais (Coleções)
- `ocorrencias`: `Ocorrencia[]`
- `cadastros`: `PulseiraCadastro[]`
- `tendas`: `Tenda[]`
- `operadoresLista`: `Operador[]`
- `convitesLista`: `ConviteOperador[]`
- `praiasCadastradas`: `Praia[]`
- `loading`: `boolean`
- `selectedOcorrencia`: `Ocorrencia | null`

### 3.3 Operador Autenticado (Contexto da Sessão)
- `operadorUserId`: `string | null`
- `operadorEmail`: `string`
- `operadorNome`: `string`
- `operadorRole`: `'admin' | 'operador' | string`
- `operadorStatus`: `'ativo' | 'bloqueado' | string`
- `operadorTendaId`: `string | null`
- `tendaOperador`: `string`

### 3.4 Filtros por Seção
- **Pulseiras:** `termoBuscaPulseira` (`string`)
- **Monitoramento:** `filtroMonitorStatus` (`'todos' | 'ativos' | 'concluidos'`), `filtroMonitorSituacao` (`string`), `filtroMonitorTendaId` (`string`), `filtroMonitorBusca` (`string`)
- **Dashboard:** `filtroDashTendaId` (`string`), `filtroDashStatus` (`'todos' | 'ativos' | 'concluidos'`), `filtroDashSituacao` (`string`)
- **Relatórios:** `filtroRelatorioPraia` (`string`), `filtroRelatorioStatus` (`'todos' | 'ativos' | 'concluidos'`), `filtroRelatorioSituacao` (`string`), `filtroRelatorioPeriodo` (`'tudo' | 'hoje' | '7dias' | '30dias'`), `filtroRelatorioBusca` (`string`)

### 3.5 Formulários e Modais de Pulseiras
- `modalNovaPulseira`: `boolean`
- `modalEdicaoPulseira`: `PulseiraCadastro | null`
- `modalExclusaoPulseira`: `PulseiraCadastro | null`
- `formPulseiraNumero`: `string`
- `formPulseiraResponsavel`: `string`
- `formPulseiraTelefone`: `string`
- `formPulseiraCrianca`: `string`
- `formPulseiraPraia`: `string`
- `formPulseiraObs`: `string`
- `erroModalPulseira`: `string | null`

### 3.6 Formulários e Modais de Tendas
- `modalNovaTenda`: `boolean`
- `modalEdicaoTenda`: `Tenda | null`
- `modalExclusaoTenda`: `Tenda | null`
- `formTendaNome`: `string`
- `formTendaPraia`: `string`
- `formTendaPraiaId`: `string | undefined`
- `formTendaLat`: `string`
- `formTendaLng`: `string`
- `formTendaResp`: `string`
- `formTendaTel`: `string`
- `capturandoGpsTenda`: `boolean`
- `erroModalTenda`: `string | null`

### 3.7 Modais de Ocorrências
- `modalExclusaoOcorrencia`: `Ocorrencia | null`
- `modalHistoricoOcorrencia`: `Ocorrencia | null`

### 3.8 Gestão de Equipe & Convites
- `modalNovoUsuario`: `boolean`
- `formUsuarioNome`: `string`
- `formUsuarioEmail`: `string`
- `formUsuarioSenha`: `string`
- `formUsuarioTendaId`: `string`
- `formUsuarioRole`: `'operador' | 'admin'`
- `salvandoNovoUsuario`: `boolean`
- `erroModalUsuario`: `string | null`
- `modalEdicaoOperador`: `Operador | null`
- `modalExclusaoOperador`: `Operador | null`
- `modalNovoConvite`: `boolean`
- `formConviteValidadeHoras`: `number` (default: 24)
- `formConviteTendaId`: `string`
- `formConviteRole`: `'operador' | 'admin'`
- `formConviteUsos`: `number` (default: 1)
- `conviteGeradoRecente`: `ConviteOperador | null`

### 3.9 Impressão, Scanner e Utilitários de Interface
- `loteInicio`: `number` (default: 1001)
- `loteQuantidade`: `number` (default: 12)
- `tipoImpressao`: `'individual' | 'geral'`
- `qrModalOpen`: `boolean`
- `qrNumero`: `string`
- `qrCrianca`: `string | undefined`
- `scannerAdminAberto`: `boolean`
- `toast`: `{ tipo: 'erro' | 'sucesso'; mensagem: string } | null`
- `somAtivado`: `boolean` (default: true)
- `deferredPrompt`: `any` (PWA prompt)
- `pwaInstalavel`: `boolean`
- `appJaInstalado`: `boolean`

---

## 4. Seções da Página e Mecanismo de Troca (Roteamento Interno)

A alternância entre as seções é controlada puramente pelo estado `secaoAtiva`:

| Seção (`secaoAtiva`) | Título Visual | Intervalo de Linhas | Descrição e Componentes |
|---|---|---|---|
| `dashboard` | Visão Geral da Operação | L1227 – L1476 (~250 linhas) | Filtros de tenda e status, 4 KPIs reativos (`dashCadastrosCount`, `dashAtivosCount`, `dashConcluidosCount`, tempo médio GPS), tabela com 6 ocorrências mais recentes com link rápido para visualização no mapa, card com lista de postos na orla e alerta de horários de pico. |
| `monitoramento` | Central de Monitoramento & Mapa | L1477 – L1772 (~295 linhas) | Fila tática de ocorrências filtradas (busca de texto, tenda, situação, status). Cartões com links de discagem direta (`tel:`), WhatsApp (`wa.me`), rota GPS no Google Maps, botão de histórico de auditoria e alterador de status com gatilho de confete. À direita, renderiza o mapa interativo `<MapView />`. |
| `pulseiras` | Gerenciamento de Pulseiras & Cadastros | L1773 – L1883 (~110 linhas) | Listagem paginável/filtrável de pulseiras cadastradas, pesquisa em tempo real por pulseira/nome/telefone, ações de visualização de QR Code (`QRCodeModal`), edição e exclusão. |
| `tendas` | Gestão de Tendas e Postos de Apoio | L1884 – L1991 (~107 linhas) | Grade de cartões de cada tenda física cadastrada em Guarapari com praia, coordenador, contato, coordenadas GPS e ação para o operador definir o posto como sua base operacional atual (`dataService.atualizarTendaOperador`). |
| `impressao` | Emissão de Etiquetas & Cartazes | L1992 – L2169 (~177 linhas) | Gerador de etiquetas de pulseiras em lote (seleção de número inicial e quantidade) com `QRCodeSVG` apontando para `${origin}/alerta?pulseira=X` e gerador de 2 modelos de cartazes A4 com QR Code Geral para quiosques e banhistas. Disparo nativo de `window.print()`. |
| `relatorios` | Relatórios & Estatísticas por Praia | L2170 – L2393 (~223 linhas) | Tabela auditada e filtrável por praia (32 praias oficiais cadastradas), status, período (últimas 24h, 7 dias, 30 dias, tudo) e busca textual. 4 cartões de indicadores analíticos com taxa percentual de reencontro. Botão de exportação em planilha CSV. |
| `usuarios` | Gestão de Equipe & Controle de Acesso | L2394 – L2704 (~310 linhas) | Governança institucional (exclusiva para perfil `admin`): listagem de operadores, bloqueio/reativação imediata, edição de função e posto, exclusão protegida e tabela de convites temporais emitidos com expiração e link copiável para WhatsApp. |

### Gatilhos Cruzados de Navegação Entre Abas
1. **Do Dashboard para Monitoramento:** O botão *"Ver no Mapa"* em cada linha da tabela de ocorrências executa:
   ```typescript
   setSelectedOcorrencia(oco);
   setSecaoAtiva('monitoramento');
   ```
2. **Do Scanner de Câmera para Pulseiras:** Quando o QR Code é lido via câmera do dispositivo:
   ```typescript
   setTermoBuscaPulseira(finalNum);
   setSecaoAtiva('pulseiras');
   ```

---

## 5. Mapeamento Completo dos 14 Modais e Diálogos

Todos os modais estão alocados nas linhas 2705 a 3889 (~1.185 linhas contínuas de JSX):

1. **`modalNovaPulseira` (L2705 – L2799):** Formulário completo de cadastro de nova pulseira (número, responsável, telefone, criança, praia, observações). Invoca `dataService.cadastrarPulseira`.
2. **`modalEdicaoPulseira` (L2800 – L2859):** Formulário de edição dos dados da pulseira. Invoca `dataService.atualizarPulseira`.
3. **`modalExclusaoPulseira` (L2860 – L2890):** Diálogo de confirmação com aviso de conformidade LGPD. Invoca `dataService.excluirPulseira`.
4. **`modalNovaTenda` (L2891 – L3041):** Cadastro de posto com integração GPS do dispositivo (`navigator.geolocation`) e seleção rápida por botões de preset (`PRESETS_GUARAPARI`). Invoca `dataService.criarTenda`.
5. **`modalEdicaoTenda` (L3042 – L3195):** Edição de tenda existente com atualização de coordenadas e status ativo/pausado. Invoca `dataService.atualizarTenda`.
6. **`modalExclusaoTenda` (L3196 – L3226):** Confirmação de exclusão física de tenda. Invoca `dataService.excluirTenda`.
7. **`modalExclusaoOcorrencia` (L3227 – L3257):** Cancelamento de alarme falso / teste indevido. Invoca `dataService.excluirOcorrencia`.
8. **`modalHistoricoOcorrencia` (L3258 – L3335):** Linha do tempo visual da ocorrência, renderizando a trilha de auditoria (`historico_status`) com operador responsável e carimbo de data/hora.
9. **`QRCodeModal` (L3336 – L3343):** Exibição do QR Code individual e atalhos de compartilhamento/impressão.
10. **`QRScannerModal` (L3344 – L3365):** Leitor de câmera nativo para localização instantânea da pulseira.
11. **`modalEdicaoOperador` (L3366 – L3483):** Alteração de nome, posto vinculado, nível de acesso (`admin` vs `operador`) e status da conta, com proteção para o operador não auto-bloquear sua conta. Invoca `dataService.atualizarOperador`.
12. **`modalExclusaoOperador` (L3484 – L3542):** Remoção de operador com bloqueio institucional rigoroso (um coordenador não pode remover outro coordenador). Invoca `dataService.excluirOperador`.
13. **`modalNovoUsuario` (L3543 – L3713):** Cadastro direto de credenciais (email e senha) para voluntários ou administradores. Invoca `dataService.cadastrarOperadorDireto`.
14. **`modalNovoConvite` (L3714 – L3889):** Geração de link de auto-cadastro com expiração em horas (1h, 6h, 24h, 72h, 168h), limite de utilizações, cópia para o clipboard e compartilhamento no WhatsApp. Invoca `dataService.criarConvite`.

---

## 6. Contratos Externos e APIs do Navegador

### 6.1 Autenticação e Sessão Supabase
- Consulta de sessão ativa no carregamento: `supabase.auth.getSession()`
- Redirecionamento forçado para `/login` se a sessão for inválida ou o operador estiver com `status === 'bloqueado'`.
- Encerramento de sessão seguro via `dataService.fazerLogout()` com `navigate('/login', { replace: true })`.

### 6.2 Supabase Realtime
- Inscrição reativa para atualizações em tempo real nas ocorrências:
  ```typescript
  const unsubscribe = dataService.subscribeOcorrencias(() => {
    carregarDados(true);
  });
  ```
- No unmount do componente, o teardown `unsubscribe()` é obrigatoriamente chamado para prevenir vazamento de memória e conexões WebSocket zumbis.

### 6.3 Web Audio API (Sirene / Bip Tático de Alerta)
- Síntese de áudio procedural sem dependência de arquivos externos:
  ```typescript
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  // Oscilador de onda triangular em 880Hz e Ré agudo em 1174Hz
  ```
- Respeita a flag `somAtivado` com toggle no cabeçalho.

### 6.4 Web Notifications API
- Solicitação de permissão no carregamento: `Notification.requestPermission()`
- Envio de notificações push do sistema operacional (`new Notification(...)`) com ícone institucional.

### 6.5 Geolocation API (`navigator.geolocation`)
- Utilizado na definição e calibração de tendas:
  ```typescript
  navigator.geolocation.getCurrentPosition(callback, err, {
    enableHighAccuracy: true,
    timeout: 9000,
    maximumAge: 0
  });
  ```

### 6.6 PWA Lifecycle & Standalone Mode
- Detecção dinâmica de modo instalado (`display-mode: standalone`, `minimal-ui`, etc.).
- Captura do evento de browser `beforeinstallprompt` e listener `appinstalled`.
- Diálogo inteligente com instruções contextuais para iOS (Safari Compartilhar), Android (Menu ⋮) e Desktop (Barra de endereços).

### 6.7 Geração e Download de CSV
- Geração de Blob em memória com cabeçalho UTF-8 BOM (`\uFEFF`) e separador `;` para total compatibilidade com Microsoft Excel e Google Sheets em português.

### 6.8 Integração WhatsApp
- Limpeza e formatação de números telefônicos para o padrão internacional (`formatarWhatsapp`: prefixo `55`) com disparo de links `https://wa.me/...` e `https://api.whatsapp.com/send?text=...`.

---

## 7. Regras de Negócio Críticas e Invariantes Operacionais

1. **Imutabilidade de Ocorrências Concluídas:**
   - Uma vez que o status de uma ocorrência atinge `'Reencontro realizado'`, ela **não pode mais ser alterada** nem cancelada como alarme falso.
   - Qualquer tentativa de mudança bloqueia com mensagem de toast de advertência.
2. **Disparo de Confete no Reencontro:**
   - Ao alterar uma ocorrência para `'Reencontro realizado'`, dispara efeito visual `confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })`.
3. **Auditoria de Histórico e Linha do Tempo:**
   - Toda alteração de status registra no array `historico_status` o status anterior, o novo status, o operador responsável e o timestamp exato.
4. **Proteção Institucional de Coordenadores:**
   - Coordenadores Gerais (`role: 'admin'`) possuem proteção: outro coordenador não pode editar nem excluir sua conta.
   - Um operador não pode bloquear ou rebaixar seu próprio perfil de acesso (`disabled={op.id === operadorUserId}`).
5. **Cálculo Geodésico em Tempo Real:**
   - Ao carregar as ocorrências e tendas, cada chamado recebe o cálculo da tenda mais próxima (`dataService.calcularTendaMaisProxima(lat, lng, tendas)`) para orientar o socorro imediato.
6. **Enriquecimento Cruzado de Ocorrências:**
   - Cada ocorrência deve ser reconciliada em memória com seu respectivo cadastro de pulseira (`cadsMap.get(o.numero_pulseira)`), garantindo que nomes dos responsáveis e telefones estejam imediatamente disponíveis no mapa e na fila de monitoramento.

---

## 8. Arquitetura Alvo Recomendada para Refatoração

Para atingir a meta do projeto (transformar `AdminPage.tsx` em uma camada de composição com menos de 500 linhas):

### 8.1 Estrutura de Pastas Proposta (`src/features/admin/`)
```
src/
├── features/
│   └── admin/
│       ├── components/
│       │   ├── AdminHeader.tsx             # Topbar com PWA, Scanner, Som, CSV e Realtime badge
│       │   ├── AdminSidebar.tsx            # Menu lateral e rodapé do operador logado
│       │   ├── ToastNotification.tsx       # Toast de avisos e feedback de ações
│       │   ├── sections/
│       │   │   ├── DashboardSection.tsx    # Seção 1: KPIs, chamados recentes, postos
│       │   │   ├── MonitoringSection.tsx   # Seção 2: Fila tática e integração MapView
│       │   │   ├── WristbandsSection.tsx   # Seção 3: CRUD e tabela de pulseiras
│       │   │   ├── TentsSection.tsx        # Seção 4: Grade de tendas e vinculação
│       │   │   ├── BatchPrintSection.tsx   # Seção 5: Emissão individual e cartazes A4
│       │   │   ├── ReportsSection.tsx      # Seção 6: Auditoria, indicadores e filtros
│       │   │   └── UsersSection.tsx        # Seção 7: Gestão de equipe e convites
│       │   └── modals/
│       │       ├── WristbandModals.tsx     # Modais de nova, edição e exclusão de pulseira
│       │       ├── TentModals.tsx          # Modais de nova, edição e exclusão de tenda
│       │       ├── OccurrenceModals.tsx    # Modais de histórico e alarme falso
│       │       └── UserModals.tsx          # Modais de novo usuário, edição, exclusão e convite
│       └── utils/
│           ├── audioAlert.ts               # Bip sonoro sintetizado
│           ├── csvExport.ts                # Função exportarRelatorioCSV
│           └── pwaPrompt.ts                # Utilitário de registro PWA
```

### 8.2 Centralização de Estado no Zustand (`src/store/useAdminStore.ts`)
O store do Zustand deve consolidar:
- `secaoAtiva`, `setSecaoAtiva`
- `sidebarAberta`, `setSidebarAberta`
- `ocorrencias`, `cadastros`, `tendas`, `operadoresLista`, `convitesLista`, `praiasCadastradas`, `loading`
- `selectedOcorrencia`, `setSelectedOcorrencia`
- Dados do operador logado (`operadorUserId`, `operadorNome`, `operadorRole`, etc.)
- Todos os filtros das abas (`filtroMonitor*`, `filtroDash*`, `filtroRelatorio*`, `termoBuscaPulseira`)
- Ações assíncronas centrais: `carregarDados`, `handleMudarStatus`, `handleLogout`
- Estados de visibilidade de modais (`modalNovaPulseira`, `modalNovaTenda`, etc.)

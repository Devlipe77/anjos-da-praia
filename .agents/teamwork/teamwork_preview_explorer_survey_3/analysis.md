# Relatório de Decomposição UI & Componentes do AdminPage

**Data do Levantamento**: 2026-09-28  
**Agente Responsável**: Explorer 3 (AdminUI & Component Explorer)  
**Alvo**: `src/pages/AdminPage.tsx` (3.893 linhas, ~197 KB)  
**Objetivo**: Analisar a decomposição estrutural do `AdminPage.tsx` em componentes modulares sob `src/features/admin/`, migrando o estado complexo para `zustand` (`src/store/useAdminStore.ts`) e transformando `AdminPage.tsx` em um shell leve de composição (< 500 linhas, estimativa de ~140 linhas), garantindo 100% de paridade visual e funcional.

---

## 1. Visão Geral e Diagnóstico Atual

O arquivo `src/pages/AdminPage.tsx` atualmente concentra **3.893 linhas** de código TypeScript/JSX contendo:
- Gerenciamento de mais de **35 estados locais** (`useState`) para dados, filtros, modais, formulários e perfil de operador.
- Lógica de autenticação e sessão com Supabase Auth.
- Inscrição em tempo real com `Supabase Realtime` (`dataService.subscribeOcorrencias`).
- Áudio sintético via `Web Audio API` (osciladores e bips táteis de atenção).
- Suporte a instalação de PWA (`beforeinstallprompt`, detecção de modo standalone).
- Geodésia e captura de GPS de alta precisão pelo navegador.
- Exportação dinâmica de relatórios em formato CSV com codificação UTF-8 BOM.
- **7 corpos de abas completos** renderizados condicionalmente com tabelas, filtros e dashboards.
- **12 modais e diálogos** acoplados inline no final do arquivo.
- Dezenas de subfunções auxiliares de formatação e submissão.

Essa concentração gera alto acoplamento, re-renderizações desnecessárias da tela inteira a cada digitação de filtro e extrema dificuldade de manutenção. A refatoração modular proposta resolve todos esses pontos de forma limpa e padronizada.

---

## 2. Análise Detalhada da Estrutura JSX Atual

### 2.1 Shell de Layout, Sidebar e Topbar (Linhas 888 a 1224)

| Seção / Elemento | Linhas em `AdminPage.tsx` | Responsabilidade e Elementos Contidos | Classes Tailwind Chave & Ícones |
| :--- | :--- | :--- | :--- |
| **Container Principal** | 888 | Flex container de altura total da tela | `min-h-screen bg-[#F9FAFB] flex text-[#1A1D1F]` |
| **Sidebar Lateral (`AdminSidebar`)** | 893 - 1103 | Menu lateral fixo em desktop (`lg:w-64 lg:translate-x-0`), retrátil em mobile via `sidebarAberta`. Contém: logo/marca ("ANJOS DA PRAIA - Guarapari • ES"), badge de posto em operação (`tendaOperador`), 7 botões de navegação com badges numéricos reativos, e rodapé do operador com avatar, nome, e-mail, perfil (`Coordenador` / `Voluntário`) e botão de logout. | `fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E5E7EB]`<br>Ícones: `BarChart3`, `MapPin`, `Users`, `Tent`, `Printer`, `FileSpreadsheet`, `ShieldCheck`, `User`, `LogOut`, `X` |
| **Topbar Superior (`AdminHeader`)** | 1111 - 1193 | Barra de topo fixa (`sticky top-0 z-30`). Contém: botão hambúrguer mobile, título dinâmico da seção ativa, botão de instalar PWA, botão de scanner de câmera (`QRScannerModal`), botão de exportar CSV, badge de status do Supabase Realtime ativo (`animate-ping`), botão seletor de alerta sonoro (Mudo / Ativo) e botão de atualizar dados com feedback de rotação (`loading`). | `min-h-16 py-2.5 bg-white border-b border-[#E5E7EB] px-3 sm:px-6 sticky top-0 shadow-sm`<br>Ícones: `Menu`, `Download`, `Camera`, `FileDown`, `Volume2`, `VolumeX`, `RefreshCw` |
| **Notificações Toast (`AdminToast`)** | 1195 - 1219 | Toast flutuante no canto superior direito (`fixed top-4 right-4 z-50`) exibindo retornos de sucesso (verde) ou avisos/erros (vermelho) com botão de fechar e auto-dismiss em 5 segundos. | `fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-3`<br>Ícones: `Check`, `AlertTriangle`, `X` |
| **Container `<main>` de Conteúdo** | 1222 - 2698 | Wrapper do conteúdo dinâmico da aba ativa | `flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6` |

---

### 2.2 As 7 Abas de Conteúdo (`Tabs`)

#### Aba 1: Dashboard (`secaoAtiva === 'dashboard'`, Linhas 1227 a 1472)
- **Barra de Filtros Rápidos** (Linhas 1231 - 1318): Seletor de Tenda/Praia (`filtroDashTendaId`), Seletor de Situação/Etapa (`filtroDashSituacao`), pílulas de status (`filtroDashStatus`: 'todos', 'ativos', 'concluidos') e botão "Limpar".
- **4 Cards de KPIs Operacionais** (Linhas 1321 - 1363):
  1. *Crianças Cadastradas*: contador reativo à tenda selecionada.
  2. *Alertas em Aberto*: chamados ativos aguardando reencontro.
  3. *Reencontros Feitos*: taxa percentual de sucesso calculada dinamicamente.
  4. *Tempo Médio GPS*: indicador tático `< 4 min` com rota geodésica.
- **Tabela de Ocorrências Recentes em Tempo Real** (Linhas 1369 - 1439): Exibe até 6 ocorrências mais recentes (`ocorrenciasDashboard.slice(0, 6)`) com colunas Pulseira, Criança/Responsável, StatusBadge, Tenda Mais Próxima (com distância calculada em metros), e botão de ação "Ver no Mapa" (seleciona a ocorrência e muda `secaoAtiva` para `monitoramento`).
- **Cards Laterais de Apoio** (Linhas 1442 - 1468):
  - *Postos Ativos em Guarapari*: lista as primeiras 4 tendas ativas e sua praia.
  - *Horário de Pico na Areia*: card informativo com a janela crítica (14:00 às 16:30).

#### Aba 2: Central de Monitoramento & Mapa (`secaoAtiva === 'monitoramento'`, Linhas 1477 a 1768)
- **Layout Split de Tela Inteira**: `grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-8.5rem)]`.
- **Fila Operacional de Chamados (Coluna Esquerda, 5 cols)**:
  - Header com contagem de alertas ativos e total filtrado.
  - Barra de busca textual rápida (pulseira, criança, responsável, telefone) e filtro de tenda.
  - Pílulas de filtro de status (`ativos`, `concluidos`, `todos`) e combo de etapas/situações.
  - Lista scrollável de cartões de ocorrência (`OccurrenceCard`):
    - Cabeçalho: número da pulseira destacado, nome da criança, timestamp formatado, `StatusBadge`.
    - Box com dados da família (responsável, telefone, observações médicas/especiais).
    - Banner de proximidade com a tenda mais próxima calculada por Haversine.
    - Barra tática de ações: botão Ligar (`tel:`), botão WhatsApp (`wa.me` com mensagem pré-preenchida), botão Rota GPS (`Google Maps`), botão Histórico de Auditoria (abre `modalHistoricoOcorrencia`), seletor de atualização de status com disparo de confete no reencontro, e botão Cancelar Alarme Falso (excluir ocorrência de teste).
- **Mapa Leaflet Interativo (Coluna Direita, 7 cols)**:
  - Container responsivo que renderiza o componente `MapView` já existente (`src/components/MapView.tsx`).
  - Recebe as ocorrências filtradas, as tendas cadastradas e a ocorrência selecionada, permitindo navegação bidirecional (clicar no card centraliza o mapa; clicar no pino do mapa seleciona o card).

#### Aba 3: Pulseiras & Cadastros (`secaoAtiva === 'pulseiras'`, Linhas 1773 a 1880)
- **Header Operacional**: Contagem total de crianças cadastradas, campo de busca em tempo real (`termoBuscaPulseira`), e botão "Nova Pulseira" que dispara `setModalNovaPulseira(true)`.
- **Tabela Geral de Pulseiras**:
  - Colunas: Pulseira (`#numero`), Criança / Responsável, Telefone WhatsApp, Praia / Posto de Origem, Observações.
  - Ações por linha:
    - Botão QR Code: abre `QRCodeModal` com o QR da pulseira individual.
    - Botão Editar: abre `modalEdicaoPulseira` com os dados carregados.
    - Botão Excluir: abre `modalExclusaoPulseira` com aviso de exclusão LGPD.

#### Aba 4: Gestão de Tendas e Postos (`secaoAtiva === 'tendas'`, Linhas 1884 a 1987)
- **Header**: Descrição da gestão física de postos e botão "Cadastrar Novo Posto" (`setModalNovaTenda(true)`).
- **Grid de Cards de Tendas** (3 colunas):
  - Badge de praia oficial, nome do posto, status de operação (`Ativa` em verde ou `Pausada` em cinza).
  - Nome do coordenador do posto, telefone/rádio e coordenadas GPS (`latitude, longitude`).
  - Rodapé do card: Indicador "Sua tenda atual" ou botão "Definir como minha tenda" (que persiste a associação do operador à tenda via `dataService.atualizarTendaOperador`), além de botões de Editar e Excluir posto.

#### Aba 5: Emissão em Lote & Impressão (`secaoAtiva === 'impressao'`, Linhas 1992 a 2165)
- **Header e Controles**:
  - Alternador de modelo: "Pulseiras com QR Individual" vs "Cartazes de Quiosque (QR Geral)".
  - Controles de lote para pulseiras individuais: Número de início (`loteInicio`), Quantidade (`loteQuantidade`: 6, 12, 24).
  - Botão "Imprimir Folha" acionando `window.print()`.
- **Modo Individual**: Grade responsiva de cartões destacados com linhas tracejadas contendo o logotipo "ANJOS DA PRAIA", o QR Code SVG (`QRCodeSVG`) apontando para `/alerta?pulseira=${num}`, o número em destaque e instruções.
- **Modo Cartaz Geral**: Dois modelos de cartazes em tamanho A4 para quiosques e totens:
  1. *Cartaz de Quiosque/Salva-Vidas*: com QR Code geral apontando para `/alerta`, instruções em destaque e menção de parceria CBMES / Prefeitura.
  2. *Cartaz de Orientação às Famílias*: dicas de prevenção e incentivo ao cadastro da pulseira gratuita nos postos.

#### Aba 6: Relatórios & Estatísticas por Praia (`secaoAtiva === 'relatorios'`, Linhas 2170 a 2389)
- **Header com Exportador**: Título descritivo de prestação de contas com Prefeitura/CBMES e botão "Baixar Planilha Filtrada (.CSV)" (`exportarRelatorioCSV`).
- **Barra de 5 Filtros Avançados**:
  - Busca textual (pulseira, nome, fone).
  - Dropdown com todas as praias cadastradas de Guarapari.
  - Dropdown de status (todos, ativos, concluídos).
  - Dropdown de situação/etapa (Criança localizada, Equipe a caminho, Criança recebida, Pais contatados, Reencontro realizado).
  - Dropdown de período temporal (tudo, hoje/24h, 7 dias, 30 dias).
  - Botão de limpar filtros.
- **4 Cards Indicadores Dinâmicos por Praia**: Praia do Morro, Praia das Castanheiras, Praia da Areia Preta e Praia de Meaípe, com total de ocorrências, taxa de reencontro (%) e contadores de chamados finalizados vs em aberto.
- **Tabela de Auditoria LGPD**: Lista auditada de ocorrências que atendem aos filtros vigentes, com horários exatos (`formatarDataHora`), tendas mais próximas e dados do responsável protegidos.

#### Aba 7: Equipe & Usuários (`secaoAtiva === 'usuarios'`, Linhas 2394 a 2696)
- **Header de Gestão**: Total de integrantes, botões para administradores ("Novo Usuário" para cadastro direto e "Gerar Link de Convite" com expiração), e exibição da Chave Mestra institucional (`CODIGO_AUTORIZACAO_OFICIAL`).
- **Tabela de Operadores e Coordenadores**:
  - Nome (com badge "Você" para a sessão atual), e-mail, posto atribuído, nível de acesso (`⭐ Coordenador Geral` vs `Voluntário / Posto`) e status (`Ativo` / `Bloqueado`).
  - Ações operacionais:
    - Alternador Bloquear / Reativar operador.
    - Botão Editar (abre `modalEdicaoOperador`).
    - Botão Excluir (com proteção institucional: coordenadores não podem excluir outros coordenadores).
- **Tabela de Convites Temporais Emitidos** (visível apenas para administradores):
  - Código alfanumérico, posto vinculado, função atribuída, contagem de usos (`usos_atuais / usos_maximos`), prazo de validade com badge de expiração, e botão de copiar link direto para envio via WhatsApp.

---

### 2.3 Mapeamento Completo dos 12 Modais e Diálogos

Todos os modais atualmente estão concatenados entre as linhas 2705 e 3889 de `AdminPage.tsx`. Abaixo, a tabela com suas responsabilidades e localização:

| Modal | Linhas | Responsabilidade | Ações & Handlers Executados |
| :--- | :--- | :--- | :--- |
| **`ModalNovaPulseira`** | 2706 - 2800 | Formulário de criação de pulseira (número, responsável, telefone, criança, praia, observações). | `handleCadastrarPulseira` -> `dataService.cadastrarPulseira` |
| **`ModalEdicaoPulseira`** | 2801 - 2859 | Edição dos dados da criança, responsável, telefone e observações da pulseira ativa. | `handleSalvarEdicaoPulseira` -> `dataService.atualizarPulseira` |
| **`ModalExclusaoPulseira`** | 2861 - 2889 | Diálogo de confirmação com aviso de conformidade LGPD para exclusão de registro. | `handleExcluirPulseira` -> `dataService.excluirPulseira` |
| **`ModalNovaTenda`** | 2892 - 3040 | Cadastro de posto/tenda com seleção de praia oficial, captura de GPS via navegador (`handleCapturarGpsDispositivo`) e botões rápidos de presets de Guarapari. | `handleCadastrarTenda` -> `dataService.criarTenda` |
| **`ModalEdicaoTenda`** | 3043 - 3194 | Edição completa da tenda, incluindo ajuste manual de coordenadas, praia, coordenador, contato e checkbox de posto ativo. | `handleSalvarEdicaoTenda` -> `dataService.atualizarTenda` |
| **`ModalExclusaoTenda`** | 3197 - 3225 | Confirmação de exclusão física do posto de atendimento. | `handleExcluirTenda` -> `dataService.excluirTenda` |
| **`ModalExclusaoOcorrencia`** | 3227 - 3256 | Cancelamento e remoção de chamados falsos ou testes operacionais indevidos. | `handleExcluirOcorrencia` -> `dataService.excluirOcorrencia` |
| **`ModalHistoricoOcorrencia`** | 3258 - 3335 | Trilha de auditoria cronológica em linha do tempo vertical com registro de cada transição de status, data/hora e operador responsável. | Apenas visualização da trilha `historico_status` |
| **`ModalEdicaoOperador`** | 3369 - 3482 | Alteração de nome, posto atribuído, nível de acesso (admin/operador) e status (ativo/bloqueado). Protege auto-rebaixamento. | `dataService.atualizarOperador` |
| **`ModalExclusaoOperador`** | 3487 - 3541 | Diálogo de exclusão de operador com trava de segurança institucional (impede exclusão de coordenadores). | `dataService.excluirOperador` |
| **`ModalNovoUsuario`** | 3546 - 3712 | Cadastro direto e instantâneo de novo operador com e-mail, senha provisória, perfil e posto atribuído. | `dataService.cadastrarOperadorDireto` |
| **`ModalNovoConvite`** | 3716 - 3888 | Geração de link de convite temporal com seleção de horas de validade (1h a 7 dias), posto pré-definido e limite de usos. Inclui tela de sucesso com botões Copiar Link e Enviar via WhatsApp. | `dataService.criarConvite` |

*Nota*: O `AdminPage.tsx` também renderiza dois modais globais já existentes em `src/components/`:
- `QRCodeModal` (linhas 3338 - 3343): exibe o QR Code ampliado de uma pulseira individual.
- `QRScannerModal` (linhas 3346 - 3365): câmera de leitura de QR Code que preenche a busca e redireciona para a aba de pulseiras.

---

### 2.4 Funções Auxiliares Inline e Constantes

No topo de `AdminPage.tsx` existem várias constantes e utilitários embutidos que devem ser organizados em arquivos dedicados:
1. `PRAIAS_GUARAPARI_PADRAO` (Linhas 186 - 219): Matriz oficial contendo 32 praias de Guarapari com coordenadas geográficas padrão (latitude e longitude) e regiões.
2. `PRESETS_GUARAPARI` (Linhas 227 - 235): 7 atalhos rápidos de praias principais (Praia do Morro, Pedra do Siribeira, Castanheiras, Areia Preta, Meaípe, Bacutia, Setiba).
3. `handleCapturarGpsDispositivo` (Linhas 240 - 261): Wrapper da API nativa `navigator.geolocation.getCurrentPosition` com alta precisão.
4. `tocarBipAlerta` (Linhas 371 - 395): Sintetizador sonoro tático via `AudioContext` emitindo tom duplo (880 Hz seguido de 1174 Hz - nota Ré aguda padrão CBMES).
5. `dispararNotificacaoPush` (Linhas 397 - 408): Emissor de notificações nativas da Web Notification API.
6. Lógica de PWA (Linhas 272 - 361): Detecção de modo standalone, listener de `beforeinstallprompt` e método `handleInstalarPWA`.
7. `formatarWhatsapp` (Linhas 815 - 818): Limpeza e prefixação de código de país 55 para links `wa.me`.
8. `formatarDataHora` (Linhas 821 - 836): Conversor de ISO string para formato legível brasileiro `dd/mm/aaaa hh:mm:ss`.
9. `exportarRelatorioCSV` (Linhas 839 - 885): Criação de Blob CSV com delimitador `;` e prefixo UTF-8 BOM (`\uFEFF`).

---

## 3. Proposta de Estrutura de Diretórios Modular (`src/features/admin/`)

Propõe-se organizar a funcionalidade administrativa sob `src/features/admin/` e `src/store/` da seguinte forma:

```
src/
├── features/
│   └── admin/
│       ├── components/                  # Componentes reutilizáveis do painel admin
│       │   ├── AdminHeader.tsx          # Topbar fixa com título, PWA, scanner, CSV, Realtime e som
│       │   ├── AdminSidebar.tsx         # Menu lateral e rodapé com dados do operador logado
│       │   ├── AdminToast.tsx           # Toast flutuante de alertas e feedback de sucesso/erro
│       │   ├── KpiCard.tsx              # Card individual de métrica do Dashboard
│       │   └── OccurrenceCard.tsx       # Card de chamado tático na fila de monitoramento
│       │
│       ├── tabs/                        # Corpos das 7 abas do painel
│       │   ├── DashboardTab.tsx         # Aba 1: Métricas, filtros rápidos e chamados recentes
│       │   ├── MonitoramentoTab.tsx     # Aba 2: Fila de atendimento e Mapa Leaflet (MapView)
│       │   ├── PulseirasTab.tsx         # Aba 3: Tabela e busca de pulseiras cadastradas
│       │   ├── TendasTab.tsx            # Aba 4: Gestão e atribuição de tendas/postos
│       │   ├── ImpressaoTab.tsx         # Aba 5: Emissão e impressão em lote (QR individual e cartazes)
│       │   ├── RelatoriosTab.tsx        # Aba 6: Relatórios auditados e indicadores por praia
│       │   └── UsuariosTab.tsx          # Aba 7: Gestão de operadores e convites temporais
│       │
│       ├── modals/                      # Modais e diálogos desacoplados
│       │   ├── AdminModalsContainer.tsx # Container orquestrador de todos os modais
│       │   ├── ModalNovaPulseira.tsx
│       │   ├── ModalEdicaoPulseira.tsx
│       │   ├── ModalExclusaoPulseira.tsx
│       │   ├── ModalNovaTenda.tsx
│       │   ├── ModalEdicaoTenda.tsx
│       │   ├── ModalExclusaoTenda.tsx
│       │   ├── ModalExclusaoOcorrencia.tsx
│       │   ├── ModalHistoricoOcorrencia.tsx
│       │   ├── ModalNovoUsuario.tsx
│       │   ├── ModalEdicaoOperador.tsx
│       │   ├── ModalExclusaoOperador.tsx
│       │   └── ModalNovoConvite.tsx
│       │
│       ├── constants/                   # Constantes de praias, regiões e menus
│       │   └── adminConstants.ts        # PRAIAS_GUARAPARI_PADRAO, PRESETS_GUARAPARI, NAV_ITEMS
│       │
│       ├── hooks/                       # Custom hooks para comportamento encapsulado
│       │   ├── useAdminAudio.ts         # Alerta sonoro AudioContext e push notifications
│       │   └── usePwaInstall.ts         # Detecção e acionamento de instalação PWA
│       │
│       └── utils/                       # Utilitários de domínio
│           ├── formatters.ts            # formatarDataHora, formatarWhatsapp
│           ├── exportCsv.ts             # exportarRelatorioCSV com UTF-8 BOM
│           └── geoUtils.ts              # Captura de geolocalização com tratamento de erros
│
├── store/
│   └── useAdminStore.ts                 # Store central Zustand com dados, filtros, modais e ações
│
└── pages/
    └── AdminPage.tsx                    # Shell de composição magro (< 150 linhas)
```

---

## 4. Fronteiras de Componentes e Estratégia de Props (via Zustand)

Com a introdução do store Zustand (`useAdminStore`), **elimina-se completamente o prop drilling**. Os componentes não precisam receber props para ler dados ou disparar ações.

### 4.1 Tabela de Limites e Responsabilidades dos Componentes

| Componente | Arquivo | Responsabilidade | Props Recebidas |
| :--- | :--- | :--- | :--- |
| **`AdminSidebar`** | `components/AdminSidebar.tsx` | Renderiza drawer lateral com abas, contadores em tempo real e perfil do operador logado. | Nenhuma (consome do store). |
| **`AdminHeader`** | `components/AdminHeader.tsx` | Topbar com ações rápidas (PWA, scanner, CSV, Realtime, som, refresh). | Nenhuma (consome do store). |
| **`AdminToast`** | `components/AdminToast.tsx` | Exibe e fecha notificações de sucesso/erro. | Nenhuma (consome `toast` do store). |
| **`KpiCard`** | `components/KpiCard.tsx` | Exibe uma métrica com título, ícone, valor, cor e subtítulo explicativo. | `title: string, value: string\|number, subtitle: string, icon: LucideIcon, colorClass?: string` |
| **`OccurrenceCard`** | `components/OccurrenceCard.tsx` | Exibe os dados de um chamado, família, proximidade da tenda e ações táticas. | `ocorrencia: Ocorrencia` |
| **`DashboardTab`** | `tabs/DashboardTab.tsx` | Gerencia visualização do dashboard, filtros locais de tenda/status e lista recente. | Nenhuma (consome do store). |
| **`MonitoramentoTab`** | `tabs/MonitoramentoTab.tsx` | Renderiza split-screen: fila à esquerda e `MapView` Leaflet à direita. | Nenhuma (consome do store). |
| **`PulseirasTab`** | `tabs/PulseirasTab.tsx` | Exibe tabela de pulseiras com busca e botões de ação. | Nenhuma (consome do store). |
| **`TendasTab`** | `tabs/TendasTab.tsx` | Exibe cards de tendas e permite definir posto ativo ou editar/excluir. | Nenhuma (consome do store). |
| **`ImpressaoTab`** | `tabs/ImpressaoTab.tsx` | Gerencia modos de impressão e renderização de QR Codes SVG. | Nenhuma (consome do store). |
| **`RelatoriosTab`** | `tabs/RelatoriosTab.tsx` | Exibe filtros de auditoria, indicadores das praias e tabela detalhada. | Nenhuma (consome do store). |
| **`UsuariosTab`** | `tabs/UsuariosTab.tsx` | Tabela de operadores, moderação de acesso e emissão de links de convite. | Nenhuma (consome do store). |
| **`AdminModalsContainer`** | `modals/AdminModalsContainer.tsx` | Agrupa a renderização condicional de todos os modais. | Nenhuma (consome do store). |

### 4.2 Divisão de Estado: O que vai para o Zustand Store vs Estado Local

#### Estado no Zustand Store (`useAdminStore.ts`):
1. **Navegação & UI Global**:
   - `secaoAtiva`: `'dashboard' | 'monitoramento' | 'pulseiras' | 'tendas' | 'impressao' | 'relatorios' | 'usuarios'`
   - `sidebarAberta`: `boolean`
   - `loading`: `boolean`
   - `toast`: `{ tipo: 'erro' | 'sucesso'; mensagem: string } | null`
   - `somAtivado`: `boolean`
   - `scannerAdminAberto`: `boolean`
2. **Dados Principais de Produção**:
   - `ocorrencias`: `Ocorrencia[]`
   - `cadastros`: `PulseiraCadastro[]`
   - `tendas`: `Tenda[]`
   - `operadoresLista`: `Operador[]`
   - `convitesLista`: `ConviteOperador[]`
   - `praiasCadastradas`: `Praia[]`
   - `selectedOcorrencia`: `Ocorrencia | null`
3. **Operador Logado Atual**:
   - `operadorUserId`: `string | null`
   - `operadorEmail`: `string`
   - `operadorNome`: `string`
   - `operadorRole`: `string`
   - `operadorStatus`: `string`
   - `operadorTendaId`: `string | null`
   - `tendaOperador`: `string`
4. **Filtros Globais / Compartilhados**:
   - `termoBuscaPulseira`: `string`
   - `filtroMonitorStatus`, `filtroMonitorSituacao`, `filtroMonitorTendaId`, `filtroMonitorBusca`
   - `filtroDashTendaId`, `filtroDashStatus`, `filtroDashSituacao`
   - `filtroRelatorioPraia`, `filtroRelatorioStatus`, `filtroRelatorioSituacao`, `filtroRelatorioPeriodo`, `filtroRelatorioBusca`
5. **Abertura de Modais de Edição/Exclusão**:
   - `modalNovaPulseira`: `boolean`
   - `modalEdicaoPulseira`: `PulseiraCadastro | null`
   - `modalExclusaoPulseira`: `PulseiraCadastro | null`
   - `modalNovaTenda`: `boolean`
   - `modalEdicaoTenda`: `Tenda | null`
   - `modalExclusaoTenda`: `Tenda | null`
   - `modalExclusaoOcorrencia`: `Ocorrencia | null`
   - `modalHistoricoOcorrencia`: `Ocorrencia | null`
   - `modalNovoUsuario`: `boolean`
   - `modalEdicaoOperador`: `Operador | null`
   - `modalExclusaoOperador`: `Operador | null`
   - `modalNovoConvite`: `boolean`
   - `qrModal`: `{ open: boolean; numero: string; crianca?: string }`
6. **Ações Assíncronas Centrais**:
   - `carregarDados(tocarSom?: boolean): Promise<void>`
   - `mudarStatusOcorrencia(id: string, novoStatus: StatusOcorrencia, ocoAtual?: Ocorrencia): Promise<void>`
   - `showToast(mensagem: string, tipo?: 'erro' | 'sucesso'): void`
   - `logout(navigate: (path: string) => void): Promise<void>`

#### Estado que Permanece Local nos Componentes:
- Inputs de formulário temporários dentro dos próprios modais durante a digitação (ex: `formUsuarioNome`, `formUsuarioSenha`, `loteInicio`, `loteQuantidade` na aba de impressão, estado de salvando `salvandoNovoUsuario`). Isso mantém a performance perfeita e evita acionamentos desnecessários do store enquanto o usuário digita em um input.

---

## 5. Design do `AdminPage.tsx` Refatorado (< 150 Linhas)

O `AdminPage.tsx` passa a funcionar estritamente como um **shell de composição e inicialização**. Veja a arquitetura em código demonstrativa:

```tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';
import { AdminHeader } from '../features/admin/components/AdminHeader';
import { AdminToast } from '../features/admin/components/AdminToast';
import { AdminModalsContainer } from '../features/admin/modals/AdminModalsContainer';

// Importação das 7 abas modulares
import { DashboardTab } from '../features/admin/tabs/DashboardTab';
import { MonitoramentoTab } from '../features/admin/tabs/MonitoramentoTab';
import { PulseirasTab } from '../features/admin/tabs/PulseirasTab';
import { TendasTab } from '../features/admin/tabs/TendasTab';
import { ImpressaoTab } from '../features/admin/tabs/ImpressaoTab';
import { RelatoriosTab } from '../features/admin/tabs/RelatoriosTab';
import { UsuariosTab } from '../features/admin/tabs/UsuariosTab';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { secaoAtiva, inicializarSessao, carregarDados, subscribeRealtime } = useAdminStore();

  useEffect(() => {
    // 1. Inicializa sessão e valida perfil do operador
    inicializarSessao((path) => navigate(path, { replace: true }));

    // 2. Carrega todos os dados iniciais
    carregarDados();

    // 3. Conecta no Supabase Realtime
    const unsubscribe = subscribeRealtime();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#1A1D1F]">
      {/* 1. Menu Lateral Fixo / Retrátil */}
      <AdminSidebar />

      {/* 2. Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <AdminHeader />
        <AdminToast />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">
          {secaoAtiva === 'dashboard' && <DashboardTab />}
          {secaoAtiva === 'monitoramento' && <MonitoramentoTab />}
          {secaoAtiva === 'pulseiras' && <PulseirasTab />}
          {secaoAtiva === 'tendas' && <TendasTab />}
          {secaoAtiva === 'impressao' && <ImpressaoTab />}
          {secaoAtiva === 'relatorios' && <RelatoriosTab />}
          {secaoAtiva === 'usuarios' && <UsuariosTab />}
        </main>
      </div>

      {/* 3. Orquestrador de Todos os Modais e Diálogos */}
      <AdminModalsContainer />
    </div>
  );
};
```

**Resultado:**
- Linhas de código de `AdminPage.tsx`: **~60 a 80 linhas**.
- Redução: **~98% menor** que as 3.893 linhas atuais, superando com folga o critério de aceitação (< 500 linhas).
- Clareza visual absoluta e ciclo de vida do componente previsível.

---

## 6. Paridade Visual, Styling e Tokens de Design

Para assegurar paridade visual e funcional absoluta, foram catalogados todos os padrões de estilo e dependências utilizados:

### 6.1 Paleta de Cores & Tokens Tailwind
- **Laranja Primário (Identidade Anjos da Praia)**:
  - Fundo principal: `bg-[#FF6B35]`, hover: `hover:bg-[#E8531F]`
  - Texto e bordas: `text-[#FF6B35]`, `border-[#FF6B35]`, foco: `focus:border-[#FF6B35]`
  - Fundo suave / badge: `bg-[#FFF4EE]`, `bg-[#F9F1E7]`, borda suave: `border-[#FFD8C2]`
- **Azul Ação / Informação**:
  - Botões primários secundários: `bg-[#0B6EFD]`, hover: `hover:bg-[#0857CC]`
  - Badges suaves: `bg-[#EFF6FF]`, texto: `text-[#0B6EFD]`, borda: `border-[#BFDBFE]`
- **Verde Sucesso / Concluído**:
  - Botão confirmação / Pílulas: `bg-[#16A34A]`, hover: `hover:bg-[#15803D]`
  - Badge suave: `bg-[#DCFCE7]`, texto: `text-[#15803D]`, borda: `border-[#BBF7D0]`
- **Vermelho Alerta / Perigo / Exclusão**:
  - Botão excluir / alarme ativo: `bg-[#DC2626]`, hover: `hover:bg-red-700`
  - Badge suave: `bg-[#FEE2E2]`, texto: `text-[#DC2626]`, borda: `border-[#FECACA]`
- **Amarelo / Âmbar Atenção Operacional**:
  - Alerta moderado: `bg-[#FEF3C7]`, texto: `text-[#B45309]`, `text-[#92400E]`, borda: `border-[#FDE68A]`
- **Neutros de Fundo & Superfície**:
  - Fundo da aplicação: `bg-[#F9FAFB]`
  - Superfície dos cards e tabelas: `bg-white`
  - Bordas estruturais padrão: `border-[#E5E7EB]`
  - Tipografia primária: `text-[#1A1D1F]`
  - Tipografia secundária / legendas: `text-[#6B7280]`

### 6.2 Componentes e Bibliotecas de Terceiros Reutilizados
- **Leaflet & MapView**: `src/components/MapView.tsx` (utilizado na aba de Monitoramento sem qualquer alteração na interface).
- **StatusBadge**: `src/components/StatusBadge.tsx` (reutilizado nas tabelas e no `OccurrenceCard`).
- **QRCodeModal & QRScannerModal**: `src/components/QRCodeModal.tsx` (reutilizados para exibir QR individual e escanear via câmera).
- **QRCodeSVG**: `qrcode.react` (reutilizado na aba de impressão em lote e cartazes A4).
- **canvas-confetti**: disparado na conclusão de reencontros (`confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })`).
- **Lucide Icons**: biblioteca `lucide-react` com todos os ícones já mapeados.

---

## 7. Recomendações e Plano de Ação para Implementação

1. **Instalação do Zustand**:
   - `zustand` precisará ser adicionado às dependências (`npm install zustand` ou via package.json).
2. **Criação do Store Primeiro**:
   - Implementar `src/store/useAdminStore.ts` com os tipos completos e ações de carregamento e mutação.
3. **Criação dos Utilitários e Constantes**:
   - Mover constantes de praias e presets para `src/features/admin/constants/adminConstants.ts`.
   - Criar `src/features/admin/utils/formatters.ts`, `geoUtils.ts` e `exportCsv.ts`.
4. **Extração das Abas e Modais**:
   - Criar `src/features/admin/components/AdminSidebar.tsx` e `AdminHeader.tsx`.
   - Criar cada uma das 7 abas em `src/features/admin/tabs/`.
   - Criar os 12 modais em `src/features/admin/modals/` e agrupá-los em `AdminModalsContainer.tsx`.
5. **Atualização de `src/pages/AdminPage.tsx`**:
   - Substituir o arquivo monolítico pelo shell enxuto de ~70 linhas.
6. **Validação do Build**:
   - Executar `npx tsc --noEmit` para garantir 0 erros de compilação.
   - Executar `npm run build` para garantir o empacotamento sem regressões.

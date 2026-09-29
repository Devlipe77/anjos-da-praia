# Project: Refactoring AdminPage.tsx & Zustand Migration

## Architecture
Decompose the 3,892-line monolithic `src/pages/AdminPage.tsx` into clean, single-responsibility modules under `src/features/admin/` and centralize shared application state in `src/store/useAdminStore.ts` using `zustand`.

```
src/
├── store/
│   └── useAdminStore.ts          # Central Zustand store (auth, data, filters, modals, ui) [DONE]
├── features/admin/
│   ├── constants/
│   │   └── adminConstants.ts     # PRAIAS_GUARAPARI_PADRAO, PRESETS_GUARAPARI [DONE]
│   ├── utils/
│   │   ├── formatters.ts         # formatarDataHora, formatarWhatsapp [DONE]
│   │   ├── exportCsv.ts          # exportarRelatorioCSV [DONE]
│   │   └── audioAlert.ts         # tocarBipAlerta (AudioContext) [DONE]
│   ├── hooks/
│   │   └── useAdminInit.ts       # Supabase auth session, realtime subscriptions, notifications, PWA [DONE]
│   ├── components/               # [DONE]
│   │   ├── AdminHeader.tsx       # Header with actions, scanner, PWA, sound, export [DONE]
│   │   ├── AdminSidebar.tsx      # Sidebar with tabs navigation, badge counters, user profile [DONE]
│   │   ├── AdminToast.tsx        # Toast feedback notifications [DONE]
│   │   └── KpiCard.tsx           # Reusable KPI card [DONE]
│   ├── tabs/                     # [DONE]
│   │   ├── DashboardTab.tsx      # KPIs, active call cards, quick map navigation [DONE]
│   │   ├── MonitoramentoTab.tsx  # Tactical queue & Leaflet MapView integration [DONE]
│   │   ├── PulseirasTab.tsx      # Wristbands table, real-time search, QR modal trigger [DONE]
│   │   ├── TendasTab.tsx         # Tents card grid, GPS coordinates, define operator base [DONE]
│   │   ├── ImpressaoTab.tsx      # Batch & poster QR printing (QRCodeSVG, window.print) [DONE]
│   │   ├── RelatoriosTab.tsx     # 5-way filter bar, beach metrics, LGPD audit, CSV export [DONE]
│   │   └── UsuariosTab.tsx       # Operator list, RBAC permissions, temporary invite links [DONE]
│   ├── modals/                   # [DONE]
│   │   ├── PulseiraModals.tsx    # Create, edit, delete wristband modals [DONE]
│   │   ├── TendaModals.tsx       # Create, edit, delete tent modals [DONE]
│   │   ├── OcorrenciaModals.tsx  # Delete & history occurrence modals [DONE]
│   │   ├── OperadorModals.tsx    # Create, edit, delete operator & invite modals [DONE]
│   │   └── AdminModalsContainer.tsx # Composition wrapper for all admin modals [DONE]
│   └── index.ts                  # Public exports for the feature [DONE]
└── pages/
    └── AdminPage.tsx             # Lean composition and layout shell (69 lines!) [DONE]
```

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Zustand Dependency Installation | Add `zustand` to `package.json` and install | Milestone 1 | Survey | VERIFIED |
| 2 | Constants & Utilities Extraction | Extract constants, formatters, audio alerts, CSV export | Milestone 1 | Survey | VERIFIED |
| 3 | Zustand Admin Store | Implement `src/store/useAdminStore.ts` with all state, actions, and selectors | Milestone 1 | Survey | VERIFIED |
| 4 | Shell Components (Header, Sidebar, Toast) | Implement `AdminHeader`, `AdminSidebar`, `AdminToast` using Zustand store | Milestone 2 | Survey | VERIFIED |
| 5 | Operational Tabs (Dashboard & Monitoramento) | Implement `DashboardTab` and `MonitoramentoTab` with MapView integration | Milestone 2 | Survey | VERIFIED |
| 6 | Resource Tabs (Pulseiras, Tendas, Impressão) | Implement `PulseirasTab`, `TendasTab`, `ImpressaoTab` | Milestone 2 | Survey | VERIFIED |
| 7 | Governance Tabs (Relatórios & Usuários) | Implement `RelatoriosTab`, `UsuariosTab` with RBAC and invite generator | Milestone 2 | Survey | VERIFIED |
| 8 | Modals Modularization | Implement `PulseiraModals`, `TendaModals`, `OcorrenciaModals`, `OperadorModals`, `AdminModalsContainer` | Milestone 2 | Survey | VERIFIED |
| 9 | AdminPage.tsx Composition Shell | Refactor `AdminPage.tsx` into a lean shell (< 500 lines, target < 150 lines, achieved 69 lines) | Milestone 3 | Survey | VERIFIED |
| 10 | Lifecycle & Realtime Hook | Encapsulate auth verification, Realtime subscription, PWA, and notifications in `useAdminInit.ts` | Milestone 3 | Survey | VERIFIED |
| 11 | Build & Typecheck Verification | Verify `tsc --noEmit` passes with 0 errors and `npm run build` succeeds | Milestone 3 | Survey | VERIFIED |
| 12 | Forensic Audit & Integrity Gate | Reviewers, Challengers, and Forensic Auditor verification | Milestone 4 | Survey | VERIFIED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Foundation & State Store | Install `zustand`, extract constants and utils, build `src/store/useAdminStore.ts` | none | DONE |
| 2 | Feature Modularization | Implement `src/features/admin/` (components, tabs, modals, index.ts) | Milestone 1 | DONE |
| 3 | Shell Refactor & Build | Implement `useAdminInit.ts`, slim `AdminPage.tsx` (69 lines), verify `tsc` & `build` | Milestone 2 | DONE |
| 4 | Verification & Audit Gate | 2 Reviewers, 2 Challengers, and 1 Forensic Auditor gate checks | Milestone 3 | DONE |

## Gate Result: PASS
- Reviewer 1: APPROVE
- Reviewer 2: APPROVE
- Challenger 1: APPROVE
- Challenger 2: APPROVE
- Forensic Auditor 1: CLEAN

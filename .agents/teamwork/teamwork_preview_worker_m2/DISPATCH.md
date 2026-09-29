## 2026-09-29T01:48:27Z
You are Worker 2 (Feature Modularization Implementer).
Your assigned working directory is: c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m2

MANDATORY FIRST STEP: Read the authoritative original request at:
c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\ORIGINAL_REQUEST.md

Also read:
- Project Specification: c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\orchestrator\PROJECT.md
- Zustand Store: c:\Users\felip\Documents\anjos-da-praia\src\store\useAdminStore.ts
- Constants & Utils in c:\Users\felip\Documents\anjos-da-praia\src\features\admin\ (adminConstants, formatters, exportCsv, audioAlert)
- Explorer 3 Analysis (UI Decomposition & Line demarcations): c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_explorer_survey_3\analysis.md
- Original Monolith reference: c:\Users\felip\Documents\anjos-da-praia\src\pages\AdminPage.tsx

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You own exclusively:
- `src/features/admin/components/*`
- `src/features/admin/tabs/*`
- `src/features/admin/modals/*`
- `src/features/admin/index.ts`
DO NOT modify `src/pages/AdminPage.tsx` yet (that is Milestone 3).

Tasks:
Extract and implement genuine modular components from `src/pages/AdminPage.tsx` into `src/features/admin/`, consuming `useAdminStore` without prop drilling:
1. `src/features/admin/components/`:
   - `AdminHeader.tsx`: header bar, title, PWA button, QR scanner button, CSV export trigger, sound toggle, reload button, Realtime badge.
   - `AdminSidebar.tsx`: sidebar, logo, 7 tab buttons with counters, logged-in operator footer, logout button.
   - `AdminToast.tsx`: floating toast notification.
   - `KpiCard.tsx`: metric card helper.
2. `src/features/admin/tabs/`:
   - `DashboardTab.tsx`: KPIs, fast filters, quick occurrence cards with "Ver no Mapa" action.
   - `MonitoramentoTab.tsx`: occurrence queue list and Leaflet `<MapView />` side-by-side integration.
   - `PulseirasTab.tsx`: wristbands table, search, QR modal trigger, CRUD actions.
   - `TendasTab.tsx`: tent cards grid, "Definir como minha tenda" action, GPS capture, CRUD triggers.
   - `ImpressaoTab.tsx`: batch QR printing and A4 poster printing with `QRCodeSVG` and `window.print()`.
   - `RelatoriosTab.tsx`: 5-way filter bar, beach metrics, LGPD audit table, CSV export trigger.
   - `UsuariosTab.tsx`: operator governance table, status toggling, invite generation and table.
3. `src/features/admin/modals/`:
   - `PulseiraModals.tsx`: ModalNovaPulseira, ModalEdicaoPulseira, ModalExclusaoPulseira.
   - `TendaModals.tsx`: ModalNovaTenda, ModalEdicaoTenda, ModalExclusaoTenda.
   - `OcorrenciaModals.tsx`: ModalExclusaoOcorrencia, ModalHistoricoOcorrencia.
   - `OperadorModals.tsx`: ModalEdicaoOperador, ModalExclusaoOperador, ModalNovoUsuario, ModalNovoConvite.
   - `AdminModalsContainer.tsx`: container rendering all the above modals, plus QRCodeModal and QRScannerModal.
   (Form inputs and local validation inside modals remain local state to prevent unnecessary store updates).
4. `src/features/admin/index.ts`:
   - Export all components, tabs, modals, constants, and utils cleanly.
5. Verification:
   - Run `node node_modules/typescript/bin/tsc --noEmit`
   - Run `npm run build`
   Ensure both pass cleanly with 0 errors.

Outputs:
Write your implementation report to `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m2\analysis.md`.
Write a structured handoff to `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m2\handoff.md`.
Include: Observation, Logic Chain, Caveats, Conclusion, Verification Method with command outputs.
Send a message to parent when done.

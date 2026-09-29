## 2026-09-29T02:06:42Z
You are Worker 3 (Shell Refactoring & Lifecycle Implementer).
Your assigned working directory is: c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m3

MANDATORY FIRST STEP: Read the authoritative original request at:
c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\ORIGINAL_REQUEST.md

Also read:
- Project Specification: c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\orchestrator\PROJECT.md
- Zustand Store: c:\Users\felip\Documents\anjos-da-praia\src\store\useAdminStore.ts
- Feature Exports: c:\Users\felip\Documents\anjos-da-praia\src\features\admin\index.ts
- Original AdminPage: c:\Users\felip\Documents\anjos-da-praia\src\pages\AdminPage.tsx (check lifecycle lines 272-332, 364-368, 468-516)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You own exclusively:
- `src/features/admin/hooks/useAdminInit.ts`
- `src/features/admin/index.ts`
- `src/pages/AdminPage.tsx`

Tasks:
1. Implement `src/features/admin/hooks/useAdminInit.ts`:
   - Encapsulate all lifecycle and background integration effects:
     - Check Supabase auth session (`supabase.auth.getSession()` and `dataService.obterOperador(session.user.id)`).
     - If operator status is 'bloqueado', show toast error, call `supabase.auth.signOut()`, and `navigate('/login')`.
     - Call `carregarDados()` and `carregarOperadoresEConvites()`.
     - Subscribe to Supabase Realtime via `dataService.subscribeOcorrencias((oco) => sincronizarOcorrenciaRealtime(oco))` and return the cleanup unsubscribe callback on unmount.
     - Web Notification permission request (`Notification.requestPermission()`).
     - PWA lifecycle listeners (`beforeinstallprompt` saving deferredPrompt, `appinstalled`, and standalone matchMedia detection).
2. Export `useAdminInit` in `src/features/admin/index.ts`.
3. Refactor `src/pages/AdminPage.tsx`:
   - Replace the entire 3,892-line file with a clean, elegant composition shell.
   - Target line count is under 150 lines (must strictly be under 500 lines).
   - Hook up `useAdminInit()`.
   - Render `AdminSidebar`, `AdminHeader`, `AdminToast`, conditional tab rendering (`DashboardTab`, `MonitoramentoTab`, `PulseirasTab`, `TendasTab`, `ImpressaoTab`, `RelatoriosTab`, `UsuariosTab`), loading spinner, and `AdminModalsContainer`.
4. Verification:
   - Measure lines of `AdminPage.tsx` (must be < 150 lines).
   - Run `node node_modules/typescript/bin/tsc --noEmit` (must be 0 errors).
   - Run `npm run build` (must succeed with 0 errors).

Outputs:
Write your implementation report to `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m3\analysis.md`.
Write a structured handoff to `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m3\handoff.md`.
Include: Observation, Logic Chain, Caveats, Conclusion, Verification Method with command outputs.
Send a message to parent when done.

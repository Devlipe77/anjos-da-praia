## 2026-09-29T01:37:02Z

You are Worker 1 (Foundation & State Store Implementer).
Your assigned working directory is: c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m1

MANDATORY FIRST STEP: Read the authoritative original request at:
c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\ORIGINAL_REQUEST.md

Also read:
- Project Specification: c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\orchestrator\PROJECT.md
- Explorer 2 Analysis (State Architecture): c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_explorer_survey_2\analysis.md
- Explorer 3 Analysis (Constants & Utils): c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_explorer_survey_3\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You own exclusively:
- `package.json` and `package-lock.json` (for zustand dependency)
- `src/store/useAdminStore.ts`
- `src/features/admin/constants/adminConstants.ts`
- `src/features/admin/utils/formatters.ts`
- `src/features/admin/utils/exportCsv.ts`
- `src/features/admin/utils/audioAlert.ts`
DO NOT modify `src/pages/AdminPage.tsx` yet (that is Milestone 3).

Tasks:
1. Install `zustand`: run `npm install zustand` (or add to `package.json` and install).
2. Extract and implement:
   - `src/features/admin/constants/adminConstants.ts`: `PRAIAS_GUARAPARI_PADRAO`, `PRESETS_GUARAPARI`.
   - `src/features/admin/utils/formatters.ts`: `formatarDataHora`, `formatarWhatsapp`.
   - `src/features/admin/utils/exportCsv.ts`: `exportarRelatorioCSV` (with UTF-8 BOM and correct columns).
   - `src/features/admin/utils/audioAlert.ts`: `tocarBipAlerta` (procedural AudioContext tone).
3. Implement `src/store/useAdminStore.ts`:
   - Follow the complete `AdminState` interface defined in `PROJECT.md` and Explorer 2's `analysis.md`.
   - Implement all actions (`carregarDados`, `carregarOperadoresEConvites`, `sincronizarOcorrenciaRealtime`, `definirTendaComoMinha`, `logout`, filter setters, modal visibility triggers, toast, etc.).
   - Implement selectors for memoized filtered lists (`cadastrosFiltrados`, `ocorrenciasMonitoramento`, `ocorrenciasDashboard`, `dashCadastrosCount`, `dashAtivosCount`, `dashConcluidosCount`, `ocorrenciasRelatorios`).
4. Run verification:
   - Run `node node_modules/typescript/bin/tsc --noEmit`
   - Run `npm run build`
   Ensure both pass with exit code 0.

Outputs:
Write your implementation report to `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m1\analysis.md`.
Write a structured handoff to `c:\Users\felip\Documents\anjos-da-praia\.agents\teamwork\teamwork_preview_worker_m1\handoff.md`.
Include: Observation, Logic Chain, Caveats, Conclusion, Verification Method with command outputs.
Send a message to parent when done.

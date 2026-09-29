# Orchestration Plan: AdminPage Refactoring & Zustand Migration

## Objective
Refactor the monolithic `AdminPage.tsx` (~4000 lines) into smaller, manageable components within `src/features/admin/`, and migrate complex state to `zustand` (e.g. `src/store/useAdminStore.ts`).
Ensure `AdminPage.tsx` < 500 lines, functional parity preserved, `npx tsc --noEmit` clean, and `npm run build` succeeds.

## Step-by-Step Strategy

### Step 0: Survey & Scope Mapping
- Dispatch 3 parallel Explorers:
  - Explorer 1: Analyze overall structure of `AdminPage.tsx`, list all tabs/sections (Dashboard, Monitoramento, Pulseiras, Tendas, Operadores, Relatórios, etc.), imports, and external service/hook dependencies.
  - Explorer 2: Analyze all state hooks (`useState`, `useRef`, `useEffect`, contexts) in `AdminPage.tsx`, map state variables, action handlers, and identify what belongs in `useAdminStore.ts`.
  - Explorer 3: Analyze subcomponents, modals, tables, and UI chunks inside `AdminPage.tsx` and map out the target modular file structure under `src/features/admin/`.

### Step 1: Synthesis & PROJECT.md
- Reconcile findings from the 3 Explorers.
- Write `PROJECT.md` detailing:
  - Feature Inventory
  - Target Component Architecture & File Layout
  - Zustand Store State & Actions Schema
  - Milestones & Interface Contracts

### Step 2: Implementation & Verification Loop
- Dispatch Worker(s) to:
  1. Create `src/store/useAdminStore.ts` (or split slices if appropriate).
  2. Implement modular feature components under `src/features/admin/`.
  3. Refactor `AdminPage.tsx` to compose these feature components and verify line count (< 500 lines).
  4. Run `npx tsc --noEmit` and `npm run build` to verify zero regressions.

### Step 3: Review, Challenger, & Forensic Audit Gate
- Dispatch Reviewers to inspect code quality, modularity, prop drilling elimination.
- Dispatch Challengers to verify functional parity and runtime behavior.
- Dispatch Forensic Auditor to verify integrity (no dummy code, no hardcoding, genuine logic).

### Step 4: Final Sign-off & Sentinel Notification
- Verify all gate criteria pass.
- Write soft/hard handoff.
- Send victory claim to Sentinel.

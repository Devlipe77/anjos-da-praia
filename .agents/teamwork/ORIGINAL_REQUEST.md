# Original User Request

## Initial Request — 2026-09-29T01:27:35Z

# Teamwork Project Prompt

> Requested team: Full team

This project aims to refactor the monolithic `AdminPage.tsx` (~4000 lines) into smaller, manageable components within a dedicated `src/features/admin/` directory, and migrate its complex local state management to `zustand`.

Working directory: c:\Users\felip\Documents\anjos-da-praia
Integrity mode: development

## Requirements

### R1. Component Modularization
Extract the distinct sections of the Admin interface (e.g., Dashboard, Monitoramento, Pulseiras, Tendas, Operadores, Relatórios) from `AdminPage.tsx` into individual components located in the `src/features/admin/` folder. The `AdminPage.tsx` should become a lean composition layer.

### R2. Global State Migration
Introduce `zustand` to manage the complex admin state (active tabs, search filters, selected items, current operator details) currently handled by dozens of `useState` hooks inside `AdminPage.tsx`. Create a central store (e.g., `src/store/useAdminStore.ts`) and use it across the new components.

### R3. Functional Parity & Build Integrity
The refactoring must be strictly structural. No user-facing functionality, routing, or database interaction should be changed or broken. The TypeScript compiler must pass successfully after the refactor.

## Acceptance Criteria

### Verification
- [ ] `AdminPage.tsx` is significantly reduced in size (target is under 500 lines) and primarily acts as a layout/composition component.
- [ ] A new `zustand` store is created and correctly utilized by the separated components instead of passing state via deep prop drilling.
- [ ] Running `npx tsc --noEmit` returns no new TypeScript errors.
- [ ] Running `npm run build` completes successfully without crashing.

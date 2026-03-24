# Phase 0 Foundation & Game Shell Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 0 static app shell with routing, token-driven styling, deterministic state, local save plumbing, typed balance catalogs, and smoke tests.

**Architecture:** The app will use Vite + React + TypeScript for the shell, React Router for route-level structure, Zustand + Immer for deterministic settings and run state, and Zod-backed local persistence for a versioned browser-only save model. Tailwind and CSS tokens will drive the warm early-game visual language while the play route renders a responsive three-column shell backed by real store data.

**Tech Stack:** Vite, React, TypeScript, React Router, Zustand, Immer, Zod, Tailwind CSS, PostCSS, Vitest, Testing Library, ESLint, Prettier

---

## Chunk 1: App Scaffolding, Tokens, Routing, and Shell UI

### Task 1: Scaffold the toolchain and baseline app

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `postcss.config.js`
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Add the package manifest and core scripts**
  Include `dev`, `build`, `preview`, `lint`, `format`, and `test` scripts plus the core dependencies required by the Phase 0 architecture.

- [ ] **Step 2: Add TypeScript, Vite, lint, and test configuration**
  Configure the `@/` path alias in both TypeScript and Vite. Keep `vitest` on `jsdom`.

- [ ] **Step 3: Write a minimal failing smoke test for app bootstrap**
  Create a first render test that imports the app entry path and fails because route shells are not implemented yet.

- [ ] **Step 4: Run the test to verify the expected red state**
  Run: `npm run test -- --run`
  Expected: at least one failing test caused by missing route content or shell structure.

- [ ] **Step 5: Implement the minimal app bootstrap**
  Wire `main.tsx` and `App.tsx` so the application can mount with global styles and the router.

- [ ] **Step 6: Run the test suite to verify the green state**
  Run: `npm run test -- --run`
  Expected: the bootstrap smoke test passes.

- [ ] **Step 7: Verify the baseline toolchain**
  Run: `npm run dev`
  Expected: Vite dev server starts without boot errors.

- [ ] **Step 8: Verify the baseline toolchain**
  Run: `npm run lint`
  Run: `npm run test -- --run`
  Expected: both commands exit successfully.

### Task 2: Add Tailwind and token-driven global styling

**Files:**
- Create: `tailwind.config.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/globals.css`
- Modify: `src/main.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write a failing test for token-backed sample UI**
  Add a render assertion that expects a sample shell element to expose token-driven classes and text.

- [ ] **Step 2: Run the targeted test to verify it fails**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: fail because tokens and styled shell markup do not exist yet.

- [ ] **Step 3: Add Tailwind, PostCSS, CSS token files, and global styling**
  Encode the reviewed color, typography, spacing, radius, shadow, and motion tokens. Import global styles from the app entry.

- [ ] **Step 4: Add a sample token-backed surface in the app shell**
  Use token-based classes on a testable element so the stylesheet integration is exercised in rendering.

- [ ] **Step 5: Run the targeted test to verify it passes**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: pass with the token-backed element rendered.

### Task 3: Add routing and distinct route shells

**Files:**
- Create: `src/app/AppRouter.tsx`
- Create: `src/app/routes/LandingPage.tsx`
- Create: `src/app/routes/PlayPage.tsx`
- Create: `src/app/routes/SettingsPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing route smoke tests**
  Cover `/`, `/play`, and `/settings`, each with distinct visible labels or headings.

- [ ] **Step 2: Run the route tests to verify they fail**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: fail because routes are not registered yet.

- [ ] **Step 3: Implement the router and route shells**
  Keep the pages simple but distinct. `/play` must route to the foundational game shell surface.

- [ ] **Step 4: Run the route tests to verify they pass**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: pass for all three routes.

### Task 4: Build shared UI primitives and the top-level play shell

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/StatusRail.tsx`
- Create: `src/components/game/GameShell.tsx`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write a failing test for the play shell layout**
  Assert that the play route renders a status rail and labeled left, center, and right shell regions.

- [ ] **Step 2: Run the targeted play-shell test to verify it fails**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: fail because the shared shell components do not exist.

- [ ] **Step 3: Implement the shared primitives and responsive shell**
  Use the warm design tokens, accessible focus treatment, and a desktop three-column layout that collapses cleanly on narrow widths.

- [ ] **Step 4: Run the targeted play-shell test to verify it passes**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: pass with the shell regions and status rail present.

- [ ] **Step 5: Update the roadmap checkpoint**
  Mark `TASK-001` through `TASK-004` complete in `docs/product-roadmap.md` only after their verification commands pass.

## Chunk 2: Save Plumbing, Deterministic State, Catalogs, and Smoke Coverage

### Task 5: Implement the versioned save adapter and settings store

**Files:**
- Create: `src/lib/storage/saveSchema.ts`
- Create: `src/lib/storage/migrations.ts`
- Create: `src/lib/storage/saveAdapter.ts`
- Create: `src/features/settings/settingsStore.ts`
- Modify: `src/app/routes/SettingsPage.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing tests for fresh-save bootstrap and persistent settings**
  Cover fresh initialization, settings persistence, and corrupt-save fallback behavior.

- [ ] **Step 2: Run the storage tests to verify they fail**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: fail because storage modules and persistence hooks do not exist yet.

- [ ] **Step 3: Implement the `version: 1` Zod schema, migration helpers, save adapter, and settings store**
  Keep storage keys, defaults, and version handling centralized. Preserve settings during invalid save recovery when possible.

- [ ] **Step 4: Wire the settings page to persistent store values**
  Render the foundational toggles and UI scale control from live store state.

- [ ] **Step 5: Run the storage tests to verify they pass**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: pass for fresh bootstrap and settings persistence.

### Task 6: Add deterministic game store, tick engine, and selectors

**Files:**
- Create: `src/lib/simulation/gameStore.ts`
- Create: `src/lib/simulation/tickEngine.ts`
- Create: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/gameStore.test.ts`

- [ ] **Step 1: Write failing tests for tick advancement and selector output**
  Cover elapsed time advancement and at least one derived summary selector.

- [ ] **Step 2: Run the game-store tests to verify they fail**
  Run: `npm run test -- --run src/test/gameStore.test.ts`
  Expected: fail because the deterministic store and selectors are missing.

- [ ] **Step 3: Implement the bounded tick engine and run store**
  Centralize elapsed-time advancement in pure helpers and expose store actions that the UI can consume.

- [ ] **Step 4: Implement shell-facing selectors**
  Include derived values that support the status rail and play route smoke tests.

- [ ] **Step 5: Run the game-store tests to verify they pass**
  Run: `npm run test -- --run src/test/gameStore.test.ts`
  Expected: pass with predictable tick progression.

### Task 7: Seed typed static economy catalogs

**Files:**
- Create: `src/lib/economy/phases.ts`
- Create: `src/lib/economy/upgrades.ts`
- Create: `src/lib/economy/regions.ts`
- Create: `src/lib/economy/boats.ts`
- Create: `src/lib/economy/contracts.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Test: `src/test/gameStore.test.ts`

- [ ] **Step 1: Write a failing test for catalog lookup availability**
  Assert that starter catalog data loads and supports typed lookup access without runtime errors.

- [ ] **Step 2: Run the catalog test to verify it fails**
  Run: `npm run test -- --run src/test/gameStore.test.ts`
  Expected: fail because the catalog modules are not present yet.

- [ ] **Step 3: Implement the static typed catalogs and lookup helpers**
  Seed only the balance data needed by the foundational run and shell.

- [ ] **Step 4: Connect the starter run defaults to the catalog layer where appropriate**
  Avoid duplicating starter region labels or phase metadata across modules.

- [ ] **Step 5: Run the catalog test to verify it passes**
  Run: `npm run test -- --run src/test/gameStore.test.ts`
  Expected: pass with typed lookups available.

### Task 8: Add full Phase 0 smoke coverage and phase verification

**Files:**
- Modify: `src/test/renderApp.test.tsx`
- Modify: `src/test/gameStore.test.ts`
- Modify: `docs/product-roadmap.md`
- Test: `src/test/renderApp.test.tsx`
- Test: `src/test/gameStore.test.ts`

- [ ] **Step 1: Expand the smoke harness to cover routing, save bootstrap, and shell rendering**
  Keep the tests focused on Phase 0 guarantees rather than later gameplay.

- [ ] **Step 2: Add the single tick-progression regression test required by the roadmap**
  Assert one bounded tick updates run state and derived selectors together.

- [ ] **Step 3: Run the full test suite and linting**
  Run: `npm run lint`
  Run: `npm run test -- --run`
  Expected: all checks pass.

- [ ] **Step 4: Run the production build verification**
  Run: `npm run build`
  Expected: production bundle builds successfully.

- [ ] **Step 5: Update the roadmap checkpoint**
  Mark `TASK-005` through `TASK-008` complete in `docs/product-roadmap.md`, then update the phase status line and current phase if all Phase 0 tasks are complete.

- [ ] **Step 6: Commit the implementation**
  Create a descriptive commit covering the finished Phase 0 work and roadmap updates.

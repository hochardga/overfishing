# Phase 3 Polish And Public Prototype Launch Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Phase 2 MVP readable, accessible, instrumented, deployable, and ready for a public browser prototype release.

**Architecture:** Phase 3 keeps the current local-first React/Zustand game shell, but adds polish through selector-backed panel states, global settings/runtime hooks, optional analytics, launch-facing landing copy, and deployment/documentation work. Most changes stay in UI routes/components plus a small shared runtime layer for app preferences and analytics so the simulation logic remains deterministic.

**Tech Stack:** React, TypeScript, Zustand, Vite, Tailwind CSS, Vitest, Testing Library, ESLint, Vercel

---

## Chunk 1: Screen States And Runtime Preferences

### Task 1: Add loading, empty, and error states across the main shell

**Files:**
- Modify: `src/components/game/GameShell.tsx`
- Modify: `src/features/contracts/ContractBoard.tsx`
- Modify: `src/features/regions/RegionsPanel.tsx`
- Modify: `src/app/routes/PlayPage.tsx`
- Modify: `src/lib/simulation/selectors.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing shell-state tests**
  Cover the Play Shell loading state, recovery/error state for malformed saves, the contracts empty state before processing is online, and the regions empty/error states.

- [ ] **Step 2: Run the targeted shell-state test command to verify the red state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: fail because the current shell always renders populated panels and does not expose intentional loading/error/empty affordances.

- [ ] **Step 3: Add selector-backed panel state variants**
  Introduce explicit `loading`, `empty`, `populated`, and `error` presentation paths where the PRD requires them without changing the underlying simulation rules.

- [ ] **Step 4: Update the shell and panel components**
  Render a save-restore skeleton when the play route is initializing, a recovery prompt when save hydration fails, a contracts unlock empty state, and regions stale/error messaging that stays keyboard-readable.

- [ ] **Step 5: Run the targeted shell-state test command to verify the green state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: pass with intentional main-shell, contract-board, and regions-panel state coverage.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-025` complete in `docs/product-roadmap.md` only after the verification command passes.

### Task 2: Complete the settings page with reduced motion, UI scale, sound, and analytics consent

**Files:**
- Create: `src/features/settings/SettingsPanel.tsx`
- Modify: `src/app/routes/SettingsPage.tsx`
- Modify: `src/features/settings/settingsStore.ts`
- Modify: `src/main.tsx`
- Modify: `src/styles/globals.css`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing settings tests**
  Cover persisted reduced-motion, UI-scale, sound, and analytics-consent controls plus the runtime side effects on the document root.

- [ ] **Step 2: Run the targeted settings test command to verify the red state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: fail because settings persistence exists, but the page is not fully structured and the runtime does not globally apply reduced motion or UI scale.

- [ ] **Step 3: Extract a reusable `SettingsPanel` and strengthen the settings store**
  Centralize settings UI, expose initialization status/error handling, and keep persistence aligned with the save file.

- [ ] **Step 4: Apply runtime settings globally**
  Wire reduced motion and UI scale to document-level attributes/CSS variables so the rest of the app respects them without ad hoc per-component logic.

- [ ] **Step 5: Run the targeted settings test command to verify the green state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: pass with persisted toggles and live runtime updates.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-026` complete in `docs/product-roadmap.md` only after the verification command passes.

## Chunk 2: Analytics And Launch Surface

### Task 3: Add optional analytics hooks for session start, phase reach, renewal, and feedback clicks

**Files:**
- Create: `src/lib/analytics/analytics.ts`
- Create: `src/lib/analytics/events.ts`
- Create: `src/app/providers.tsx`
- Modify: `src/App.tsx`
- Modify: `src/app/routes/LandingPage.tsx`
- Modify: `src/app/routes/PlayPage.tsx`
- Modify: `src/app/routes/SettingsPage.tsx`
- Modify: `src/features/prestige/LicenseRenewalModal.tsx`
- Modify: `src/features/settings/settingsStore.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing analytics tests**
  Cover local-development no-op behavior, preview-mode logging behavior, and consent-gated event dispatch for session start, phase reach, renewal, and feedback clicks.

- [ ] **Step 2: Run the targeted analytics test command to verify the red state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: fail because no analytics runtime or provider exists yet.

- [ ] **Step 3: Implement the analytics event catalog and client**
  Create a tiny abstraction that safely no-ops when env vars are absent, logs in preview mode, and never fires analytics without consent.

- [ ] **Step 4: Wire analytics through a lightweight app provider**
  Mount analytics setup once, track session start/phase reach/renewal from route and state transitions, and add feedback-link tracking on launch-facing surfaces.

- [ ] **Step 5: Run the targeted analytics test command to verify the green state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: pass with disabled-by-default analytics and verified preview logging.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-027` complete in `docs/product-roadmap.md` only after the verification command passes.

### Task 4: Refine the landing page and launch-facing copy

**Files:**
- Create: `src/components/game/FeatureStrip.tsx`
- Create: `public/og-image.png`
- Modify: `index.html`
- Modify: `src/app/routes/LandingPage.tsx`
- Modify: `src/styles/globals.css`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing landing-page tests**
  Assert the one-line browser-play pitch, clearer CTA hierarchy, launch-aligned feature strip, and launch-feedback links/copy.

- [ ] **Step 2: Run the targeted landing-page test command to verify the red state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: fail because the current landing page is still placeholder copy without launch framing.

- [ ] **Step 3: Rebuild the landing page around the approved messaging**
  Use the product-vision tagline/headline/value props and GTM launch framing so the concept lands in one screenful.

- [ ] **Step 4: Add launch assets and metadata**
  Introduce the feature strip, wire Open Graph metadata, and place a placeholder/prototype `public/og-image.png` suitable for previews.

- [ ] **Step 5: Run the targeted landing-page test command to verify the green state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: pass with the revised launch-facing hero and feature strip.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-028` complete in `docs/product-roadmap.md` only after the verification command passes.

## Chunk 3: Accessibility, Responsive Behavior, And Deployment

### Task 5: Run an accessibility and responsive pass on the primary flow

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Card.tsx`
- Modify: `src/components/ui/StatusRail.tsx`
- Modify: `src/components/game/GameShell.tsx`
- Modify: `src/components/game/PhaseUnlockModal.tsx`
- Modify: `src/components/game/ProgressSummary.tsx`
- Modify: `src/components/game/RegionCard.tsx`
- Modify: `src/features/contracts/ContractBoard.tsx`
- Modify: `src/features/fleet/*.tsx`
- Modify: `src/features/gear/*.tsx`
- Modify: `src/features/prestige/LicenseRenewalModal.tsx`
- Modify: `src/features/processing/ProcessingPanel.tsx`
- Modify: `src/features/regions/RegionsPanel.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing accessibility/responsive tests**
  Add assertions for focusable primary controls, mobile-stacked shell behavior, and text-scaling-safe layout hooks where practical in jsdom.

- [ ] **Step 2: Run the targeted accessibility test command to verify the red state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: fail because the current shell does not fully encode the Phase 3 responsiveness and accessibility requirements.

- [ ] **Step 3: Tighten global CSS tokens and shared component affordances**
  Improve focus rings, hit targets, reduced-motion fallbacks, and the desktop-to-sub-960px shell collapse without flattening the existing visual language.

- [ ] **Step 4: Patch panel-level issues**
  Fix keyboard order and text scaling/layout problems in the primary gameplay flow, especially the status rail, modal surfaces, and dense operations cards.

- [ ] **Step 5: Run the targeted accessibility test command to verify the green state**
  Run: `npm test -- --run src/test/renderApp.test.tsx`
  Expected: pass with explicit accessibility/responsive coverage.

- [ ] **Step 6: Perform manual smoke checks at desktop, small-laptop, and mobile-landscape widths**
  Record any notable residual risk in `README.md` or roadmap notes if needed.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-029` complete in `docs/product-roadmap.md` only after automated verification and manual smoke checks are complete.

### Task 6: Configure deployment, preview environments, and production build verification

**Files:**
- Create: `vercel.json`
- Create: `.env.example`
- Create: `README.md`
- Modify: `package.json`
- Modify: `index.html`

- [ ] **Step 1: Write the failing deployment/documentation expectation checks**
  Define the required env vars, preview behavior, local run instructions, and build commands before editing config.

- [ ] **Step 2: Implement Vercel and env configuration**
  Add `vercel.json`, preview-friendly env docs, and any package scripts needed for predictable build/preview workflows.

- [ ] **Step 3: Document local development and deployment flow**
  Create `README.md` with install, run, test, preview, deploy, analytics, and recovery notes for the public prototype.

- [ ] **Step 4: Run production verification commands**
  Run: `npm run lint`
  Run: `npm run build`
  Expected: both commands pass and the production bundle is generated successfully.

- [ ] **Step 5: Update the roadmap checkpoint**
  Mark `TASK-030` complete in `docs/product-roadmap.md` only after the verification commands pass.

## Chunk 4: Balance, Regression, And Release Readiness

### Task 7: Perform a final balance and regression pass before public release

**Files:**
- Modify: `src/lib/economy/boats.ts`
- Modify: `src/lib/economy/contracts.ts`
- Modify: `src/lib/economy/phases.ts`
- Modify: `src/lib/economy/regions.ts`
- Modify: `src/lib/economy/upgrades.ts`
- Modify: `src/test/fullRunReducer.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Write the failing balance/regression tests**
  Extend the full-run coverage to assert the intended 75-90 minute target envelope through unlock thresholds, renewal readiness, and no-blocker completion flow.

- [ ] **Step 2: Run the targeted regression test command to verify the red state**
  Run: `npm test -- --run src/test/fullRunReducer.test.ts`
  Expected: fail because the current balance targets and/or release-readiness assertions are not encoded yet.

- [ ] **Step 3: Tune economy thresholds and capture known release issues**
  Adjust the late-game progression/balance values conservatively, preserving the role-shift arc while smoothing obvious blockers to License Renewal.

- [ ] **Step 4: Run the targeted regression test command to verify the green state**
  Run: `npm test -- --run src/test/fullRunReducer.test.ts`
  Expected: pass with full-run and release-readiness coverage.

- [ ] **Step 5: Run the full automated verification sweep**
  Run: `npm test -- --run`
  Run: `npm run lint`
  Run: `npm run build`
  Expected: all commands pass before final branch completion work.

- [ ] **Step 6: Perform a manual QA run to License Renewal and record known issues**
  Capture any remaining caveats in `README.md` so the public prototype launch has honest release notes.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-031` complete in `docs/product-roadmap.md` only after automated verification and the manual QA run are complete.

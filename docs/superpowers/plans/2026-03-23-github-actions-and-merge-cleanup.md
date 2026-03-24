# GitHub Actions and Merge Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single CI workflow to PR `#1`, verify it passes, squash-merge the PR, and clean up the branch/worktree state afterward.

**Architecture:** The repo will gain one GitHub Actions workflow under `.github/workflows/ci.yml` that mirrors the branch's proven local contract: install with npm, lint, test in CI mode, and build. After that workflow is pushed to the existing Phase 0 branch, the open PR will be watched until checks pass, then merged with a squash strategy and cleaned up locally and remotely.

**Tech Stack:** GitHub Actions, official GitHub checkout/setup-node actions, npm, gh CLI, git

---

## Chunk 1: CI Workflow and PR Completion

### Task 1: Add the CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Confirm the workflow file is absent**
  Run: `test -f .github/workflows/ci.yml`
  Expected: non-zero exit because the workflow does not exist yet.

- [ ] **Step 2: Create the workflow**
  Add a single workflow for `pull_request` and pushes to `main` that uses checkout, setup-node with npm cache, `npm ci`, `npm run lint`, `npm run test -- --run`, and `npm run build`.

- [ ] **Step 3: Verify the workflow file locally**
  Run: `npx prettier --check .github/workflows/ci.yml`
  Expected: pass with valid, formatted YAML.

### Task 2: Verify, publish, merge, and clean up

**Files:**
- Modify: `.git` state
- Modify: GitHub PR `#1`

- [ ] **Step 1: Run the local verification contract**
  Run: `npm run lint`
  Run: `npm run test -- --run`
  Run: `npm run build`
  Expected: all commands pass on the branch with the workflow file included.

- [ ] **Step 2: Commit and push the workflow update**
  Use a focused commit message for the CI addition, then push to `origin/phase-0/foundation-and-game-shell`.

- [ ] **Step 3: Wait for PR checks**
  Run the GitHub CLI check/watch command against PR `#1`.
  Expected: all required checks succeed.

- [ ] **Step 4: Squash-merge PR `#1`**
  Merge into `main` with squash strategy and remote branch deletion.

- [ ] **Step 5: Clean up local state**
  Fast-forward the original workspace to `main` and remove the local worktree for `phase-0/foundation-and-game-shell`.

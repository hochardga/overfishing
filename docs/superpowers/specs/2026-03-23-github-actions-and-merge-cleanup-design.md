# GitHub Actions and Merge Cleanup Design

**Date:** 2026-03-23
**Branch:** `phase-0/foundation-and-game-shell`
**PR:** `#1`

## Goal

Add a small, appropriate CI workflow for the new browser app, update the open Phase 0 PR so it runs those checks, merge the PR once the checks are green, and leave the local repo clean afterward.

## Scope

This task covers:

- adding a GitHub Actions workflow for pull requests and pushes to `main`
- running the same verification contract already proven locally: lint, test, and build
- pushing the workflow change to the existing Phase 0 branch and waiting for PR checks
- merging PR `#1` with a squash merge
- cleaning up the remote branch, local worktree, and local `main` checkout state

Out of scope:

- branch protection rules
- release automation
- deploy workflows
- matrix builds across multiple Node versions

## Design Decisions

### CI Shape

Use one workflow file at `.github/workflows/ci.yml`. The repo is still early and has only one meaningful verification path, so split workflows would add noise without increasing clarity.

The workflow should:

- trigger on `pull_request` against `main`
- trigger on pushes to `main`
- use GitHub's official checkout and Node setup actions
- install dependencies with `npm ci`
- run `npm run lint`
- run `npm run test -- --run`
- run `npm run build`

### Node Runtime

Use Node `24` in CI to match the local verified environment for this branch. The workflow can use npm caching through the setup action to keep repeated runs fast.

### Merge Strategy

Use a squash merge for PR `#1`. The feature branch currently contains planning history plus implementation history, and Phase 0 should land on `main` as one clear, phase-level commit.

### Cleanup

After merge:

- delete the remote feature branch as part of the merge
- remove the local worktree for `phase-0/foundation-and-game-shell`
- fast-forward the original workspace on `main`

This leaves the repo ready for Phase 1 without stale branch state.

## Verification Strategy

Local verification before merge:

- `npm run lint`
- `npm run test -- --run`
- `npm run build`

Workflow verification after push:

- wait for PR `#1` checks to complete successfully

Post-merge verification:

- confirm the PR merged cleanly
- confirm the feature branch is deleted remotely
- confirm the worktree is removed locally
- confirm the original workspace is back on up-to-date `main`

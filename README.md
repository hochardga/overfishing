# Definitely Not Overfishing

Definitely Not Overfishing is a browser incremental where cozy fishing turns into industrial extraction. The prototype is built to land a complete first-session arc in the browser, then make the role shift from fisher to operator legible before public launch.

## Stack

- React 19 + TypeScript + Vite
- Zustand + Immer for deterministic game state
- Tailwind CSS for the token-driven UI system
- Vitest + Testing Library + Playwright for verification
- Vercel static hosting with preview deployments

## Local Development

### Requirements

- Node.js 20 or newer
- npm 10 or newer

### Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:5173/` for development.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run lint` runs ESLint across the repo.
- `npm run test:ci` runs the Vitest suite once.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview:host` serves the built app on `http://127.0.0.1:4173/`.
- `npm run verify` runs the release check: lint, tests, and production build.

## Environment Variables

Copy `.env.example` to `.env.local` for local overrides.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_ANALYTICS_ENDPOINT` | No | POST endpoint for optional launch analytics. Leave blank to disable. |
| `VITE_ANALYTICS_WRITE_KEY` | No | Public client write key/header for the analytics endpoint. Do not treat this as a secret. |
| `VITE_ANALYTICS_PREVIEW` | No | When `true`, opted-in analytics events are logged to the console instead of being sent. Useful in preview and QA environments. |

## Deployment

This prototype is configured for static deployment on Vercel.

- `vercel.json` sets the build command to `npm run build`, serves `dist/`, applies SPA rewrites, and adds baseline security headers.
- Branch and pull request deployments should use Vercel Preview so each Phase 3 polish change can be reviewed in-browser before merge.
- Production should promote from `main` only after `npm run verify` passes and the preview deployment is smoke-tested.
- Add the optional analytics variables separately in Vercel's Preview and Production environments only if launch tracking is enabled.

### Preview and production checklist

1. Run `npm run verify`.
2. Run `npm run preview:host`.
3. Open `/`, `/play`, and `/settings` in the preview build and refresh each route once.
4. Confirm save recovery, first-run onboarding, analytics consent, and feedback links behave as expected.

## Launch Metrics To Watch

The launch plan focuses on reach to the role-shift and prototype completion, not revenue.

- `70%` of players should complete at least five manual casts.
- `45%` should purchase at least one upgrade.
- `35%` should reach Fleet Ops.
- `15%` should reach License Renewal during the public prototype phase.
- Feedback quality matters as much as raw traffic: track written responses, meaningful comments, and share language.

## Balance Targets

Current release-candidate pacing is tuned around a contained first run:

- Fleet Ops should arrive inside the `25-45 minute` window for engaged players.
- Regional Extraction should open late enough to matter, at `950` lifetime fish and `$5,800` lifetime revenue.
- License Renewal should remain a closing beat instead of an immediate unlock, requiring `1,120` lifetime fish, `$6,800` lifetime revenue, and ocean health at `70` or lower.

## Known Issues

- The first-session timing target is covered by deterministic regression tests and seeded browser QA, but it still needs soft-launch telemetry to confirm real player session length lands inside the intended `75-90 minute` arc.
- Automated fleet routes still require manual refuel and repair attention. If testers stall after Fleet Ops, fuel friction should be reduced before adding more content.
- Analytics is disabled by default and preview mode only logs locally. A real ingest endpoint still needs environment configuration per Vercel environment before launch tracking is live.

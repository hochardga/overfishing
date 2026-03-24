import { Link } from "react-router-dom";

import { SettingsPanel } from "@/features/settings/SettingsPanel";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-text">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-secondary shadow-soft">
          Player preferences
        </div>
        <h1 className="font-heading text-4xl text-text">Session settings</h1>
        <p className="text-lg text-text-muted">
          Presentation and consent preferences persist immediately so the first
          prototype already behaves like a save-backed product shell.
        </p>
        <SettingsPanel />
        <a
          className="w-fit text-sm font-medium text-secondary underline-offset-4 hover:underline"
          data-analytics-feedback="settings-feedback"
          href="mailto:hello@definitelynotoverfishing.com?subject=Definitely%20Not%20Overfishing%20feedback"
        >
          Send build feedback
        </a>
        <Link
          className="w-fit rounded-full bg-surface-raised px-5 py-3 font-medium text-text shadow-soft"
          to="/"
        >
          Back to landing
        </Link>
      </div>
    </main>
  );
}

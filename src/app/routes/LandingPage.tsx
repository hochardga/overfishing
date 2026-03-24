import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-text">
      <div className="mx-auto flex max-w-shell flex-col gap-6">
        <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-secondary shadow-soft">
          First session prototype
        </div>
        <h1 className="max-w-3xl font-heading text-4xl text-text">
          Coastal pressure, one cast at a time
        </h1>
        <h2 className="max-w-3xl font-heading text-2xl text-text">
          Definitely Not Overfishing
        </h2>
        <div
          data-testid="token-sample"
          className="max-w-3xl rounded-2xl bg-surface p-6 text-text shadow-soft"
        >
          <p className="text-lg text-text">
            A warm, token-backed shell is in place for the first playable build.
          </p>
          <p className="mt-3 font-mono text-sm text-text-muted">
            The interface starts soft and readable before the operational layers
            tighten.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-5 py-3 font-medium text-surface-raised transition-colors duration-150 ease-settled hover:bg-primary-hover"
            to="/play"
          >
            Play in browser
          </Link>
          <Link
            className="rounded-full bg-surface-raised px-5 py-3 font-medium text-text shadow-soft transition-colors duration-150 ease-settled hover:bg-surface"
            to="/settings"
          >
            Open settings
          </Link>
        </div>
      </div>
    </main>
  );
}

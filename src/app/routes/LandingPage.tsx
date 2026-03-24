import { Link } from "react-router-dom";

import { FeatureStrip } from "@/components/game/FeatureStrip";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-text">
      <div className="mx-auto flex max-w-shell flex-col gap-8">
        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5 rounded-[32px] bg-surface px-6 py-7 shadow-soft">
            <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-secondary shadow-soft">
              Browser incremental prototype
            </div>
            <h2 className="font-heading text-2xl text-text">
              Definitely Not Overfishing
            </h2>
            <p className="font-mono text-sm uppercase tracking-[0.22em] text-secondary">
              Catch fish. Build fleets. Normalize collapse.
            </p>
            <h1 className="max-w-4xl font-heading text-4xl text-text sm:text-5xl">
              A browser incremental that turns cozy fishing into industrial
              extraction.
            </h1>
            <p className="max-w-3xl text-lg text-text-muted">
              Definitely Not Overfishing starts with a warm dockside loop, then
              keeps changing your job until routing, throughput, depletion, and
              renewal pressure are all part of the same run.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-primary px-5 py-3 font-medium text-surface-raised transition-colors duration-150 ease-settled hover:bg-primary-hover"
                to="/play"
              >
                Play in browser
              </Link>
              <a
                className="rounded-full bg-surface-raised px-5 py-3 font-medium text-text shadow-soft transition-colors duration-150 ease-settled hover:bg-background"
                data-analytics-feedback="landing-feedback"
                href="mailto:hello@definitelynotoverfishing.com?subject=Definitely%20Not%20Overfishing%20feedback"
              >
                Share prototype feedback
              </a>
              <Link
                className="rounded-full border border-border px-5 py-3 font-medium text-text transition-colors duration-150 ease-settled hover:bg-surface-raised"
                to="/settings"
              >
                Open settings
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] bg-industrial px-6 py-7 text-surface-raised shadow-soft">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent">
                  Why it lands
                </p>
                <h2 className="mt-3 font-heading text-3xl">
                  The smartest move keeps getting worse for the water.
                </h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-surface-raised/10 px-4 py-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                    Minute 3
                  </p>
                  <p className="mt-2 text-sm text-surface-raised/80">
                    Cast, sell, and buy the first improvements while Pier Cove
                    still feels calm.
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-raised/10 px-4 py-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                    Minute 70
                  </p>
                  <p className="mt-2 text-sm text-surface-raised/80">
                    Route boats, clear bottlenecks, and watch value rise as the
                    ecosystem starts to fold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeatureStrip />

        <div className="max-w-3xl text-sm text-text-muted">
          Playable in the browser, tuned for a contained first run, and built to
          make the role shift legible before the launch push gets broader.
        </div>
      </div>
    </main>
  );
}

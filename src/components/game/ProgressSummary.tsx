import type { ProgressSummaryState } from "@/lib/simulation/selectors";

import { Card } from "@/components/ui/Card";

type ProgressSummaryProps = {
  summary: ProgressSummaryState;
};

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  return (
    <Card
      className="space-y-4"
      data-testid="progress-summary"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Pace check
        </p>
        <h2 className="font-heading text-2xl text-text">{summary.title}</h2>
        <p className="text-sm text-text-muted">
          Current phase: {summary.phaseLabel}
        </p>
      </div>
      <div className="space-y-2 rounded-2xl bg-surface-raised px-4 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-secondary">
          {summary.focusLabel}
        </p>
        <p className="text-sm text-text-muted">{summary.focusText}</p>
      </div>
      <div className="space-y-2 rounded-2xl bg-surface-raised px-4 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-secondary">
          {summary.nextLabel}
        </p>
        <p className="text-sm text-text-muted">{summary.nextText}</p>
      </div>
    </Card>
  );
}

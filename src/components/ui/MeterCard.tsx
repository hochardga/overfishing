import type { HTMLAttributes } from "react";

import { clsx } from "clsx";

import { Card } from "@/components/ui/Card";

type MeterCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  detail: string;
  progress?: number;
  progressTestId?: string;
};

export function MeterCard({
  label,
  value,
  detail,
  progress,
  progressTestId,
  className,
  ...props
}: MeterCardProps) {
  const clampedProgress =
    progress === undefined ? undefined : Math.max(0, Math.min(1, progress));

  return (
    <Card
      className={clsx("space-y-3", className)}
      {...props}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          {label}
        </p>
        <p className="font-heading text-2xl text-text">{value}</p>
      </div>
      <p className="text-sm text-text-muted">{detail}</p>
      {clampedProgress !== undefined ? (
        <div className="h-2 rounded-full bg-surface/70">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-settled"
            data-testid={progressTestId}
            style={{ width: `${clampedProgress * 100}%` }}
          />
        </div>
      ) : null}
    </Card>
  );
}

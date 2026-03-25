import type { HTMLAttributes } from "react";

import { clsx } from "clsx";

import { Card } from "@/components/ui/Card";

type MeterCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  detail: string;
  density?: "compact" | "full";
  progress?: number;
  progressTestId?: string;
};

export function MeterCard({
  label,
  value,
  detail,
  density = "full",
  progress,
  progressTestId,
  className,
  ...props
}: MeterCardProps) {
  const clampedProgress =
    progress === undefined ? undefined : Math.max(0, Math.min(1, progress));

  return (
    <Card
      className={clsx(
        density === "compact" ? "space-y-2.5 p-4" : "space-y-3",
        className,
      )}
      {...props}
    >
      <div className={density === "compact" ? "space-y-1.5" : "space-y-2"}>
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          {label}
        </p>
        <p
          className={clsx(
            "font-heading text-text",
            density === "compact" ? "text-[1.75rem]" : "text-2xl",
          )}
        >
          {value}
        </p>
      </div>
      <p className={density === "compact" ? "text-[0.8125rem] text-text-muted" : "text-sm text-text-muted"}>
        {detail}
      </p>
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

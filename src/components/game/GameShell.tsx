import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusRail } from "@/components/ui/StatusRail";

type GameShellProps = {
  tone?: "cozy" | "operational" | "industrial";
  screenState?: "ready" | "loading" | "error";
  layoutMode?: "full" | "compact";
  showStatusRail?: boolean;
  statusItems: {
    label: string;
    value: string;
    detail?: string;
  }[];
  overlay?: ReactNode;
  errorBody?: string;
  errorTitle?: string;
  errorActionLabel?: string;
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn: ReactNode;
  onErrorAction?: () => void;
};

export function GameShell({
  tone = "cozy",
  screenState = "ready",
  layoutMode = "full",
  showStatusRail = true,
  statusItems,
  overlay,
  errorBody,
  errorTitle = "Save recovery",
  errorActionLabel = "Start fresh run",
  leftColumn,
  centerColumn,
  rightColumn,
  onErrorAction,
}: GameShellProps) {
  const isCompact = layoutMode === "compact";

  if (screenState === "loading") {
    return (
      <main className="min-h-screen bg-background px-6 py-8 text-text">
        <div className="mx-auto flex max-w-shell flex-col gap-6">
          <section
            className="rounded-[28px] bg-industrial px-5 py-5 text-surface-raised shadow-soft"
            data-testid="game-shell-loading"
          >
            <p className="text-sm text-surface-raised/80">
              Restoring the harbor log and recent panel state.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="h-20 rounded-2xl bg-surface-raised/10"
                  key={index}
                />
              ))}
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.35fr_1fr]">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="h-64 rounded-2xl bg-surface-raised/10"
                  key={index}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (screenState === "error") {
    return (
      <main className="min-h-screen bg-background px-6 py-8 text-text">
        <div className="mx-auto flex max-w-shell flex-col gap-6">
          <StatusRail
            items={statusItems}
            tone={tone}
          />
          <section data-testid="game-shell-recovery">
            <Card className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.16em] text-error">
                  Recovery
                </p>
                <h1 className="font-heading text-3xl text-text">{errorTitle}</h1>
                <p className="text-sm text-text-muted">{errorBody}</p>
              </div>
              <Button onClick={onErrorAction}>{errorActionLabel}</Button>
            </Card>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 sm:py-8">
      <div className={`mx-auto flex max-w-shell flex-col ${tone === "cozy" ? "gap-6" : "gap-5"}`}>
        {showStatusRail ? (
          <StatusRail
            items={statusItems}
            tone={tone}
          />
        ) : null}
        {overlay}
        <section
          className={
            isCompact
              ? "flex flex-col"
              : `grid ${tone === "cozy" ? "gap-4" : "gap-3"} min-[960px]:grid-cols-[1.05fr_1.35fr_1fr]`
          }
          data-testid="game-shell-grid"
        >
          {isCompact ? null : (
            <div
              aria-label="primary column"
              className="flex min-w-0 flex-col gap-4"
            >
              {leftColumn}
            </div>
          )}
          {isCompact ? (
            <div
              className="mx-auto w-full max-w-[56rem]"
              data-testid="game-shell-compact-lane"
            >
              <div
                aria-label="active panel column"
                className="flex min-w-0 flex-col gap-4 sm:gap-3"
              >
                {centerColumn}
              </div>
            </div>
          ) : (
            <div
              aria-label="active panel column"
              className="flex min-w-0 flex-col gap-4"
            >
              {centerColumn}
            </div>
          )}
          {isCompact ? null : (
            <div
              aria-label="operations column"
              className="flex min-w-0 flex-col gap-4"
            >
              {rightColumn}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

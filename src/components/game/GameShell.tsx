import type { ReactNode } from "react";

import { StatusRail } from "@/components/ui/StatusRail";

type GameShellProps = {
  tone?: "cozy" | "operational" | "industrial";
  statusItems: {
    label: string;
    value: string;
    detail?: string;
  }[];
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn: ReactNode;
};

export function GameShell({
  tone = "cozy",
  statusItems,
  leftColumn,
  centerColumn,
  rightColumn,
}: GameShellProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-8 text-text">
      <div className={`mx-auto flex max-w-shell flex-col ${tone === "cozy" ? "gap-6" : "gap-5"}`}>
        <StatusRail
          items={statusItems}
          tone={tone}
        />
        <section className={`grid ${tone === "cozy" ? "gap-4" : "gap-3"} xl:grid-cols-[1.05fr_1.35fr_1fr]`}>
          <div
            aria-label="primary column"
            className="flex flex-col gap-4"
          >
            {leftColumn}
          </div>
          <div
            aria-label="active panel column"
            className="flex flex-col gap-4"
          >
            {centerColumn}
          </div>
          <div
            aria-label="operations column"
            className="flex flex-col gap-4"
          >
            {rightColumn}
          </div>
        </section>
      </div>
    </main>
  );
}

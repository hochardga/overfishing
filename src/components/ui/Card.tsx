import type { HTMLAttributes } from "react";

import { clsx } from "clsx";

type CardTone = "warm" | "industrial";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const toneClasses: Record<CardTone, string> = {
  warm: "bg-surface text-text shadow-soft",
  industrial: "bg-industrial text-surface-raised",
};

export function Card({
  children,
  className,
  tone = "warm",
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "min-w-0 rounded-2xl p-5",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

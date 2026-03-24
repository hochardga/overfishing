import { clsx } from "clsx";

type AlertBannerProps = {
  title: string;
  body: string;
  tone: "warning" | "error";
};

const toneClasses = {
  warning: "bg-warning/20 text-text",
  error: "bg-error/20 text-text",
} as const;

export function AlertBanner({
  title,
  body,
  tone,
}: AlertBannerProps) {
  return (
    <div
      className={clsx("rounded-2xl px-4 py-3", toneClasses[tone])}
      role="alert"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-secondary">
        {title}
      </p>
      <p className="mt-1 text-sm text-text-muted">{body}</p>
    </div>
  );
}

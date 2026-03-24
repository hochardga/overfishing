type StatusRailItem = {
  label: string;
  value: string;
  detail?: string;
};

type StatusRailProps = {
  items: StatusRailItem[];
  tone?: "cozy" | "operational" | "industrial";
};

export function StatusRail({
  items,
  tone = "cozy",
}: StatusRailProps) {
  return (
    <section
      className={`max-[959px]:sticky max-[959px]:top-3 max-[959px]:z-20 rounded-[28px] px-4 py-4 text-surface-raised shadow-soft sm:px-5 ${
        tone === "cozy" ? "bg-industrial" : "bg-industrial/95"
      }`}
      data-testid="status-rail"
    >
      <div
        className="grid grid-cols-2 gap-3 min-[720px]:grid-cols-4"
        data-testid="status-rail-grid"
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-2xl bg-surface-raised/10 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-accent">
              {item.label}
            </p>
            <p className="mt-2 font-heading text-2xl">{item.value}</p>
            {item.detail ? (
              <p className="mt-1 font-mono text-xs text-surface-raised/70">
                {item.detail}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

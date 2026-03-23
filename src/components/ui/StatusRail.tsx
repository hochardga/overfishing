type StatusRailItem = {
  label: string;
  value: string;
  detail?: string;
};

type StatusRailProps = {
  items: StatusRailItem[];
};

export function StatusRail({ items }: StatusRailProps) {
  return (
    <section
      className="rounded-[28px] bg-industrial px-5 py-4 text-surface-raised shadow-soft"
      data-testid="status-rail"
    >
      <div className="grid gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-surface-raised/10 px-4 py-3"
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

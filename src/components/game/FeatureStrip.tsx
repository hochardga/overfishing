import { Card } from "@/components/ui/Card";

const featureItems = [
  {
    eyebrow: "Complete arc",
    title: "A real first-session ending",
    body: "The prototype is built to land a full role-shift run, not an endless vague grind.",
  },
  {
    eyebrow: "Role shift",
    title: "Your job keeps changing",
    body: "Manual fishing becomes routing, then throughput, then regional pressure and renewal math.",
  },
  {
    eyebrow: "Systemic satire",
    title: "The joke lives in the systems",
    body: "Efficiency keeps feeling smart even when the ocean and trust meters tell a darker story.",
  },
];

export function FeatureStrip() {
  return (
    <section
      className="grid gap-4 lg:grid-cols-3"
      data-testid="feature-strip"
    >
      {featureItems.map((item, index) => (
        <Card
          className={index === 2 ? "bg-industrial text-surface-raised" : ""}
          key={item.title}
          tone={index === 2 ? "industrial" : "warm"}
        >
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-accent">
              {item.eyebrow}
            </p>
            <h2 className="font-heading text-2xl">{item.title}</h2>
            <p className={index === 2 ? "text-sm text-surface-raised/75" : "text-sm text-text-muted"}>
              {item.body}
            </p>
          </div>
        </Card>
      ))}
    </section>
  );
}

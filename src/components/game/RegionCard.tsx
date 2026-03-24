import { Card } from "@/components/ui/Card";
import type { RegionSummaryState } from "@/lib/simulation/selectors";

type RegionCardProps = {
  item: RegionSummaryState;
};

export function RegionCard({ item }: RegionCardProps) {
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl text-text">{item.label}</h3>
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            {item.travelText}
          </p>
        </div>
        <p className="text-sm text-text-muted">{item.stockText}</p>
        <p className="text-sm text-text-muted">{item.scarcityText}</p>
        <p className="text-sm text-text-muted">{item.consequenceText}</p>
      </div>
    </Card>
  );
}

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LicenseRenewalState } from "@/lib/simulation/selectors";
import { useGameStore } from "@/lib/simulation/gameStore";

type LicenseRenewalModalProps = {
  renewal: LicenseRenewalState;
  onCancel: () => void;
};

export function LicenseRenewalModal({
  renewal,
  onCancel,
}: LicenseRenewalModalProps) {
  const renewLicense = useGameStore((state) => state.renewLicense);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-industrial/50 px-6"
      data-testid="license-renewal-modal"
    >
      <Card className="w-full max-w-2xl space-y-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">
            Renewal
          </p>
          <h2 className="font-heading text-3xl text-text">{renewal.title}</h2>
          <p className="text-sm text-text-muted">{renewal.body}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {renewal.summaryRows.map((row) => (
            <div
              className="rounded-2xl bg-surface-raised px-4 py-3"
              key={row.label}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-secondary">
                {row.label}
              </p>
              <p className="mt-2 font-heading text-xl text-text">{row.value}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-text-muted">{renewal.carryoverText}</p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => renewLicense()}>{renewal.confirmLabel}</Button>
          <Button
            onClick={onCancel}
            variant="ghost"
          >
            {renewal.cancelLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

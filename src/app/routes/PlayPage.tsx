import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { EarlyHud } from "@/components/game/EarlyHud";
import { GameShell } from "@/components/game/GameShell";
import { PhaseUnlockModal } from "@/components/game/PhaseUnlockModal";
import { ProgressSummary } from "@/components/game/ProgressSummary";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Card } from "@/components/ui/Card";
import { FleetPanel } from "@/features/fleet/FleetPanel";
import { MaintenancePanel } from "@/features/fleet/MaintenancePanel";
import { SkiffPanel } from "@/features/fleet/SkiffPanel";
import { CastButton } from "@/features/fishing/CastButton";
import { GearPanel } from "@/features/gear/GearPanel";
import { ContractBoard } from "@/features/contracts/ContractBoard";
import { ProcessingPanel } from "@/features/processing/ProcessingPanel";
import { RegionsPanel } from "@/features/regions/RegionsPanel";
import { LicenseRenewalModal } from "@/features/prestige/LicenseRenewalModal";
import { UpgradeShop } from "@/features/upgrades/UpgradeShop";
import { useGameStore } from "@/lib/simulation/gameStore";
import {
  selectActivePhaseUnlockModalState,
  selectAlertBannerState,
  selectLicenseRenewalState,
  selectProgressSummaryState,
  selectStatusRailItems,
} from "@/lib/simulation/selectors";

export default function PlayPage() {
  const initialize = useGameStore((state) => state.initialize);
  const stopSimulationLoop = useGameStore((state) => state.stopSimulationLoop);
  const run = useGameStore((state) => state.run);
  const activePhaseUnlock = selectActivePhaseUnlockModalState(run);
  const alertBanner = selectAlertBannerState(run);
  const licenseRenewal = selectLicenseRenewalState(run);
  const progressSummary = selectProgressSummaryState(run);
  const isFleetOps = run.unlocks.phasesSeen.includes("fleetOps");
  const hasProcessing = run.unlocks.phasesSeen.includes("processingContracts");
  const hasRegions = run.unlocks.phasesSeen.includes("regionalExtraction");
  const [dismissedRenewalAtRevenue, setDismissedRenewalAtRevenue] = useState<
    number | null
  >(null);
  const showRenewalModal =
    licenseRenewal !== null &&
    dismissedRenewalAtRevenue !== run.lifetimeRevenue;

  useEffect(() => {
    initialize();
    return () => {
      stopSimulationLoop();
    };
  }, [initialize, stopSimulationLoop]);
  return (
    <>
      <GameShell
        tone={run.uiTone}
        leftColumn={
          <>
            {alertBanner ? (
              <AlertBanner
                body={alertBanner.body}
                title={alertBanner.title}
                tone={alertBanner.tone}
              />
            ) : null}
            <Card className="space-y-3">
              <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-secondary">
                {isFleetOps ? "Operational shift" : "First cast"}
              </div>
              <h1 className="font-heading text-4xl text-text">
                {isFleetOps ? "Fleet operations" : "Harbor operations"}
              </h1>
              <p className="text-lg text-text-muted">
                {isFleetOps
                  ? "Routes, crews, and maintenance now set the pace. The dock still matters, but the real job is deciding what keeps moving."
                  : "The early dock loop is live. Cast normally for a steady payout or aim for a perfect pull when you want the bigger reward."}
              </p>
            </Card>
            <Card className="space-y-3">
              <h2 className="font-heading text-2xl">Why it matters</h2>
              <p className="text-sm text-text-muted">
                {isFleetOps
                  ? "Manual skill still plugs shortfalls, but throughput, upkeep, and route pressure now decide how the harbor scales."
                  : "The game should teach money, stock, and timing without hiding the reward. The next systems build on that same loop."}
              </p>
            </Card>
            <Card className="space-y-3">
              <h2 className="font-heading text-2xl">Quick exit</h2>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-surface-raised px-5 py-3 text-sm font-semibold text-text shadow-soft"
                to="/"
              >
                Back to landing
              </Link>
            </Card>
          </>
        }
        centerColumn={
          <>
            <ProgressSummary summary={progressSummary} />
            {!isFleetOps ? <EarlyHud run={run} /> : null}
            <CastButton />
            {isFleetOps ? <FleetPanel run={run} /> : null}
            {isFleetOps ? <MaintenancePanel run={run} /> : null}
            {!isFleetOps && run.unlocks.phasesSeen.includes("skiffOperator") ? (
              <SkiffPanel run={run} />
            ) : null}
            {run.unlocks.phasesSeen.includes("docksideGear") ? (
              <GearPanel run={run} />
            ) : null}
            {hasProcessing ? <ProcessingPanel run={run} /> : null}
            {hasRegions ? <RegionsPanel run={run} /> : null}
          </>
        }
        rightColumn={
          <>
            <Card
              className="space-y-3"
              tone="industrial"
            >
              <h2 className="font-heading text-2xl">
                {isFleetOps ? "Operations notes" : "Dock notes"}
              </h2>
              <p className="text-sm text-surface-raised/75">
                {isFleetOps
                  ? "Crewed routes carry most of the load now, but dockside casts still bridge revenue gaps while you keep fuel, repairs, and route choices under control."
                  : "Manual casts resolve directly into cash for now, so the reward lands immediately and the dock stays easy to read."}
              </p>
            </Card>
            <UpgradeShop run={run} />
            {hasProcessing ? <ContractBoard run={run} /> : null}
            <Card className="space-y-3">
              <h2 className="font-heading text-2xl">Reading the rail</h2>
              <p className="text-sm text-text-muted">
                Cash lands immediately, nearby stock shows how many fish are left
                in Pier Cove, cooldown tells you when the line settles, and
                stock pressure explains why the pull gets slower or richer as the
                cove thins out.
              </p>
            </Card>
          </>
        }
        statusItems={selectStatusRailItems(run)}
      />
      {activePhaseUnlock ? <PhaseUnlockModal modal={activePhaseUnlock} /> : null}
      {showRenewalModal && licenseRenewal ? (
        <LicenseRenewalModal
          onCancel={() => setDismissedRenewalAtRevenue(run.lifetimeRevenue)}
          renewal={licenseRenewal}
        />
      ) : null}
    </>
  );
}

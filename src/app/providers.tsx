import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { useLocation } from "react-router-dom";

import {
  analyticsClient,
  type AnalyticsClient,
} from "@/lib/analytics/analytics";
import {
  createFeedbackClickEvent,
  createLicenseRenewedEvent,
  createPhaseReachEvent,
  createSessionStartEvent,
} from "@/lib/analytics/events";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { useGameStore } from "@/lib/simulation/gameStore";

type AppProvidersProps = {
  children: ReactNode;
  client?: AnalyticsClient;
};

export function AppProviders({
  children,
  client = analyticsClient,
}: AppProvidersProps) {
  const location = useLocation();
  const analyticsConsent = useSettingsStore((state) => state.analyticsConsent);
  const run = useGameStore((state) => state.run);
  const sessionStartedRef = useRef(false);
  const trackedPhasesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!analyticsConsent || location.pathname !== "/play" || sessionStartedRef.current) {
      return;
    }

    sessionStartedRef.current = true;
    void client.track(createSessionStartEvent(location.pathname));
  }, [analyticsConsent, client, location.pathname]);

  useEffect(() => {
    if (!analyticsConsent || location.pathname !== "/play") {
      return;
    }

    for (const phaseId of run.unlocks.phasesSeen) {
      if (trackedPhasesRef.current.has(phaseId)) {
        continue;
      }

      trackedPhasesRef.current.add(phaseId);
      void client.track(createPhaseReachEvent(phaseId));
    }
  }, [analyticsConsent, client, location.pathname, run.unlocks.phasesSeen]);

  useEffect(() => {
    if (!analyticsConsent) {
      return;
    }

    const handleLicenseRenewed = () => {
      void client.track(createLicenseRenewedEvent());
    };
    const handleFeedbackClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        "[data-analytics-feedback]",
      );

      if (!target) {
        return;
      }

      void client.track(
        createFeedbackClickEvent(
          target.dataset.analyticsFeedback ?? "feedback-link",
          target.href,
        ),
      );
    };

    globalThis.addEventListener("overfishing:license-renewed", handleLicenseRenewed);
    document.addEventListener("click", handleFeedbackClick);

    return () => {
      globalThis.removeEventListener(
        "overfishing:license-renewed",
        handleLicenseRenewed,
      );
      document.removeEventListener("click", handleFeedbackClick);
    };
  }, [analyticsConsent, client]);

  return <>{children}</>;
}

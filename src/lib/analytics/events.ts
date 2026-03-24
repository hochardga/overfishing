import type { AnalyticsEvent } from "@/lib/analytics/analytics";
import type { PhaseId } from "@/lib/storage/saveSchema";

export function createSessionStartEvent(pathname: string): AnalyticsEvent {
  return {
    name: "session_start",
    payload: {
      pathname,
    },
  };
}

export function createPhaseReachEvent(phaseId: PhaseId): AnalyticsEvent {
  return {
    name: "phase_reached",
    payload: {
      phaseId,
    },
  };
}

export function createLicenseRenewedEvent(): AnalyticsEvent {
  return {
    name: "license_renewed",
    payload: {
      source: "prototype",
    },
  };
}

export function createFeedbackClickEvent(
  source: string,
  href: string,
): AnalyticsEvent {
  return {
    name: "feedback_click",
    payload: {
      href,
      source,
    },
  };
}

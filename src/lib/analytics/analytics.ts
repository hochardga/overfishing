export type AnalyticsPayloadValue = boolean | number | string;

export type AnalyticsEvent = {
  name: string;
  payload: Record<string, AnalyticsPayloadValue>;
};

export type AnalyticsTrackResult = "disabled" | "preview" | "sent";

export type AnalyticsClient = {
  track: (event: AnalyticsEvent) => Promise<AnalyticsTrackResult>;
};

type AnalyticsClientConfig = {
  endpoint?: string;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "info">;
  preview?: boolean;
  writeKey?: string;
};

function getAnalyticsConfigFromEnv(): AnalyticsClientConfig {
  return {
    endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
    preview: import.meta.env.VITE_ANALYTICS_PREVIEW === "true",
    writeKey: import.meta.env.VITE_ANALYTICS_WRITE_KEY,
  };
}

export function createAnalyticsClient(
  overrides: AnalyticsClientConfig = {},
): AnalyticsClient {
  const config = {
    ...getAnalyticsConfigFromEnv(),
    fetchImpl: globalThis.fetch?.bind(globalThis),
    logger: console,
    ...overrides,
  };

  return {
    async track(event) {
      if (!config.endpoint || !config.writeKey) {
        if (config.preview) {
          config.logger?.info("[analytics:preview]", event.name, event.payload);
          return "preview";
        }

        return "disabled";
      }

      await config.fetchImpl?.(config.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-write-key": config.writeKey,
        },
        body: JSON.stringify({
          ...event,
          sentAt: new Date().toISOString(),
        }),
      });

      return "sent";
    },
  };
}

export const analyticsClient = createAnalyticsClient();

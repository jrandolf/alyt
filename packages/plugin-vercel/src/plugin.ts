import type { AnalyticsPlugin } from "@alyt/core";
import { track as vercelTrack } from "@vercel/analytics";

export interface VercelAnalyticsOptions {
  client?: { track: typeof vercelTrack };
}

export function vercelAnalytics(
  options?: VercelAnalyticsOptions
): AnalyticsPlugin {
  return {
    name: "vercel",
    track(event, params) {
      const trackFn = options?.client?.track ?? vercelTrack;
      trackFn(
        event,
        params as Record<string, string | number | boolean | null | undefined>
      );
    },
  };
}

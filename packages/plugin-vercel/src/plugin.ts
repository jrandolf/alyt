import type { AnalyticsPlugin } from "@alyt/core";
import { track as vercelTrack } from "@vercel/analytics";

export function vercelAnalytics(): AnalyticsPlugin {
  return {
    name: "vercel",
    track(event, params) {
      vercelTrack(
        event,
        params as Record<string, string | number | boolean | null | undefined>,
      );
    },
  };
}

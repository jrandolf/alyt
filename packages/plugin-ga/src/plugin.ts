import type { AnalyticsPlugin } from "@alyt/core";

export interface GoogleAnalyticsOptions {
  client?: Gtag.Gtag;
  measurementId: string;
}

export function googleAnalytics(
  options: GoogleAnalyticsOptions
): AnalyticsPlugin {
  function getGtag(): Gtag.Gtag | undefined {
    return (
      options.client ??
      (typeof window !== "undefined" ? window.gtag : undefined)
    );
  }

  return {
    name: "google-analytics",
    track(event, params) {
      getGtag()?.("event", event, params);
    },
    identify(userId, traits) {
      getGtag()?.("set", { user_id: userId, ...traits });
    },
    page(name, params) {
      getGtag()?.("event", "page_view", { page_title: name, ...params });
    },
    reset() {
      getGtag()?.("set", { user_id: undefined });
    },
  };
}

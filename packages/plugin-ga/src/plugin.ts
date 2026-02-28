import type { AnalyticsPlugin } from "@alyt/core";

type GtagCommand = "config" | "event" | "js" | "set";

function gtag(...args: [GtagCommand, ...unknown[]]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

declare global {
  interface Window {
    gtag?: (...args: [GtagCommand, ...unknown[]]) => void;
  }
}

export interface GoogleAnalyticsOptions {
  measurementId: string;
}

export function googleAnalytics(options: GoogleAnalyticsOptions): AnalyticsPlugin {
  return {
    name: "google-analytics",
    track(event, params) {
      gtag("event", event, params);
    },
    identify(userId, traits) {
      gtag("set", { user_id: userId, ...traits });
    },
    page(name, params) {
      gtag("event", "page_view", { page_title: name, ...params });
    },
    reset() {
      gtag("set", { user_id: undefined });
    },
  };
}

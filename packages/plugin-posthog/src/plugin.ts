import type { AnalyticsPlugin } from "@alyt/core";
import type { PostHog } from "posthog-js";

export interface PostHogOptions {
  apiKey: string;
  apiHost?: string;
  client?: PostHog;
}

export function posthog(options: PostHogOptions): AnalyticsPlugin {
  function getPostHog(): PostHog | null {
    if (options.client) return options.client;
    if (typeof window !== "undefined" && "posthog" in window) {
      return (window as Record<string, unknown>).posthog as PostHog;
    }
    return null;
  }

  return {
    name: "posthog",
    track(event, params) {
      getPostHog()?.capture(event, params);
    },
    identify(userId, traits) {
      getPostHog()?.identify(userId, traits);
    },
    page(name, params) {
      getPostHog()?.capture("$pageview", { page_title: name, ...params });
    },
    reset() {
      getPostHog()?.reset();
    },
  };
}

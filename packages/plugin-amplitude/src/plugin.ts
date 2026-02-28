import type { AnalyticsPlugin } from "@alyt/core";
import type { AmplitudeBrowser } from "@amplitude/analytics-browser";

export interface AmplitudeOptions {
  apiKey: string;
  client?: AmplitudeBrowser;
}

export function amplitude(options: AmplitudeOptions): AnalyticsPlugin {
  function getAmplitude(): AmplitudeBrowser | null {
    if (options.client) return options.client;
    if (typeof window !== "undefined" && "amplitude" in window) {
      return (window as Record<string, unknown>).amplitude as AmplitudeBrowser;
    }
    return null;
  }

  return {
    name: "amplitude",
    track(event, params) {
      getAmplitude()?.track(event, params);
    },
    identify(userId) {
      getAmplitude()?.setUserId(userId);
    },
    page(name, params) {
      getAmplitude()?.track("Page View", { page_title: name, ...params });
    },
    reset() {
      getAmplitude()?.reset();
    },
  };
}

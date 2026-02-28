import type { AnalyticsPlugin } from "@alyt/core";

export interface AmplitudeOptions {
  apiKey: string;
}

export function amplitude(options: AmplitudeOptions): AnalyticsPlugin {
  function getAmplitude() {
    if (typeof window !== "undefined" && "amplitude" in window) {
      return (window as Record<string, unknown>).amplitude as {
        track(event: string, params?: Record<string, unknown>): void;
        setUserId(userId: string): void;
        reset(): void;
      };
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

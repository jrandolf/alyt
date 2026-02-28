import type { AnalyticsPlugin } from "@alyt/core";

export interface MixpanelOptions {
  token: string;
}

export function mixpanel(options: MixpanelOptions): AnalyticsPlugin {
  function getMixpanel() {
    if (typeof window !== "undefined" && "mixpanel" in window) {
      return (window as Record<string, unknown>).mixpanel as {
        track(event: string, params?: Record<string, unknown>): void;
        identify(userId: string): void;
        people: { set(traits: Record<string, unknown>): void };
        track_pageview(params?: Record<string, unknown>): void;
        reset(): void;
      };
    }
    return null;
  }

  return {
    name: "mixpanel",
    track(event, params) {
      getMixpanel()?.track(event, params);
    },
    identify(userId, traits) {
      const mp = getMixpanel();
      mp?.identify(userId);
      if (traits) mp?.people.set(traits);
    },
    page(name, params) {
      getMixpanel()?.track_pageview({ page: name, ...params });
    },
    reset() {
      getMixpanel()?.reset();
    },
  };
}

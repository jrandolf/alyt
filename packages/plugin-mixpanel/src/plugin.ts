import type { AnalyticsPlugin } from "@alyt/core";
import type { OverridedMixpanel } from "mixpanel-browser";

export interface MixpanelOptions {
  token: string;
  client?: OverridedMixpanel;
}

export function mixpanel(options: MixpanelOptions): AnalyticsPlugin {
  function getMixpanel(): OverridedMixpanel | null {
    if (options.client) return options.client;
    if (typeof window !== "undefined" && "mixpanel" in window) {
      return (window as Record<string, unknown>).mixpanel as OverridedMixpanel;
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

import type { AnalyticsClient, AnalyticsOptions, AnalyticsPlugin, TrackOptions } from "./types.js";

export function createAnalytics(options?: AnalyticsOptions): AnalyticsClient {
  const plugins: AnalyticsPlugin[] = [...(options?.plugins ?? [])];

  return {
    track(event, params, trackOptions) {
      const targets = trackOptions?.only
        ? plugins.filter((p) => trackOptions.only!.includes(p.name))
        : plugins;
      for (const p of targets) {
        p.track(event, params);
      }
    },
    identify(userId, traits) {
      for (const p of plugins) {
        p.identify?.(userId, traits);
      }
    },
    page(name, params) {
      for (const p of plugins) {
        p.page?.(name, params);
      }
    },
    reset() {
      for (const p of plugins) {
        p.reset?.();
      }
    },
    addPlugin(plugin) {
      plugins.push(plugin);
    },
    removePlugin(name) {
      const idx = plugins.findIndex((p) => p.name === name);
      if (idx !== -1) {
        plugins.splice(idx, 1);
      }
    },
  };
}

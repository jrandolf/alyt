export interface AnalyticsPlugin {
  identify?(userId: string, traits?: Record<string, unknown>): void;
  name: string;
  page?(name?: string, params?: Record<string, unknown>): void;
  reset?(): void;
  track(event: string, params?: Record<string, unknown>): void;
}

export interface TrackOptions {
  only?: string[];
}

export interface AnalyticsClient {
  addPlugin(plugin: AnalyticsPlugin): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name?: string, params?: Record<string, unknown>): void;
  removePlugin(name: string): void;
  reset(): void;
  track(
    event: string,
    params?: Record<string, unknown>,
    options?: TrackOptions
  ): void;
}

export interface AnalyticsOptions {
  plugins?: AnalyticsPlugin[];
}

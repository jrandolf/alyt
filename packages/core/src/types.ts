export interface AnalyticsPlugin {
  name: string;
  track(event: string, params?: Record<string, unknown>): void;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  page?(name?: string, params?: Record<string, unknown>): void;
  reset?(): void;
}

export interface TrackOptions {
  only?: string[];
}

export interface AnalyticsClient {
  track(event: string, params?: Record<string, unknown>, options?: TrackOptions): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name?: string, params?: Record<string, unknown>): void;
  reset(): void;
  addPlugin(plugin: AnalyticsPlugin): void;
  removePlugin(name: string): void;
}

export interface AnalyticsOptions {
  plugins?: AnalyticsPlugin[];
}

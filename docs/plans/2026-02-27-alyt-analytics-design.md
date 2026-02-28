# alyt -- Pluggable Analytics Library

Extracted from `@rcruit/analytics`. A standalone monorepo at `~/Sources/alyt` published to npm under the `@alyt` scope.

## Packages

| Package | Purpose |
|---|---|
| `@alyt/core` | `createAnalytics()`, `AnalyticsPlugin` interface, `AnalyticsClient` |
| `@alyt/react` | `<AnalyticsProvider>`, `useAnalytics()` hook |
| `@alyt/codegen` | CLI: YAML schema -> typed `createTracker()` factory + `AnalyticsEventMap` types |
| `@alyt/plugin-ga` | Google Analytics (gtag.js) + `<GAScript>` React loader |
| `@alyt/plugin-posthog` | PostHog (posthog-js) + `<PostHogScript>` React loader |
| `@alyt/plugin-mixpanel` | Mixpanel (mixpanel-browser) + `<MixpanelScript>` React loader |
| `@alyt/plugin-amplitude` | Amplitude (@amplitude/analytics-browser) + `<AmplitudeScript>` React loader |
| `@alyt/plugin-plausible` | Plausible (plausible-tracker) + `<PlausibleScript>` React loader |
| `@alyt/plugin-vercel` | Vercel Analytics (@vercel/analytics) + `<VercelAnalytics>` React loader |

## Repo Structure

```
~/Sources/alyt/
  packages/
    core/
    react/
    codegen/
    plugin-ga/
    plugin-mixpanel/
    plugin-posthog/
    plugin-amplitude/
    plugin-plausible/
    plugin-vercel/
  pnpm-workspace.yaml
  tsconfig.base.json
  turbo.json
```

## Core API (`@alyt/core`)

```ts
interface AnalyticsPlugin {
  name: string;
  track(event: string, params?: Record<string, unknown>): void;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  page?(name?: string, params?: Record<string, unknown>): void;
  reset?(): void;
}

interface TrackOptions {
  only?: string[];  // only send to these plugins (by name)
}

interface AnalyticsClient {
  track(event: string, params?: Record<string, unknown>, options?: TrackOptions): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name?: string, params?: Record<string, unknown>): void;
  reset(): void;
  addPlugin(plugin: AnalyticsPlugin): void;
  removePlugin(name: string): void;
}

function createAnalytics(options: {
  plugins?: AnalyticsPlugin[];
}): AnalyticsClient;
```

- `track` is required on plugins; `identify`, `page`, `reset` are optional.
- `addPlugin`/`removePlugin` supports consent flows (add when granted, remove when revoked).
- The client fans out every call to all registered plugins.

## Codegen (`@alyt/codegen`)

Reads a YAML schema (same format as existing `analytics.schema.yaml`) and generates:

1. `types.ts` -- `AnalyticsEventName` union + `AnalyticsEventMap` interface
2. `tracker.ts` -- `createTracker(client)` curried factory returning a typed object

```ts
// Generated output
import type { AnalyticsClient } from "@alyt/core";

export function createTracker(client: AnalyticsClient) {
  return {
    scenarioCreated(scenarioId: string) {
      client.track("scenario_created", { scenario_id: scenarioId });
    },
    onboardingDismissed() {
      client.track("onboarding_dismissed");
    },
  };
}
```

Consumer creates a singleton:

```ts
import { createAnalytics } from "@alyt/core";
import { googleAnalytics } from "@alyt/plugin-ga";
import { createTracker } from "./generated/tracker";

const client = createAnalytics({
  plugins: [googleAnalytics({ measurementId: "G-XXX" })],
});

export const tracker = createTracker(client);

// Usage:
tracker.scenarioCreated("abc");
```

## React (`@alyt/react`)

- `<AnalyticsProvider client={...}>` -- context provider
- `useAnalytics()` -- hook returning `AnalyticsClient`

Thin package. Script loaders live in their respective plugin packages.

## Plugin Subpath Exports

Each plugin package has two entrypoints:

- `@alyt/plugin-ga` -- pure JS plugin factory `googleAnalytics()`
- `@alyt/plugin-ga/react` -- React script loader `<GAScript>`

## Plugin SDK Mapping

| Package | SDK | track | identify | page |
|---|---|---|---|---|
| plugin-ga | gtag.js | `gtag('event', ...)` | `gtag('set', { user_id })` | `gtag('event', 'page_view')` |
| plugin-posthog | posthog-js | `posthog.capture(...)` | `posthog.identify(...)` | `posthog.capture('$pageview')` |
| plugin-mixpanel | mixpanel-browser | `mixpanel.track(...)` | `mixpanel.identify(...)` | `mixpanel.track_pageview()` |
| plugin-amplitude | @amplitude/analytics-browser | `amplitude.track(...)` | `amplitude.setUserId(...)` | `amplitude.track('Page View')` |
| plugin-plausible | plausible-tracker | `plausible(event)` | N/A | auto |
| plugin-vercel | @vercel/analytics | `track(event, params)` | N/A | auto via `<Analytics>` |

## Distribution

- Published to npm under `@alyt` scope.
- Standalone repo at `~/Sources/alyt` with its own CI.
- Monorepo managed by pnpm workspaces + Turborepo.

## Migration from rcruit

After alyt is built, rcruit will:

1. Replace `@rcruit/analytics` dependency with `@alyt/core`, `@alyt/plugin-ga`, `@alyt/react`, `@alyt/codegen`
2. Update codegen script to use `@alyt/codegen` CLI
3. Update imports in `web/rcruit/lib/analytics/` and `web/rcruit/app/layout.tsx`
4. Remove `javascript/analytics/` from the rcruit monorepo

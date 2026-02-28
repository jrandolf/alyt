# alyt

Pluggable analytics for TypeScript.

Send events to Google Analytics, PostHog, Mixpanel, Amplitude, Plausible, and Vercel Analytics through a single API. Add or remove providers at runtime for consent flows, and generate fully typed event trackers from a YAML schema.

## Install

```bash
# core
pnpm add @alyt/core

# plugins (pick what you use)
pnpm add @alyt/plugin-ga
pnpm add @alyt/plugin-posthog
pnpm add @alyt/plugin-mixpanel
pnpm add @alyt/plugin-amplitude
pnpm add @alyt/plugin-plausible
pnpm add @alyt/plugin-vercel

# react bindings
pnpm add @alyt/react

# codegen (dev dependency)
pnpm add -D @alyt/codegen
```

## Quick Start

```typescript
import { createAnalytics } from "@alyt/core";
import { googleAnalytics } from "@alyt/plugin-ga";
import { posthog } from "@alyt/plugin-posthog";

const analytics = createAnalytics({
  plugins: [
    googleAnalytics({ measurementId: "G-XXXXXXXXXX" }),
    posthog({ apiKey: "phc_XXXXXXXXXX" }),
  ],
});

analytics.track("button_clicked", { label: "Sign Up" });
analytics.identify("user_123", { plan: "pro" });
analytics.page("Home");
```

Every call fans out to all registered plugins. Plugins that don't implement a method (e.g. Plausible has no `identify`) are silently skipped.

## Plugins

| Plugin | Package | Factory | Required Options |
| --- | --- | --- | --- |
| Google Analytics | `@alyt/plugin-ga` | `googleAnalytics()` | `measurementId: string` |
| PostHog | `@alyt/plugin-posthog` | `posthog()` | `apiKey: string` |
| Mixpanel | `@alyt/plugin-mixpanel` | `mixpanel()` | `token: string` |
| Amplitude | `@alyt/plugin-amplitude` | `amplitude()` | `apiKey: string` |
| Plausible | `@alyt/plugin-plausible` | `plausible()` | `domain: string` |
| Vercel Analytics | `@alyt/plugin-vercel` | `vercelAnalytics()` | _(none)_ |

Each plugin also accepts an optional `client` property to inject an SDK instance (useful for testing or SSR).

### Script Loaders (React / Next.js)

Plugins that need a `<script>` tag provide a React component under a `/react` subpath:

```tsx
import { GAScript } from "@alyt/plugin-ga/react";
import { VercelAnalytics } from "@alyt/plugin-vercel/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GAScript measurementId="G-XXXXXXXXXX" />
        <VercelAnalytics />
        {children}
      </body>
    </html>
  );
}
```

| Package | Component | Props |
| --- | --- | --- |
| `@alyt/plugin-ga/react` | `GAScript` | `measurementId?: string` (falls back to `NEXT_PUBLIC_GA_MEASUREMENT_ID`) |
| `@alyt/plugin-posthog/react` | `PostHogScript` | `apiKey: string`, `apiHost?: string` |
| `@alyt/plugin-mixpanel/react` | `MixpanelScript` | `token: string` |
| `@alyt/plugin-amplitude/react` | `AmplitudeScript` | `apiKey: string` |
| `@alyt/plugin-plausible/react` | `PlausibleScript` | `domain: string`, `apiHost?: string` |
| `@alyt/plugin-vercel/react` | `VercelAnalytics` | _(re-export of `@vercel/analytics/react`)_ |

## React

Wrap your app with `AnalyticsProvider` and use the `useAnalytics` hook in any component:

```tsx
import { createAnalytics } from "@alyt/core";
import { AnalyticsProvider, useAnalytics } from "@alyt/react";
import { googleAnalytics } from "@alyt/plugin-ga";

const client = createAnalytics({
  plugins: [googleAnalytics({ measurementId: "G-XXXXXXXXXX" })],
});

// In your root layout
function App() {
  return (
    <AnalyticsProvider client={client}>
      <Dashboard />
    </AnalyticsProvider>
  );
}

// In any component
function Dashboard() {
  const analytics = useAnalytics();

  return (
    <button onClick={() => analytics.track("dashboard_clicked")}>
      Go to Dashboard
    </button>
  );
}
```

`useAnalytics()` throws if used outside an `<AnalyticsProvider>`.

## Codegen

Define your events in a YAML schema and generate a fully typed tracker.

### 1. Define your schema

```yaml
# analytics.schema.yaml
events:
  page_viewed:
    description: Fired when a user views a page
    params:
      page_name: string
  button_clicked:
    description: Fired when a user clicks a button
    params:
      button_id: string
      label: string
  user_signed_up:
    description: Fired when a new user completes registration
```

Events with no parameters can omit `params`. The optional `description` field generates JSDoc comments in the output.

### 2. Run the CLI

```bash
npx alyt-codegen --schema analytics.schema.yaml --out lib/analytics
```

### 3. Use the generated tracker

The CLI generates two files:

**`types.ts`** -- Event name union and parameter map:

```typescript
export type AnalyticsEventName =
  | "page_viewed"
  | "button_clicked"
  | "user_signed_up";

export interface AnalyticsEventMap {
  /** Fired when a user views a page */
  page_viewed: { page_name: string };
  /** Fired when a user clicks a button */
  button_clicked: { button_id: string; label: string };
  /** Fired when a new user completes registration */
  user_signed_up: Record<string, never>;
}
```

**`tracker.ts`** -- Typed methods that call `client.track()`:

```typescript
import type { AnalyticsClient, TrackOptions } from "@alyt/core";

export function createTracker(client: AnalyticsClient) {
  return {
    /** Fired when a user views a page */
    pageViewed(pageName: string, options?: TrackOptions) {
      client.track("page_viewed", { page_name: pageName }, options);
    },
    /** Fired when a user clicks a button */
    buttonClicked(buttonId: string, label: string, options?: TrackOptions) {
      client.track("button_clicked", { button_id: buttonId, label: label }, options);
    },
    /** Fired when a new user completes registration */
    userSignedUp(options?: TrackOptions) {
      client.track("user_signed_up", undefined, options);
    },
  };
}
```

Parameter names are converted from `snake_case` (YAML) to `camelCase` (TypeScript). Descriptions become JSDoc comments on both the type map and the tracker methods.

## Selective Tracking

Send an event to specific plugins only using `TrackOptions.only`:

```typescript
// Only send to Google Analytics, skip PostHog
analytics.track("internal_metric", { value: 42 }, { only: ["google-analytics"] });
```

Plugin names are the `name` property returned by each factory:

| Factory | Plugin Name |
| --- | --- |
| `googleAnalytics()` | `"google-analytics"` |
| `posthog()` | `"posthog"` |
| `mixpanel()` | `"mixpanel"` |
| `amplitude()` | `"amplitude"` |
| `plausible()` | `"plausible"` |
| `vercelAnalytics()` | `"vercel"` |

The generated tracker also accepts `TrackOptions` as the last argument on every method.

## Custom Client

Every plugin accepts a `client` option to pass your own SDK instance. This is useful when you've already initialized the SDK elsewhere, or for testing:

```typescript
import { googleAnalytics } from "@alyt/plugin-ga";

// Use your own gtag instance
const plugin = googleAnalytics({
  measurementId: "G-XXXXXXXXXX",
  client: myCustomGtag,
});
```

## Dynamic Plugins

Add or remove plugins at runtime -- useful for cookie consent flows:

```typescript
import { createAnalytics } from "@alyt/core";
import { googleAnalytics } from "@alyt/plugin-ga";
import { posthog } from "@alyt/plugin-posthog";

const analytics = createAnalytics(); // start with no plugins

// User accepts analytics cookies
analytics.addPlugin(googleAnalytics({ measurementId: "G-XXXXXXXXXX" }));
analytics.addPlugin(posthog({ apiKey: "phc_XXXXXXXXXX" }));

// User revokes consent
analytics.removePlugin("google-analytics");
analytics.removePlugin("posthog");
```

Events tracked before any plugins are added are silently dropped.

## Custom Plugins

Implement the `AnalyticsPlugin` interface to write your own:

```typescript
import type { AnalyticsPlugin } from "@alyt/core";

export function consoleAnalytics(): AnalyticsPlugin {
  return {
    name: "console",
    track(event, params) {
      console.log("[track]", event, params);
    },
    identify(userId, traits) {
      console.log("[identify]", userId, traits);
    },
    page(name, params) {
      console.log("[page]", name, params);
    },
    reset() {
      console.log("[reset]");
    },
  };
}
```

Only `name` and `track` are required. The `identify`, `page`, and `reset` methods are optional.

## Packages

| Package | Description |
| --- | --- |
| [`@alyt/core`](packages/core) | `createAnalytics` client and plugin interface |
| [`@alyt/react`](packages/react) | `AnalyticsProvider` and `useAnalytics` hook |
| [`@alyt/codegen`](packages/codegen) | YAML-to-TypeScript event codegen CLI |
| [`@alyt/plugin-ga`](packages/plugin-ga) | Google Analytics (gtag.js) |
| [`@alyt/plugin-posthog`](packages/plugin-posthog) | PostHog |
| [`@alyt/plugin-mixpanel`](packages/plugin-mixpanel) | Mixpanel |
| [`@alyt/plugin-amplitude`](packages/plugin-amplitude) | Amplitude |
| [`@alyt/plugin-plausible`](packages/plugin-plausible) | Plausible Analytics |
| [`@alyt/plugin-vercel`](packages/plugin-vercel) | Vercel Analytics |

## License

MIT

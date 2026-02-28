import { createAnalytics } from "@alyt/core";
import { googleAnalytics } from "@alyt/plugin-ga";
import { posthog } from "@alyt/plugin-posthog";

export const analytics = createAnalytics({
  plugins: [
    googleAnalytics({ measurementId: "G-XXXXXXXXXX" }),
    posthog({ apiKey: "phc_XXXXXXXXXX" }),
  ],
});

// Track events — sent to both GA and PostHog
analytics.track("button_clicked", { label: "Get Started" });

// Identify a user
analytics.identify("user_123", { plan: "pro", company: "Acme" });

// Track a page view
analytics.page("Home");

// Send only to Google Analytics
analytics.track("internal_metric", { value: 42 }, { only: ["google-analytics"] });

// Reset (e.g. on logout)
analytics.reset();

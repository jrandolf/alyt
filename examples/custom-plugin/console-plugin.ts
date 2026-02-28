import type { AnalyticsPlugin } from "@alyt/core";
import { createAnalytics } from "@alyt/core";

/**
 * A simple plugin that logs all analytics calls to the console.
 * Useful for debugging or development.
 */
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

// Usage
const analytics = createAnalytics({
  plugins: [consoleAnalytics()],
});

analytics.track("button_clicked", { label: "Sign Up" });
// => [track] button_clicked { label: 'Sign Up' }

analytics.identify("user_123", { plan: "pro" });
// => [identify] user_123 { plan: 'pro' }

analytics.page("Dashboard");
// => [page] Dashboard undefined

analytics.reset();
// => [reset]

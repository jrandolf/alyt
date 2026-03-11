"use client";

import { useAnalytics } from "@alyt/react";
import { tracker } from "../lib/analytics";

export default function Home() {
  const analytics = useAnalytics();

  return (
    <main>
      <h1>alyt + Next.js Example</h1>

      {/* Using the generated typed tracker */}
      <button
        onClick={() => tracker.buttonClicked("hero-cta", "Get Started")}
        type="button"
      >
        Get Started
      </button>

      {/* Using the raw analytics client from context */}
      <button
        onClick={() => analytics.track("custom_event", { source: "home" })}
        type="button"
      >
        Custom Event
      </button>

      {/* Track a page view with the typed tracker */}
      <button onClick={() => tracker.pageViewed("Home")} type="button">
        Track Page View
      </button>
    </main>
  );
}

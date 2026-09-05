import type { AnalyticsClient } from "@alyt/core";
import { getContext, setContext } from "svelte";

const analyticsKey = Symbol("alyt");

/** Set a client for this component's descendants during component initialization. */
export function setAnalytics(client: AnalyticsClient): AnalyticsClient {
  return setContext(analyticsKey, client);
}

/** Read the nearest analytics client during component initialization. */
export function getAnalytics(): AnalyticsClient {
  const client = getContext<AnalyticsClient | undefined>(analyticsKey);
  if (!client) {
    throw new Error(
      "getAnalytics must be used within an <AnalyticsProvider> or after setAnalytics",
    );
  }
  return client;
}

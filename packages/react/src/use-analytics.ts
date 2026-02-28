import type { AnalyticsClient } from "@alyt/core";
import { useContext } from "react";
import { AnalyticsContext } from "./analytics-provider.js";

export function useAnalytics(): AnalyticsClient {
  const client = useContext(AnalyticsContext);
  if (!client) {
    throw new Error("useAnalytics must be used within an <AnalyticsProvider>");
  }
  return client;
}

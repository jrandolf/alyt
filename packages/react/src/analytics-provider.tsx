import type { AnalyticsClient } from "@alyt/core";
import { createContext, type ReactNode } from "react";

export const AnalyticsContext = createContext<AnalyticsClient | null>(null);

interface AnalyticsProviderProps {
  client: AnalyticsClient;
  children: ReactNode;
}

export function AnalyticsProvider({ client, children }: AnalyticsProviderProps) {
  return <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>;
}

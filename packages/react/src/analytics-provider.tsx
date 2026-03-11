import type { AnalyticsClient } from "@alyt/core";
import { createContext, type ReactNode } from "react";

export const AnalyticsContext = createContext<AnalyticsClient | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  client: AnalyticsClient;
}

export function AnalyticsProvider({
  client,
  children,
}: AnalyticsProviderProps) {
  return (
    <AnalyticsContext.Provider value={client}>
      {children}
    </AnalyticsContext.Provider>
  );
}

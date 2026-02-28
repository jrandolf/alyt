import { AnalyticsProvider } from "@alyt/react";
import { GAScript } from "@alyt/plugin-ga/react";
import { analytics } from "../lib/analytics";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GAScript measurementId="G-XXXXXXXXXX" />
        <AnalyticsProvider client={analytics}>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}

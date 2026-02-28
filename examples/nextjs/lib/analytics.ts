import { createAnalytics } from "@alyt/core";
import { googleAnalytics } from "@alyt/plugin-ga";
import { createTracker } from "./generated/tracker";

export const analytics = createAnalytics({
  plugins: [googleAnalytics({ measurementId: "G-XXXXXXXXXX" })],
});

export const tracker = createTracker(analytics);

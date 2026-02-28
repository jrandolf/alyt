import { describe, expect, it } from "vitest";
import { generateTracker, generateTypes } from "./generate.js";

const schema = {
  events: {
    scenario_created: { params: { scenario_id: "string" } },
    interview_created: { params: { interview_id: "string", scenario_id: "string" } },
    onboarding_dismissed: {},
  },
};

describe("generateTypes", () => {
  it("generates AnalyticsEventName union", () => {
    const output = generateTypes(schema);
    expect(output).toContain('"scenario_created"');
    expect(output).toContain('"interview_created"');
    expect(output).toContain('"onboarding_dismissed"');
    expect(output).toContain("export type AnalyticsEventName =");
  });

  it("generates AnalyticsEventMap with correct param types", () => {
    const output = generateTypes(schema);
    expect(output).toContain("scenario_created: { scenario_id: string }");
    expect(output).toContain("interview_created: { interview_id: string; scenario_id: string }");
    expect(output).toContain("onboarding_dismissed: Record<string, never>");
  });
});

describe("generateTracker", () => {
  it("generates createTracker factory", () => {
    const output = generateTracker(schema);
    expect(output).toContain("export function createTracker(client: AnalyticsClient)");
    expect(output).toContain('import type { AnalyticsClient, TrackOptions } from "@alyt/core"');
  });

  it("generates methods with correct parameter names and TrackOptions", () => {
    const output = generateTracker(schema);
    expect(output).toContain("scenarioCreated(scenarioId: string, options?: TrackOptions)");
    expect(output).toContain("interviewCreated(interviewId: string, scenarioId: string, options?: TrackOptions)");
    expect(output).toContain("onboardingDismissed(options?: TrackOptions)");
  });

  it("generates correct track calls with options passthrough", () => {
    const output = generateTracker(schema);
    expect(output).toContain('client.track("scenario_created", { scenario_id: scenarioId }, options)');
    expect(output).toContain('client.track("onboarding_dismissed", undefined, options)');
  });
});

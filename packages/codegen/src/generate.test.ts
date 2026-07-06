import { describe, expect, it } from "vitest";
import * as ts from "typescript";
import { generateTracker, generateTypes } from "./generate.js";

const schema = {
  events: {
    "auth.magic_link.requested": {
      description: "Fired when a magic link is requested",
      params: { "user.email_hash": "string" },
    },
    scenario_created: { description: "Fired when a new scenario is created", params: { scenario_id: "string" } },
    interview_created: { params: { interview_id: "string", scenario_id: "string" } },
    onboarding_dismissed: { description: "Fired when the user dismisses onboarding" },
  },
};

function expectValidTypeScript(source: string): void {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
    },
    reportDiagnostics: true,
  });

  expect(result.diagnostics).toEqual([]);
}

describe("generateTypes", () => {
  it("generates AnalyticsEventName union", () => {
    const output = generateTypes(schema);
    expect(output).toContain('"auth.magic_link.requested"');
    expect(output).toContain('"scenario_created"');
    expect(output).toContain('"interview_created"');
    expect(output).toContain('"onboarding_dismissed"');
    expect(output).toContain("export type AnalyticsEventName =");
  });

  it("generates AnalyticsEventMap with correct param types", () => {
    const output = generateTypes(schema);
    expect(output).toContain('"auth.magic_link.requested": { "user.email_hash": string }');
    expect(output).toContain("scenario_created: { scenario_id: string }");
    expect(output).toContain("interview_created: { interview_id: string; scenario_id: string }");
    expect(output).toContain("onboarding_dismissed: Record<string, never>");
  });

  it("generates JSDoc comments for events with descriptions", () => {
    const output = generateTypes(schema);
    expect(output).toContain("/** Fired when a new scenario is created */");
    expect(output).toContain("/** Fired when the user dismisses onboarding */");
  });

  it("omits JSDoc comments for events without descriptions", () => {
    const output = generateTypes(schema);
    const lines = output.split("\n");
    const interviewLine = lines.findIndex((l) => l.includes("interview_created:"));
    expect(lines[interviewLine - 1]).not.toContain("/**");
  });

  it("generates valid TypeScript for dotted event names", () => {
    expectValidTypeScript(generateTypes(schema));
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
    expect(output).toContain("requested(userEmailHash: string, options?: TrackOptions)");
    expect(output).toContain("scenarioCreated(scenarioId: string, options?: TrackOptions)");
    expect(output).toContain("interviewCreated(interviewId: string, scenarioId: string, options?: TrackOptions)");
    expect(output).toContain("onboardingDismissed(options?: TrackOptions)");
  });

  it("uses dotted event names as nested tracker namespaces", () => {
    const output = generateTracker(schema);
    expect(output).toContain("\t\tauth: {");
    expect(output).toContain("\t\t\tmagicLink: {");
    expect(output).toContain("\t\t\t\trequested(userEmailHash: string, options?: TrackOptions)");
    expect(output).not.toContain("authMagicLinkRequested(");
  });

  it("generates correct track calls with options passthrough", () => {
    const output = generateTracker(schema);
    expect(output).toContain(
      'client.track("auth.magic_link.requested", { "user.email_hash": userEmailHash }, options)',
    );
    expect(output).toContain('client.track("scenario_created", { scenario_id: scenarioId }, options)');
    expect(output).toContain('client.track("onboarding_dismissed", undefined, options)');
  });

  it("generates JSDoc comments for methods with descriptions", () => {
    const output = generateTracker(schema);
    expect(output).toContain("/** Fired when a new scenario is created */");
    expect(output).toContain("/** Fired when the user dismisses onboarding */");
  });

  it("omits JSDoc comments for methods without descriptions", () => {
    const output = generateTracker(schema);
    const lines = output.split("\n");
    const interviewLine = lines.findIndex((l) => l.includes("interviewCreated("));
    expect(lines[interviewLine - 1]).not.toContain("/**");
  });

  it("generates valid TypeScript for dotted event names", () => {
    expectValidTypeScript(generateTracker(schema));
  });
});

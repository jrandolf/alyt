import { describe, expect, it } from "vitest";
import * as ts from "typescript";
import { generateTracker, generateTypes } from "./generate.js";
import type { Schema } from "./generate.js";

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

const hashSchema = {
  events: {
    user_invited: {
      description: "Fired when an invitation is sent",
      params: {
        email: { type: "string", hash: true },
        organization_id: "string",
      },
    },
  },
} satisfies Schema;

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

  it("generates AnalyticsEventMap from full-form param types", () => {
    const output = generateTypes(hashSchema);
    expect(output).toContain("user_invited: { email: string; organization_id: string }");
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

  it("generates valid TypeScript for full-form params", () => {
    expectValidTypeScript(generateTypes(hashSchema));
  });
});

describe("generateTracker", () => {
  it("generates createTracker factory", () => {
    const output = generateTracker(schema);
    expect(output).toContain("export function createTracker(client: AnalyticsClient)");
    expect(output).toContain('import type { AnalyticsClient, TrackOptions } from "@alyt/core"');
    expect(output).not.toContain("sha256Hex");
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

  it("hashes full-form params marked with hash metadata", () => {
    const output = generateTracker(hashSchema);
    expect(output).toContain('import { sha256Hex } from "@alyt/core"');
    expect(output).toContain("async userInvited(email: string, organizationId: string, options?: TrackOptions)");
    expect(output).toContain(
      'client.track("user_invited", { email: await sha256Hex(email), organization_id: organizationId }, options)',
    );
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

  it("generates valid TypeScript for full-form params", () => {
    expectValidTypeScript(generateTracker(hashSchema));
  });

  it("throws when hash metadata is used on non-string params", () => {
    const invalidSchema = {
      events: {
        bad_event: {
          params: {
            count: { type: "number", hash: true },
          },
        },
      },
    } as unknown as Schema;

    expect(() => generateTracker(invalidSchema)).toThrow(
      'Param "count" on event "bad_event" uses hash: true, which is only supported for type "string"',
    );
  });

  it("throws when full-form params omit type", () => {
    const invalidSchema = {
      events: {
        bad_event: {
          params: {
            email: { hash: true },
          },
        },
      },
    } as unknown as Schema;

    expect(() => generateTypes(invalidSchema)).toThrow(
      'Param "email" on event "bad_event" must define a string type field',
    );
  });

  it("throws when full-form params include unknown fields", () => {
    const invalidSchema = {
      events: {
        bad_event: {
          params: {
            email: { type: "string", transform: "hash" },
          },
        },
      },
    } as unknown as Schema;

    expect(() => generateTracker(invalidSchema)).toThrow(
      'Param "email" on event "bad_event" has unknown field(s): transform',
    );
  });
});

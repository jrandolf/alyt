export interface SchemaParamDefinition {
  hash?: boolean;
  type: string;
}

export type SchemaParam = SchemaParamDefinition | string;

export interface SchemaEvent {
  description?: string;
  params?: Record<string, SchemaParam>;
}

export interface Schema {
  events: Record<string, SchemaEvent>;
}

interface TrackerMethod {
  event: SchemaEvent;
  name: string;
  type: "method";
}

interface TrackerNamespace {
  children: Map<string, TrackerEntry>;
  type: "namespace";
}

type TrackerEntry = TrackerMethod | TrackerNamespace;

const identifierPattern = /^[A-Za-z_$][\w$]*$/;
const paramDefinitionFields = new Set(["hash", "type"]);

interface NormalizedParam {
  hash: boolean;
  name: string;
  type: string;
}

function propertyKey(s: string): string {
  return identifierPattern.test(s) ? s : JSON.stringify(s);
}

function nameToPascal(s: string): string {
  return s
    .split(/[^A-Za-z0-9_$]+|_/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function nameToCamel(s: string): string {
  const pascal = nameToPascal(s);
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  return identifierPattern.test(camel) ? camel : `_${camel}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeParam(eventName: string, paramName: string, param: SchemaParam): NormalizedParam {
  if (typeof param === "string") {
    return {
      hash: false,
      name: paramName,
      type: param,
    };
  }

  if (!isRecord(param)) {
    throw new Error(
      `Param "${paramName}" on event "${eventName}" must be a type string or a full-form param object`,
    );
  }

  const unknownFields = Object.keys(param).filter((field) => !paramDefinitionFields.has(field));
  if (unknownFields.length > 0) {
    throw new Error(
      `Param "${paramName}" on event "${eventName}" has unknown field(s): ${unknownFields.join(", ")}`,
    );
  }

  if (typeof param.type !== "string" || param.type.length === 0) {
    throw new Error(`Param "${paramName}" on event "${eventName}" must define a string type field`);
  }

  if (param.hash !== undefined && typeof param.hash !== "boolean") {
    throw new Error(`Param "${paramName}" on event "${eventName}" has non-boolean hash metadata`);
  }

  if (param.hash === true && param.type !== "string") {
    throw new Error(
      `Param "${paramName}" on event "${eventName}" uses hash: true, which is only supported for type "string"`,
    );
  }

  return {
    hash: param.hash ?? false,
    name: paramName,
    type: param.type,
  };
}

function normalizeParams(eventName: string, params?: Record<string, SchemaParam>): NormalizedParam[] {
  return Object.entries(params ?? {}).map(([name, param]) => normalizeParam(eventName, name, param));
}

function schemaUsesHash(schema: Schema): boolean {
  return Object.entries(schema.events).some(([name, event]) =>
    normalizeParams(name, event?.params).some((param) => param.hash),
  );
}

function trackerPath(name: string): string[] {
  const parts = name.split(".");
  if (parts.some((part) => part.length === 0)) {
    throw new Error(`Event name "${name}" contains an empty namespace segment`);
  }
  return parts.map(nameToCamel);
}

function createTrackerNamespace(): TrackerNamespace {
  return {
    children: new Map(),
    type: "namespace",
  };
}

function insertTrackerEvent(root: TrackerNamespace, name: string, event: SchemaEvent): void {
  const path = trackerPath(name);
  let namespace = root;

  for (const [index, key] of path.entries()) {
    const isMethod = index === path.length - 1;
    const existing = namespace.children.get(key);

    if (isMethod) {
      if (existing) {
        throw new Error(`Event name "${name}" conflicts at tracker path "${path.join(".")}"`);
      }
      namespace.children.set(key, {
        event,
        name,
        type: "method",
      });
      return;
    }

    if (existing?.type === "method") {
      throw new Error(`Event name "${name}" conflicts at tracker path "${path.join(".")}"`);
    }

    if (existing) {
      namespace = existing;
      continue;
    }

    const child = createTrackerNamespace();
    namespace.children.set(key, child);
    namespace = child;
  }
}

function emitTrackerMethod(lines: string[], key: string, method: TrackerMethod, level: number): void {
  const indent = "\t".repeat(level);
  const params = normalizeParams(method.name, method.event?.params);
  const usesHash = params.some((param) => param.hash);

  if (method.event?.description) {
    lines.push(`${indent}/** ${method.event.description} */`);
  }
  if (params.length > 0) {
    const args = params.map((param) => `${nameToCamel(param.name)}: ${param.type}`).join(", ");
    const obj = params
      .map((param) => {
        const argumentName = nameToCamel(param.name);
        const value = param.hash ? `await sha256Hex(${argumentName})` : argumentName;
        return `${propertyKey(param.name)}: ${value}`;
      })
      .join(", ");
    lines.push(`${indent}${usesHash ? "async " : ""}${propertyKey(key)}(${args}, options?: TrackOptions) {`);
    lines.push(`${indent}\tclient.track("${method.name}", { ${obj} }, options);`);
    lines.push(`${indent}},`);
  } else {
    lines.push(`${indent}${propertyKey(key)}(options?: TrackOptions) {`);
    lines.push(`${indent}\tclient.track("${method.name}", undefined, options);`);
    lines.push(`${indent}},`);
  }
}

function emitTrackerEntry(lines: string[], key: string, entry: TrackerEntry, level: number): void {
  const indent = "\t".repeat(level);
  if (entry.type === "method") {
    emitTrackerMethod(lines, key, entry, level);
    return;
  }

  lines.push(`${indent}${propertyKey(key)}: {`);
  for (const [childKey, child] of entry.children) {
    emitTrackerEntry(lines, childKey, child, level + 1);
  }
  lines.push(`${indent}},`);
}

export function generateTypes(schema: Schema): string {
  const eventNames = Object.keys(schema.events);
  const lines: string[] = ["// @generated by @alyt/codegen — do not edit manually", ""];

  lines.push(
    `export type AnalyticsEventName =\n\t| ${eventNames.map((n) => `"${n}"`).join("\n\t| ")};`,
  );
  lines.push("");
  lines.push("export interface AnalyticsEventMap {");
  for (const [name, def] of Object.entries(schema.events)) {
    if (def?.description) {
      lines.push(`\t/** ${def.description} */`);
    }
    const params = normalizeParams(name, def?.params);
    if (params.length > 0) {
      const fields = params
        .map((param) => `${propertyKey(param.name)}: ${param.type}`)
        .join("; ");
      lines.push(`\t${propertyKey(name)}: { ${fields} };`);
    } else {
      lines.push(`\t${propertyKey(name)}: Record<string, never>;`);
    }
  }
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

export function generateTracker(schema: Schema): string {
  const usesHash = schemaUsesHash(schema);
  const root = createTrackerNamespace();
  for (const [name, def] of Object.entries(schema.events)) {
    insertTrackerEvent(root, name, def);
  }

  const lines: string[] = [
    "// @generated by @alyt/codegen — do not edit manually",
    ...(usesHash ? ['import { sha256Hex } from "@alyt/core";'] : []),
    'import type { AnalyticsClient, TrackOptions } from "@alyt/core";',
    "",
    "export function createTracker(client: AnalyticsClient) {",
    "\treturn {",
  ];

  for (const [key, entry] of root.children) {
    emitTrackerEntry(lines, key, entry, 2);
  }

  lines.push("\t};");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

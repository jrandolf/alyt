import { describe, expect, it } from "vitest";

import { sha256Hex } from "./hash.js";

describe("sha256Hex", () => {
  it("matches standard SHA-256 hex vectors", async () => {
    await expect(sha256Hex("")).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    await expect(sha256Hex("abc")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("hashes exact input strings without normalization", async () => {
    await expect(sha256Hex("email@example.com")).resolves.not.toBe(
      await sha256Hex("Email@example.com"),
    );
    await expect(sha256Hex("email@example.com")).resolves.not.toBe(
      await sha256Hex(" email@example.com "),
    );
  });
});

import { describe, expect, it } from "vitest";
import { normalizeEmail, slugify, isAdminRole } from "./auth";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });

  it("leaves an already-normalized email unchanged", () => {
    expect(normalizeEmail("test@example.com")).toBe("test@example.com");
  });
});

describe("slugify", () => {
  it("lowercases and replaces non-alphanumeric runs with a single hyphen", () => {
    expect(slugify("Organic Rose Face Cream!")).toBe("organic-rose-face-cream");
  });

  it("strips leading/trailing hyphens produced by punctuation at the edges", () => {
    expect(slugify("  --Hello World--  ")).toBe("hello-world");
  });

  it("collapses multiple separators into one", () => {
    expect(slugify("a___b   c---d")).toBe("a-b-c-d");
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("isAdminRole", () => {
  it("is true only for the exact string 'ADMIN'", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("BRAND")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });
});

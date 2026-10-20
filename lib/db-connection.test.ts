import { describe, expect, it } from "vitest";
import { isLoopbackHost, resolveSslConfig } from "./db-connection";

// Deliberately generic/example hostnames below, not this project's real
// Supabase project reference — this is committed test code, so it stays
// infrastructure-detail-free regardless of secrecy level.

describe("isLoopbackHost", () => {
  it("is true for localhost and 127.0.0.1, with any credentials/port/params", () => {
    expect(isLoopbackHost("postgresql://ci:ci@localhost:5432/ci")).toBe(true);
    expect(isLoopbackHost("postgresql://user:pass@127.0.0.1:5432/db?sslmode=disable")).toBe(true);
  });

  it("is true for IPv6 loopback forms", () => {
    expect(isLoopbackHost("postgresql://user:pass@[::1]:5432/db")).toBe(true);
  });

  it("is case-insensitive (URL hostname parsing lowercases automatically)", () => {
    expect(isLoopbackHost("postgresql://user:pass@LOCALHOST:5432/db")).toBe(true);
  });

  it("is false for a real-shaped Supabase pooler hostname", () => {
    expect(isLoopbackHost("postgresql://user:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true")).toBe(
      false,
    );
  });

  it("is false for a real-shaped Supabase direct-connection hostname", () => {
    expect(isLoopbackHost("postgresql://user:pass@db.example.supabase.co:5432/postgres?sslmode=require")).toBe(false);
  });

  it("is false for any other remote host, including ones that merely contain 'localhost' as a substring", () => {
    expect(isLoopbackHost("postgresql://user:pass@db.example.com:5432/db")).toBe(false);
    expect(isLoopbackHost("postgresql://user:pass@localhost.evil.example.com:5432/db")).toBe(false);
    expect(isLoopbackHost("postgresql://user:pass@notlocalhost:5432/db")).toBe(false);
  });

  it("fails closed (treats as non-loopback) for a malformed connection string", () => {
    expect(isLoopbackHost("not a url")).toBe(false);
    expect(isLoopbackHost("")).toBe(false);
  });
});

describe("resolveSslConfig", () => {
  it("disables SSL only for loopback hosts", () => {
    expect(resolveSslConfig("postgresql://ci:ci@localhost:5432/ci")).toBe(false);
  });

  it("requires certificate validation (rejectUnauthorized: true) for a real Supabase host — never silently disabled", () => {
    expect(resolveSslConfig("postgresql://user:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres")).toEqual({
      rejectUnauthorized: true,
    });
  });

  it("requires certificate validation for any other non-loopback host", () => {
    expect(resolveSslConfig("postgresql://user:pass@some-other-host.example.com:5432/db")).toEqual({
      rejectUnauthorized: true,
    });
  });

  it("fails closed to requiring certificate validation for a malformed connection string", () => {
    expect(resolveSslConfig("not a url")).toEqual({ rejectUnauthorized: true });
  });
});

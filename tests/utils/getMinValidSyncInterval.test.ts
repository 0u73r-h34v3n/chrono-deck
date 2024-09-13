import { describe, expect, it } from "bun:test";
import { getMinValidSyncInterval } from "@src/utils/number";

describe("getMinValidSyncInterval", () => {
  it("should return 1 if syncInterval is null", () => {
    const result = getMinValidSyncInterval(null);
    expect(result).toBe(1);
  });

  it("should return 1 if syncInterval is undefined", () => {
    const result = getMinValidSyncInterval(undefined);
    expect(result).toBe(1);
  });

  it("should return the syncInterval when it is a positive number", () => {
    const result = getMinValidSyncInterval(5);
    expect(result).toBe(5);
  });

  it("should return 1 if syncInterval is a negative number", () => {
    const result = getMinValidSyncInterval(-5);
    expect(result).toBe(1);
  });

  it("should return 1 if syncInterval is 0", () => {
    const result = getMinValidSyncInterval(0);
    expect(result).toBe(1);
  });

  it("should parse string syncInterval to a number when valid", () => {
    const result = getMinValidSyncInterval("10");
    expect(result).toBe(10);
  });

  it("should return 1 if syncInterval is a string and not a valid number", () => {
    const result = getMinValidSyncInterval("invalid");
    expect(result).toBe(1);
  });

  it("should return 1 if syncInterval is a string representing a negative number", () => {
    const result = getMinValidSyncInterval("-5");
    expect(result).toBe(1);
  });

  it("should return 1 if syncInterval is an empty string", () => {
    const result = getMinValidSyncInterval("");
    expect(result).toBe(1);
  });

  it("should handle numbers passed as strings correctly", () => {
    const result = getMinValidSyncInterval("3");
    expect(result).toBe(3);
  });

  it("should handle numbers passed as float correctly", () => {
    const result = getMinValidSyncInterval(5.421);
    expect(result).toBe(5);
  });
});

import { describe, expect, it } from "vitest";
import { buildPaginatedResult, MAX_PAGE_SIZE, normalizePagination, toRange } from "../pagination";

describe("normalizePagination", () => {
  it("applies defaults when nothing is passed", () => {
    expect(normalizePagination({})).toEqual({ page: 1, pageSize: 24 });
  });

  it("clamps page below 1 and pageSize above the max", () => {
    expect(normalizePagination({ page: -5, pageSize: 99999 })).toEqual({ page: 1, pageSize: MAX_PAGE_SIZE });
  });

  it("floors non-integer inputs", () => {
    expect(normalizePagination({ page: 2.9, pageSize: 10.9 })).toEqual({ page: 2, pageSize: 10 });
  });
});

describe("toRange", () => {
  it("computes an inclusive [from, to] range for a page", () => {
    expect(toRange(1, 24)).toEqual({ from: 0, to: 23 });
    expect(toRange(2, 24)).toEqual({ from: 24, to: 47 });
  });
});

describe("buildPaginatedResult", () => {
  it("flags hasMore when more pages remain", () => {
    const result = buildPaginatedResult([1, 2], 50, 1, 24);
    expect(result.hasMore).toBe(true);
  });

  it("flags hasMore false on the last page", () => {
    const result = buildPaginatedResult([1, 2], 26, 2, 24);
    expect(result.hasMore).toBe(false);
  });
});

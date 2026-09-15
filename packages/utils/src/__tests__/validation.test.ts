import { describe, expect, it } from "vitest";
import { collectionEntryInputSchema, signInSchema, signUpSchema, usernameSchema } from "../validation";

describe("signUpSchema", () => {
  it("accepts a valid signup payload", () => {
    const result = signUpSchema.safeParse({
      email: "player@example.com",
      password: "supersecret",
      username: "op_collector",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = signUpSchema.safeParse({
      email: "player@example.com",
      password: "short",
      username: "op_collector",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "supersecret",
      username: "op_collector",
    });
    expect(result.success).toBe(false);
  });
});

describe("usernameSchema", () => {
  it("rejects usernames with spaces or symbols", () => {
    expect(usernameSchema.safeParse("bad name!").success).toBe(false);
  });

  it("accepts alphanumeric + underscore usernames", () => {
    expect(usernameSchema.safeParse("valid_name_42").success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("requires a non-empty password", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("collectionEntryInputSchema", () => {
  it("applies quantity/condition defaults", () => {
    const result = collectionEntryInputSchema.parse({
      cardPrintingId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.quantity).toBe(1);
    expect(result.keepQuantity).toBe(1);
    expect(result.condition).toBe("NEAR_MINT");
    expect(result.availableForTrade).toBe(false);
  });

  it("rejects a negative quantity", () => {
    const result = collectionEntryInputSchema.safeParse({
      cardPrintingId: "123e4567-e89b-12d3-a456-426614174000",
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });
});

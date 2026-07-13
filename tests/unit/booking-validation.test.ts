import { describe, it, expect } from "vitest";
import { BookingSchema, validateBookingDateRange } from "@/lib/booking-validation";

describe("BookingSchema", () => {
  const base = {
    name: "علی رضایی",
    phone: "09121234567",
    consoleType: "ps5",
    packageType: "daily",
    startDate: "2026-08-01",
    endDate: "2026-08-03",
  };

  it("accepts a valid booking", () => {
    expect(() => BookingSchema.parse(base)).not.toThrow();
  });

  it("rejects a short name", () => {
    expect(() => BookingSchema.parse({ ...base, name: "ا" })).toThrow();
  });

  it("rejects a short phone", () => {
    expect(() => BookingSchema.parse({ ...base, phone: "123" })).toThrow();
  });

  it("trims whitespace from name and phone", () => {
    const p = BookingSchema.parse({ ...base, name: "  علی  ", phone: "  09121234567  " });
    expect(p.name).toBe("علی");
    expect(p.phone).toBe("09121234567");
  });

  it("rejects notes over 1000 chars", () => {
    expect(() => BookingSchema.parse({ ...base, notes: "x".repeat(1001) })).toThrow();
  });
});

describe("validateBookingDateRange", () => {
  const today = new Date(2026, 6, 13); // 2026-07-13

  it("accepts today onward", () => {
    expect(validateBookingDateRange("2026-07-13", "2026-07-15", today)).toBeNull();
  });

  it("flags past start date", () => {
    expect(validateBookingDateRange("2026-07-10", "2026-07-15", today)).toBe("past_date");
  });

  it("flags end before start", () => {
    expect(validateBookingDateRange("2026-07-20", "2026-07-15", today)).toBe("invalid_dates");
  });

  it("flags unparseable dates", () => {
    expect(validateBookingDateRange("not-a-date", "2026-07-15", today)).toBe("invalid_dates");
  });
});

import { z } from "zod";

/**
 * Pure client- and server-safe validation for a booking submission.
 * Extracted so it can be unit-tested without pulling in server-fn runtime.
 */
export const BookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  consoleType: z.string().min(1),
  packageType: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

/** Returns null if the date range is valid, otherwise a diagnostic code. */
export function validateBookingDateRange(
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): "invalid_dates" | "past_date" | null {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "invalid_dates";
  if (end < start) return "invalid_dates";
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (start < todayStart) return "past_date";
  return null;
}

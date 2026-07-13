import { createHmac, timingSafeEqual } from "crypto";

/**
 * HMAC-sign a booking id so only the booker (who receives the token at
 * creation time) can fetch the .ics for that booking. Uses BOOKING_ICAL_SECRET.
 */
function key(): string {
  const k = process.env.BOOKING_ICAL_SECRET;
  if (!k) throw new Error("BOOKING_ICAL_SECRET is not configured");
  return k;
}

export function signBookingId(id: string): string {
  return createHmac("sha256", key()).update(id).digest("hex");
}

export function verifyBookingToken(id: string, token: string): boolean {
  if (!token || token.length !== 64) return false;
  let expected: string;
  try {
    expected = signBookingId(id);
  } catch {
    return false;
  }
  const a = Buffer.from(token, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}
"use server";

import { z } from "zod";
import { createPendingBooking, getAvailability, SlotConflictError } from "@/lib/booking";
import { sendOtp, isTwilioConfigured } from "@/lib/twilio";

const startBookingSchema = z.object({
  pitchId: z.string().min(1),
  startsAt: z.string(),
  durationHours: z.coerce.number().min(1).max(6),
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export type StartBookingResult =
  | { ok: true; bookingId: string; otpRequired: boolean; otpDevBypass?: boolean }
  | { ok: false; error: "VALIDATION" | "SLOT_CONFLICT" | "PITCH_NOT_FOUND" | "OTP_FAILED"; message?: string };

export async function startBookingAction(input: unknown): Promise<StartBookingResult> {
  const parsed = startBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION", message: parsed.error.message };

  try {
    const booking = await createPendingBooking({
      pitchId: parsed.data.pitchId,
      startsAt: new Date(parsed.data.startsAt),
      durationHours: parsed.data.durationHours,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || undefined,
    });

    if (isTwilioConfigured()) {
      try {
        await sendOtp(parsed.data.customerPhone);
        return { ok: true, bookingId: booking.id, otpRequired: true };
      } catch (e) {
        console.error("OTP send failed:", e);
        return { ok: false, error: "OTP_FAILED" };
      }
    }
    // Dev bypass: skip OTP if Twilio isn't configured
    return { ok: true, bookingId: booking.id, otpRequired: false, otpDevBypass: true };
  } catch (err) {
    if (err instanceof SlotConflictError) return { ok: false, error: "SLOT_CONFLICT" };
    if (err instanceof Error && err.message === "PITCH_NOT_FOUND")
      return { ok: false, error: "PITCH_NOT_FOUND" };
    console.error(err);
    return { ok: false, error: "VALIDATION", message: "Unexpected" };
  }
}

export async function getDayAvailability(pitchId: string, dateISO: string) {
  const slots = await getAvailability(pitchId, new Date(dateISO));
  return slots.map((s) => ({
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    available: s.available,
  }));
}

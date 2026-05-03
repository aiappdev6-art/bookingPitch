import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkOtp, isTwilioConfigured } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  const { bookingId, code } = await req.json();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  let verified = false;
  if (isTwilioConfigured()) {
    try {
      verified = await checkOtp(booking.customerPhone, code);
    } catch (e) {
      console.error(e);
    }
  } else {
    // Dev bypass: any 6-digit code works
    verified = /^\d{6}$/.test(code);
  }

  if (!verified) return NextResponse.json({ ok: false, error: "INVALID_CODE" }, { status: 400 });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { phoneVerified: true },
  });

  return NextResponse.json({ ok: true });
}

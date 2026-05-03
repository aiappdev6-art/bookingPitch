import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtp, isTwilioConfigured } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  if (!isTwilioConfigured()) return NextResponse.json({ ok: true, dev: true });
  try {
    await sendOtp(booking.customerPhone);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

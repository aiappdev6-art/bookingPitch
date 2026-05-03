import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { pitch: true },
  });
  if (!booking) return NextResponse.json({ ok: false }, { status: 404 });
  if (!booking.phoneVerified)
    return NextResponse.json({ ok: false, error: "PHONE_NOT_VERIFIED" }, { status: 400 });

  if (!isStripeConfigured()) {
    // No Stripe configured — auto-confirm for dev
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED", expiresAt: null },
    });
    return NextResponse.json({ ok: true, url: null, dev: true });
  }

  const origin = req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "kwd",
          unit_amount: Math.round(Number(booking.totalPrice) * 1000),
          product_data: {
            name: booking.pitch.name,
            description: `${booking.durationHours}h booking`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${origin}/checkout/success?booking=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?booking=${booking.id}`,
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ ok: true, url: session.url });
}

import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/resend";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ ok: false }, { status: 400 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("Stripe webhook signature failed", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED", expiresAt: null },
        include: { pitch: true },
      });
      if (booking.customerEmail) {
        await sendBookingConfirmation({
          to: booking.customerEmail,
          customerName: booking.customerName,
          pitchName: booking.pitch.name,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          totalPrice: booking.totalPrice.toString(),
          bookingId: booking.id,
        }).catch((e) => console.error("Email failed", e));
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "EXPIRED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { bookingId, locale } = await req.json();
  const localePrefix = locale === "ar" || locale === "en" ? `/${locale}` : "";
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { pitch: true },
  });
  if (!booking) return NextResponse.json({ ok: false }, { status: 404 });
  if (!booking.phoneVerified)
    return NextResponse.json({ ok: false, error: "PHONE_NOT_VERIFIED" }, { status: 400 });

  // Dev fallback: if MyFatoorah isn't reachable through Supabase, skip payment.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED", expiresAt: null },
    });
    return NextResponse.json({ ok: true, paymentUrl: null, dev: true });
  }

  const origin = req.nextUrl.origin;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: {
      amount: Number(booking.totalPrice),
      currency: "KWD",
      customerName: booking.customerName,
      customerEmail: booking.customerEmail ?? undefined,
      customerPhone: booking.customerPhone,
      orderId: booking.id,
      callbackUrl: `${origin}${localePrefix}/payment/callback`,
      errorUrl: `${origin}${localePrefix}/payment/callback?error=1`,
    },
  });

  if (error || !data?.paymentUrl) {
    console.error("create-payment failed:", error, data);
    return NextResponse.json(
      { ok: false, error: "PAYMENT_INIT_FAILED" },
      { status: 502 },
    );
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripeSessionId: String(data.invoiceId ?? "") || null },
  });

  return NextResponse.json({ ok: true, paymentUrl: data.paymentUrl, invoiceId: data.invoiceId });
}

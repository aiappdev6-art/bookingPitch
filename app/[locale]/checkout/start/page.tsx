import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function CheckoutStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const { locale } = await params;
  const { booking: bookingId } = await searchParams;
  setRequestLocale(locale);

  if (!bookingId) redirect(`/${locale}`);

  // OTP was bypassed (Twilio not configured) — mark phone as verified so the
  // payment route accepts it, but keep status PENDING until MyFatoorah confirms.
  const booking = await prisma.booking
    .update({
      where: { id: bookingId },
      data: { phoneVerified: true },
      include: { pitch: true },
    })
    .catch(() => null);

  if (!booking) redirect(`/${locale}`);

  const supabase = createSupabaseAdminClient();
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = host ? `${proto}://${host}` : "";

  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: {
      amount: Number(booking.totalPrice),
      currency: "KWD",
      customerName: booking.customerName,
      customerEmail: booking.customerEmail ?? undefined,
      customerPhone: booking.customerPhone,
      orderId: booking.id,
      callbackUrl: `${origin}/${locale}/payment/callback`,
      errorUrl: `${origin}/${locale}/payment/callback?error=1`,
    },
  });

  if (error || !data?.paymentUrl) {
    console.error("create-payment failed:", error, data);
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="card p-6">
          <h1 className="text-xl font-bold mb-3">Payment init failed</h1>
          <p className="text-sm mb-2">
            The MyFatoorah payment session could not be created. Details below
            (also visible in Vercel + Supabase logs):
          </p>
          <pre className="text-xs bg-black/5 p-3 rounded overflow-auto whitespace-pre-wrap">
{JSON.stringify(
  {
    invokeError: error?.message ?? error ?? null,
    response: data ?? null,
    supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKeySet: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
  null,
  2,
)}
          </pre>
        </div>
      </div>
    );
  }

  await prisma.booking
    .update({
      where: { id: bookingId },
      data: { stripeSessionId: String(data.invoiceId ?? "") || null },
    })
    .catch(() => null);

  redirect(data.paymentUrl);
}

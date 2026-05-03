import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

// For dev mode (no OTP/Stripe): instantly confirm and redirect to success.
export default async function CheckoutStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const { locale } = await params;
  const { booking } = await searchParams;
  setRequestLocale(locale);
  if (booking) {
    await prisma.booking
      .update({
        where: { id: booking },
        data: { status: "CONFIRMED", phoneVerified: true, expiresAt: null },
      })
      .catch(() => null);
    redirect(`/${locale}/checkout/success?booking=${booking}`);
  }
  redirect(`/${locale}`);
}

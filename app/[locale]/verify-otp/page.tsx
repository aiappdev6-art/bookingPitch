import { setRequestLocale } from "next-intl/server";
import { VerifyOtpForm } from "@/components/booking/verify-otp-form";

export default async function VerifyOtpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ booking?: string; phone?: string }>;
}) {
  const { locale } = await params;
  const { booking, phone } = await searchParams;
  setRequestLocale(locale);
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <VerifyOtpForm bookingId={booking || ""} phone={phone || ""} />
    </div>
  );
}

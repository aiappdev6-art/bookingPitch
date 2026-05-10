import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function PaymentCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ paymentId?: string; Id?: string; error?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const paymentId = sp.paymentId ?? sp.Id;

  if (sp.error || !paymentId) {
    return <FailureCard message={t("Common.error")} locale={locale} />;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.functions.invoke("verify-payment", {
    body: { paymentId },
  });

  if (error || !data) {
    return <FailureCard message={t("Common.error")} locale={locale} />;
  }

  const { paid, status, orderId } = data as {
    paid: boolean;
    status: string;
    orderId?: string;
  };

  if (paid && orderId) {
    await prisma.booking
      .update({
        where: { id: orderId },
        data: { status: "CONFIRMED", expiresAt: null },
      })
      .catch(() => null);
    redirect(`/${locale}/checkout/success?booking=${orderId}`);
  }

  if (orderId) {
    await prisma.booking
      .update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      })
      .catch(() => null);
  }

  return <FailureCard message={`${t("Common.error")}: ${status ?? "FAILED"}`} locale={locale} />;
}

function FailureCard({ message, locale }: { message: string; locale: string }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6 text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Payment failed</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">{message}</p>
        <Link href="/" locale={locale as "ar" | "en"} className="btn-primary inline-block">
          Back
        </Link>
      </div>
    </div>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6 text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">{t("Booking.cancelled")}</h1>
        <Link href="/pitches" className="btn-primary mt-6 inline-block">
          {t("Common.tryAgain")}
        </Link>
      </div>
    </div>
  );
}

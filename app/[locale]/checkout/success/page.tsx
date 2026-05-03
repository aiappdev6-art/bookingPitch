import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatKWD } from "@/lib/format";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const { locale } = await params;
  const { booking: bookingId } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";

  const booking = bookingId
    ? await prisma.booking
        .findUnique({ where: { id: bookingId }, include: { pitch: true } })
        .catch(() => null)
    : null;

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-bold mb-2">{t("Booking.thankYou")}</h1>
        {booking && (
          <div className="text-sm text-[var(--muted-foreground)] space-y-1 mt-4">
            <div>
              {t("Admin.pitch")}: <strong>{booking.pitch.name}</strong>
            </div>
            <div>
              {t("Admin.date")}: {formatDateTime(booking.startsAt, localeTag)}
            </div>
            <div>
              {t("Booking.total")}: {formatKWD(booking.totalPrice.toString(), localeTag)}
            </div>
            <div className="pt-2">
              {t("Booking.bookingId")}: <code>{booking.id}</code>
            </div>
          </div>
        )}
        <Link href="/" className="btn-primary mt-6 inline-block">
          {t("Common.back")}
        </Link>
      </div>
    </div>
  );
}

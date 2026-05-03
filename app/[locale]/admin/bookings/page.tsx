import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatKWD, formatDateTime } from "@/lib/format";

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";
  const bookings = await prisma.booking.findMany({
    orderBy: { startsAt: "desc" },
    take: 200,
    include: { pitch: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("bookings")}</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-start p-3">{t("customer")}</th>
              <th className="text-start p-3">{t("pitch")}</th>
              <th className="text-start p-3">{t("date")}</th>
              <th className="text-start p-3">{t("amount")}</th>
              <th className="text-start p-3">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-[var(--border)]">
                <td className="p-3">
                  <div>{b.customerName}</div>
                  <div className="text-xs text-[var(--muted-foreground)]" dir="ltr">
                    {b.customerPhone}
                  </div>
                </td>
                <td className="p-3">{b.pitch.name}</td>
                <td className="p-3">{formatDateTime(b.startsAt, localeTag)}</td>
                <td className="p-3">{formatKWD(b.totalPrice.toString(), localeTag)}</td>
                <td className="p-3">{b.status}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

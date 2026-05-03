import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatKWD, formatDateTime } from "@/lib/format";
import { startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = subDays(todayStart, 7);
  const monthStart = startOfMonth(now);

  const [todayCount, weekRevenue, monthRevenue, recent] = await Promise.all([
    prisma.booking.count({
      where: { startsAt: { gte: todayStart, lte: todayEnd }, status: "CONFIRMED" },
    }).catch(() => 0),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { startsAt: { gte: weekStart }, status: "CONFIRMED" },
    }).catch(() => ({ _sum: { totalPrice: null } })),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { startsAt: { gte: monthStart }, status: "CONFIRMED" },
    }).catch(() => ({ _sum: { totalPrice: null } })),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { pitch: true },
    }).catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Stat label={t("todayBookings")} value={String(todayCount)} />
        <Stat
          label={t("weekRevenue")}
          value={formatKWD(weekRevenue._sum.totalPrice?.toString() ?? "0", localeTag)}
        />
        <Stat
          label={t("monthRevenue")}
          value={formatKWD(monthRevenue._sum.totalPrice?.toString() ?? "0", localeTag)}
        />
      </div>

      <h2 className="text-lg font-semibold mb-3">{t("recentBookings")}</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)] text-start">
            <tr>
              <th className="text-start p-3">{t("customer")}</th>
              <th className="text-start p-3">{t("pitch")}</th>
              <th className="text-start p-3">{t("date")}</th>
              <th className="text-start p-3">{t("amount")}</th>
              <th className="text-start p-3">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => (
              <tr key={b.id} className="border-t border-[var(--border)]">
                <td className="p-3">{b.customerName}</td>
                <td className="p-3">{b.pitch.name}</td>
                <td className="p-3">{formatDateTime(b.startsAt, localeTag)}</td>
                <td className="p-3">{formatKWD(b.totalPrice.toString(), localeTag)}</td>
                <td className="p-3">{b.status}</td>
              </tr>
            ))}
            {recent.length === 0 && (
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

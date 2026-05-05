import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatKWD, formatDateTime } from "@/lib/format";
import { startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";
import { StatCard } from "@/components/admin/stat-card";
import { Reveal } from "@/components/ui/reveal";

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

  const weekN = Number(weekRevenue._sum.totalPrice ?? 0);
  const monthN = Number(monthRevenue._sum.totalPrice ?? 0);

  return (
    <div>
      <Reveal>
        <h1 className="text-3xl font-bold mb-1">
          <span className="gradient-text">{t("dashboard")}</span>
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          {formatDateTime(now, localeTag)}
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <StatCard
          label={t("todayBookings")}
          numeric={todayCount}
          icon="📅"
          delay={0}
        />
        <StatCard
          label={t("weekRevenue")}
          numeric={weekN}
          decimals={3}
          suffix=" KWD"
          icon="💰"
          delay={0.1}
        />
        <StatCard
          label={t("monthRevenue")}
          numeric={monthN}
          decimals={3}
          suffix=" KWD"
          icon="📊"
          delay={0.2}
        />
      </div>

      <Reveal>
        <h2 className="text-lg font-semibold mb-3">{t("recentBookings")}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="text-start p-3 font-semibold">{t("customer")}</th>
                <th className="text-start p-3 font-semibold">{t("pitch")}</th>
                <th className="text-start p-3 font-semibold">{t("date")}</th>
                <th className="text-start p-3 font-semibold">{t("amount")}</th>
                <th className="text-start p-3 font-semibold">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--muted)]/50 transition"
                >
                  <td className="p-3">{b.customerName}</td>
                  <td className="p-3">{b.pitch.name}</td>
                  <td className="p-3">{formatDateTime(b.startsAt, localeTag)}</td>
                  <td className="p-3 font-semibold">
                    {formatKWD(b.totalPrice.toString(), localeTag)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 ring-amber-200",
    CANCELLED: "bg-rose-100 text-rose-700 ring-rose-200",
    EXPIRED: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? styles.PENDING
      }`}
    >
      {status}
    </span>
  );
}

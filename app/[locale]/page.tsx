import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PitchCard } from "@/components/booking/pitch-card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const pitches = await prisma.pitch
    .findMany({ where: { isActive: true }, take: 6, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("Home.heroTitle")}
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {t("Home.heroSubtitle")}
          </p>
          <Link
            href="/pitches"
            className="inline-block bg-white text-emerald-700 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50"
          >
            {t("Home.browse")}
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">{t("Home.featured")}</h2>
        {pitches.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">{t("Pitches.noPitches")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pitches.map((p) => (
              <PitchCard key={p.id} pitch={p} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PitchCard } from "@/components/booking/pitch-card";

export default async function PitchesListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pitches");
  const pitches = await prisma.pitch
    .findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      {pitches.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">{t("noPitches")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pitches.map((p) => (
            <PitchCard key={p.id} pitch={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

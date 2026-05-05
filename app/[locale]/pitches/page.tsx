import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PitchCard } from "@/components/booking/pitch-card";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/ui/reveal";

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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Reveal>
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">{t("title")}</span>
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-[var(--primary)] to-transparent rounded-full mb-8" />
      </Reveal>
      {pitches.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">{t("noPitches")}</p>
      ) : (
        <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pitches.map((p) => (
            <StaggerItem key={p.id}>
              <PitchCard pitch={p} locale={locale} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}

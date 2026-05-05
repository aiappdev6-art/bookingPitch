import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PitchCard } from "@/components/booking/pitch-card";
import { Hero } from "@/components/layout/hero";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/ui/reveal";

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
      <Hero />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-24">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <span className="eyebrow mb-3">Selection · 2026</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.05] mt-2">
                <span className="gradient-text">{t("Home.featured")}</span>
                <span className="h-display-italic font-normal text-[var(--muted-foreground)]">
                  .
                </span>
              </h2>
            </div>
            <div className="hidden md:block h-[2px] flex-1 max-w-40 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-transparent rounded-full" />
          </div>
        </Reveal>

        {pitches.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">{t("Pitches.noPitches")}</p>
        ) : (
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pitches.map((p) => (
              <StaggerItem key={p.id}>
                <PitchCard pitch={p} locale={locale} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24">
        <Reveal>
          <div className="text-center mb-12">
            <span className="eyebrow justify-center">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              From kick-off to <span className="h-display-italic font-normal text-[var(--primary)]">final whistle</span>
            </h2>
          </div>
        </Reveal>

        <StaggerChildren className="relative grid sm:grid-cols-3 gap-5">
          {/* Connecting dotted line — desktop only */}
          <div
            aria-hidden
            className="hidden sm:block absolute top-12 inset-x-12 h-px"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--border) 50%, transparent 50%)",
              backgroundSize: "10px 1px",
            }}
          />
          <StaggerItem>
            <FeatureCard
              step="01"
              icon="🗓️"
              title={t("Booking.selectDate")}
              desc={t("Home.heroSubtitle")}
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              step="02"
              icon="⚡"
              title={t("Booking.verifyPhone")}
              desc={t("Booking.otpSent", { phone: "" }).replace("{phone}", "")}
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              step="03"
              icon="🔒"
              title={t("Booking.proceedToPayment")}
              desc={t("Booking.confirmed")}
            />
          </StaggerItem>
        </StaggerChildren>
      </section>
    </div>
  );
}

function FeatureCard({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group card card-hover relative p-6 pt-10 overflow-hidden">
      {/* Step number — editorial display serif */}
      <div className="absolute -top-2 end-4 h-display-italic text-7xl text-[var(--primary)]/10 font-bold pointer-events-none select-none transition-colors duration-500 group-hover:text-[var(--primary)]/20">
        {step}
      </div>
      {/* Icon medallion */}
      <div className="relative inline-grid place-items-center w-12 h-12 rounded-2xl mb-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white text-2xl shadow-lg shadow-emerald-200 ring-1 ring-inset ring-white/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-1 relative">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 relative">
        {desc}
      </p>
    </div>
  );
}

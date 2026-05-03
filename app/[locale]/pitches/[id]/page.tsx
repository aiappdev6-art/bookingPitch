import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatKWD } from "@/lib/format";
import { BookingFlow } from "@/components/booking/booking-flow";

export default async function PitchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";

  const pitch = await prisma.pitch.findUnique({ where: { id } }).catch(() => null);
  if (!pitch || !pitch.isActive) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[var(--muted)] mb-3">
            {pitch.imageUrls[0] && (
              <Image
                src={pitch.imageUrls[0]}
                alt={pitch.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          {pitch.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {pitch.imageUrls.slice(1, 5).map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-[var(--muted)]"
                >
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{pitch.name}</h1>
          <div className="text-2xl text-[var(--primary)] font-bold mb-4">
            {formatKWD(pitch.pricePerHour.toString(), localeTag)}
            <span className="text-sm text-[var(--muted-foreground)] ms-1">
              {t("Pitches.perHour")}
            </span>
          </div>
          {pitch.description && (
            <p className="text-[var(--muted-foreground)] mb-4">{pitch.description}</p>
          )}
          <ul className="text-sm space-y-1 mb-6">
            {pitch.location && (
              <li>
                <strong>{t("Pitches.location")}:</strong> {pitch.location}
              </li>
            )}
            <li>
              <strong>{t("Pitches.capacity")}:</strong> {pitch.capacity}
            </li>
            <li>
              <strong>{t("Pitches.surface")}:</strong> {t(`Surface.${pitch.surface}`)}
            </li>
            <li>
              <strong>{t("Booking.selectSlot")}:</strong> {pitch.openingTime} – {pitch.closingTime}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <BookingFlow
          pitchId={pitch.id}
          pricePerHour={pitch.pricePerHour.toString()}
          locale={locale}
        />
      </div>
    </div>
  );
}

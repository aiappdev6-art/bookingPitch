import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { formatKWD } from "@/lib/format";
import type { Pitch } from "@prisma/client";

export async function PitchCard({
  pitch,
  locale,
}: {
  pitch: Pitch;
  locale: string;
}) {
  const t = await getTranslations();
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";
  const cover = pitch.imageUrls[0] || "/placeholder-pitch.jpg";
  return (
    <Link
      href={`/pitches/${pitch.id}`}
      className="card overflow-hidden hover:shadow-md transition block"
    >
      <div className="relative aspect-[16/10] bg-[var(--muted)]">
        <Image
          src={cover}
          alt={pitch.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold">{pitch.name}</h3>
          <span className="text-[var(--primary)] font-bold whitespace-nowrap">
            {formatKWD(pitch.pricePerHour.toString(), localeTag)}
          </span>
        </div>
        <div className="text-sm text-[var(--muted-foreground)] flex flex-wrap gap-x-3 gap-y-1">
          {pitch.location && <span>📍 {pitch.location}</span>}
          <span>👥 {pitch.capacity}</span>
          <span>🏟 {t(`Surface.${pitch.surface}`)}</span>
        </div>
      </div>
    </Link>
  );
}

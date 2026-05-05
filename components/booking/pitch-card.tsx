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
      className="card card-hover group block overflow-hidden"
    >
      <div className="relative aspect-[16/10] bg-[var(--muted)] overflow-hidden">
        <Image
          src={cover}
          alt={pitch.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover scale-[1.02] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.14]"
        />
        {/* dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        {/* hover wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
        {/* shine sweep */}
        <span className="card-shine absolute inset-0" aria-hidden />

        <div className="absolute top-3 end-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md shadow-lg ring-1 ring-black/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          {t(`Surface.${pitch.surface}`)}
        </div>

        <div className="absolute bottom-3 start-3 end-3 flex items-end justify-between text-white gap-3">
          <h3 className="font-bold text-lg drop-shadow-md leading-tight">
            {pitch.name}
          </h3>
          <span className="h-display text-xl font-bold drop-shadow-md whitespace-nowrap text-amber-200">
            {formatKWD(pitch.pricePerHour.toString(), localeTag)}
          </span>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {pitch.location && <span>📍 {pitch.location}</span>}
          <span>👥 {pitch.capacity}</span>
        </div>
        <span className="text-[var(--primary)] font-semibold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 rtl:translate-x-1 rtl:group-hover:translate-x-0 transition duration-300">
          {t("Pitches.viewDetails")} <span className="rtl:rotate-180 inline-block">→</span>
        </span>
      </div>
    </Link>
  );
}

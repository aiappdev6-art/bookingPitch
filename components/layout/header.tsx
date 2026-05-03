import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations();
  const otherLocale = locale === "ar" ? "en" : "ar";
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg text-[var(--primary)]">
          {t("Site.name")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-[var(--primary)]">
            {t("Nav.home")}
          </Link>
          <Link href="/pitches" className="hover:text-[var(--primary)]">
            {t("Nav.pitches")}
          </Link>
          <Link href="/admin" className="hover:text-[var(--primary)]">
            {t("Nav.admin")}
          </Link>
          <a
            href={`/${otherLocale}`}
            className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
          >
            {t("Nav.language")}
          </a>
        </nav>
      </div>
    </header>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollProgress } from "./scroll-progress";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations();
  const otherLocale = locale === "ar" ? "en" : "ar";
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-[var(--border)]/70">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-emerald-200/70 transition-transform duration-500 group-hover:rotate-[14deg] group-hover:scale-110">
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
            <span className="text-lg">⚽</span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="h-display-italic text-xl gradient-text">{t("Site.name")}</span>
            <span className="text-[0.62rem] tracking-[0.25em] uppercase text-[var(--muted-foreground)]">
              Kuwait
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/">{t("Nav.home")}</NavLink>
          <NavLink href="/pitches">{t("Nav.pitches")}</NavLink>
          <NavLink href="/admin">{t("Nav.admin")}</NavLink>
          <a
            href={`/${otherLocale}`}
            className="ms-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] hover:border-[var(--primary)] transition"
          >
            {t("Nav.language")}
          </a>
        </nav>
      </div>
      <ScrollProgress />
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition group"
    >
      {children}
      <span className="absolute bottom-1 start-3 end-3 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rtl:origin-right" />
    </Link>
  );
}

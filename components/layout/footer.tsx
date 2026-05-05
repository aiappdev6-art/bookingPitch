import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Site");
  return (
    <footer className="relative border-t border-[var(--border)] bg-white/60 backdrop-blur-sm">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent"
      />
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white text-xs">
            ⚽
          </span>
          <span className="h-display-italic text-base text-[var(--foreground)]">
            {t("name")}
          </span>
        </div>
        <span className="text-xs tracking-[0.18em] uppercase">
          © {new Date().getFullYear()} · Made in Kuwait
        </span>
      </div>
    </footer>
  );
}

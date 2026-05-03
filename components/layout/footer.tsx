import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Site");
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-[var(--muted-foreground)] text-center">
        © {new Date().getFullYear()} {t("name")}
      </div>
    </footer>
  );
}

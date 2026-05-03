import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const session = await auth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {session?.user?.role === "ADMIN" && (
        <nav className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-[var(--border)]">
          <Link href="/admin" className="font-semibold">
            {t("dashboard")}
          </Link>
          <Link href="/admin/pitches">{t("pitches")}</Link>
          <Link href="/admin/bookings">{t("bookings")}</Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: `/${locale}` });
            }}
            className="ms-auto"
          >
            <button type="submit" className="btn-outline text-sm">
              {t("logout")}
            </button>
          </form>
        </nav>
      )}
      {children}
    </div>
  );
}

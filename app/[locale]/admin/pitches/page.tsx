import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatKWD } from "@/lib/format";
import { DeletePitchButton } from "@/components/admin/delete-pitch-button";

export default async function AdminPitchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const localeTag = locale === "ar" ? "ar-KW" : "en-US";
  const pitches = await prisma.pitch.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("pitches")}</h1>
        <Link href="/admin/pitches/new" className="btn-primary">
          {t("newPitch")}
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-start p-3">{t("name")}</th>
              <th className="text-start p-3">{t("pricePerHour")}</th>
              <th className="text-start p-3">{t("capacity")}</th>
              <th className="text-start p-3">{t("surface")}</th>
              <th className="text-start p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pitches.map((p) => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{formatKWD(p.pricePerHour.toString(), localeTag)}</td>
                <td className="p-3">{p.capacity}</td>
                <td className="p-3">{p.surface}</td>
                <td className="p-3 text-end">
                  <Link
                    href={`/admin/pitches/${p.id}/edit`}
                    className="text-[var(--primary)] me-3"
                  >
                    {t("editPitch")}
                  </Link>
                  <DeletePitchButton id={p.id} />
                </td>
              </tr>
            ))}
            {pitches.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

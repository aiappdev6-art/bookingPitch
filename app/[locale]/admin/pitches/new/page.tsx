import { setRequestLocale } from "next-intl/server";
import { PitchForm } from "@/components/admin/pitch-form";

export default async function NewPitchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PitchForm mode="create" locale={locale} />;
}

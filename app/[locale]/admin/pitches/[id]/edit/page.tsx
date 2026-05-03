import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PitchForm } from "@/components/admin/pitch-form";

export default async function EditPitchPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const pitch = await prisma.pitch.findUnique({ where: { id } });
  if (!pitch) notFound();
  return (
    <PitchForm
      mode="edit"
      locale={locale}
      pitch={{
        id: pitch.id,
        name: pitch.name,
        description: pitch.description ?? "",
        pricePerHour: pitch.pricePerHour.toString(),
        capacity: pitch.capacity,
        openingTime: pitch.openingTime,
        closingTime: pitch.closingTime,
        slotDurationMinutes: pitch.slotDurationMinutes,
        location: pitch.location ?? "",
        surface: pitch.surface,
        imageUrls: pitch.imageUrls,
        isActive: pitch.isActive,
      }}
    />
  );
}

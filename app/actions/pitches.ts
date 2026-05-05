"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Surface } from "@prisma/client";

const pitchSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  pricePerHour: z.coerce.number().positive(),
  capacity: z.coerce.number().int().min(1).max(50),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.coerce.number().int().min(15).max(240),
  location: z.string().optional().default(""),
  surface: z.nativeEnum(Surface),
  imageUrls: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
});

export async function createPitchAction(input: unknown) {
  await requireAdmin();
  const data = pitchSchema.parse(input);
  const pitch = await prisma.pitch.create({ data });
  revalidatePath("/admin/pitches");
  revalidatePath("/pitches");
  return { ok: true, id: pitch.id };
}

export async function updatePitchAction(id: string, input: unknown) {
  await requireAdmin();
  const data = pitchSchema.parse(input);
  await prisma.pitch.update({ where: { id }, data });
  revalidatePath("/admin/pitches");
  revalidatePath("/pitches");
  revalidatePath(`/pitches/${id}`);
  return { ok: true };
}

export async function deletePitchAction(id: string) {
  await requireAdmin();
  await prisma.pitch.delete({ where: { id } });
  revalidatePath("/admin/pitches");
  revalidatePath("/pitches");
  return { ok: true };
}

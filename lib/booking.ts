import { prisma } from "@/lib/prisma";
import { BookingStatus, Prisma } from "@prisma/client";
import { addMinutes, parse, startOfDay, isBefore, addHours } from "date-fns";

export const PENDING_TTL_MINUTES = 15;

export type Slot = {
  startsAt: Date;
  endsAt: Date;
  available: boolean;
};

export function buildDaySlots(
  pitch: { openingTime: string; closingTime: string; slotDurationMinutes: number },
  date: Date
): { startsAt: Date; endsAt: Date }[] {
  const dayStart = startOfDay(date);
  const open = parse(pitch.openingTime, "HH:mm", dayStart);
  const close = parse(pitch.closingTime, "HH:mm", dayStart);
  const slots: { startsAt: Date; endsAt: Date }[] = [];
  let cursor = open;
  while (isBefore(addMinutes(cursor, pitch.slotDurationMinutes), close) ||
         +addMinutes(cursor, pitch.slotDurationMinutes) === +close) {
    const next = addMinutes(cursor, pitch.slotDurationMinutes);
    slots.push({ startsAt: cursor, endsAt: next });
    cursor = next;
  }
  return slots;
}

export async function getAvailability(pitchId: string, date: Date): Promise<Slot[]> {
  const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });
  if (!pitch) return [];
  const slots = buildDaySlots(pitch, date);
  if (slots.length === 0) return [];
  const dayStart = startOfDay(date);
  const dayEnd = addHours(dayStart, 24);
  const existing = await prisma.booking.findMany({
    where: {
      pitchId,
      startsAt: { gte: dayStart, lt: dayEnd },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      OR: [
        { status: BookingStatus.CONFIRMED },
        {
          status: BookingStatus.PENDING,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      ],
    },
    select: { startsAt: true, endsAt: true },
  });
  return slots.map((s) => ({
    ...s,
    available: !existing.some(
      (b) => b.startsAt < s.endsAt && b.endsAt > s.startsAt
    ),
  }));
}

export class SlotConflictError extends Error {
  constructor() {
    super("SLOT_CONFLICT");
    this.name = "SlotConflictError";
  }
}

export async function createPendingBooking(input: {
  pitchId: string;
  startsAt: Date;
  durationHours: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}) {
  const endsAt = addHours(input.startsAt, input.durationHours);
  const expiresAt = addMinutes(new Date(), PENDING_TTL_MINUTES);

  return prisma.$transaction(async (tx) => {
    const pitch = await tx.pitch.findUnique({ where: { id: input.pitchId } });
    if (!pitch || !pitch.isActive) throw new Error("PITCH_NOT_FOUND");

    const conflict = await tx.booking.findFirst({
      where: {
        pitchId: input.pitchId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startsAt: { lt: endsAt },
        endsAt: { gt: input.startsAt },
        OR: [
          { status: BookingStatus.CONFIRMED },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    if (conflict) throw new SlotConflictError();

    const totalPrice = new Prisma.Decimal(pitch.pricePerHour).mul(input.durationHours);

    return tx.booking.create({
      data: {
        pitchId: input.pitchId,
        startsAt: input.startsAt,
        endsAt,
        durationHours: input.durationHours,
        totalPrice,
        status: BookingStatus.PENDING,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        expiresAt,
      },
    });
  });
}

export async function expirePendingBookings() {
  return prisma.booking.updateMany({
    where: {
      status: BookingStatus.PENDING,
      expiresAt: { lt: new Date() },
    },
    data: { status: BookingStatus.EXPIRED },
  });
}

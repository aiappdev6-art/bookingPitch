-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "Surface" AS ENUM ('GRASS', 'TURF', 'INDOOR');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pitch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrls" TEXT[],
    "pricePerHour" DECIMAL(10,3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "openingTime" TEXT NOT NULL DEFAULT '08:00',
    "closingTime" TEXT NOT NULL DEFAULT '23:00',
    "slotDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "surface" "Surface" NOT NULL DEFAULT 'GRASS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "userId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "stripeSessionId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Booking_pitchId_startsAt_idx" ON "Booking"("pitchId", "startsAt");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

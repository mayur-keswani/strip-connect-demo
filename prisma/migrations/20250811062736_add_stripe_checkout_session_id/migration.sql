/*
  Warnings:

  - Added the required column `checkoutSessionId` to the `event_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_bookings" ADD COLUMN     "checkoutSessionId" TEXT NOT NULL;

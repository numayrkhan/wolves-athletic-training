/*
  Warnings:

  - You are about to drop the column `isBooked` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `availabilityId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_availabilityId_fkey";

-- DropIndex
DROP INDEX "Booking_availabilityId_key";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "isBooked";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "availabilityId",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

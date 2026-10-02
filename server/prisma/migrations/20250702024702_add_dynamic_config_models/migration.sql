-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('RECEIVED', 'CONTACTED', 'SERVICED');

-- CreateTable
CREATE TABLE "ServiceArea" (
    "zipCode" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("zipCode")
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "sessionCount" INTEGER NOT NULL,
    "pricePerSession" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("sessionCount")
);

-- CreateTable
CREATE TABLE "ServiceAreaRequest" (
    "id" SERIAL NOT NULL,
    "zipCode" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAreaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_zipCode_key" ON "ServiceArea"("zipCode");

-- CreateIndex
CREATE UNIQUE INDEX "PricingTier_sessionCount_key" ON "PricingTier"("sessionCount");

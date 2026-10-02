-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('PARQ', 'WAIVER');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'COMPLETED', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "LegalForm" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "FormType" NOT NULL,
    "status" "FormStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formData" JSONB NOT NULL,

    CONSTRAINT "LegalForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalForm_userId_type_key" ON "LegalForm"("userId", "type");

-- AddForeignKey
ALTER TABLE "LegalForm" ADD CONSTRAINT "LegalForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

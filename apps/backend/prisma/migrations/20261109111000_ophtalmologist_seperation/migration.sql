-- AlterTable
ALTER TABLE "LedgerTransaction" ADD COLUMN     "doctorId" TEXT;

-- CreateTable
CREATE TABLE "XrayOrder" (
    "id" TEXT NOT NULL,
    "patientsCount" INTEGER NOT NULL,
    "ledgerTransactionId" TEXT,

    CONSTRAINT "XrayOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

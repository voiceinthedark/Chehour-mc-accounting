/*
  Warnings:

  - A unique constraint covering the columns `[ledgerTransactionId]` on the table `XrayOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pricePerPatient` to the `XrayOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `XrayOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'XRAY_REVENUE';
ALTER TYPE "Category" ADD VALUE 'XRAY_EXPENSE';

-- AlterTable
ALTER TABLE "XrayOrder" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pricePerPatient" DECIMAL(20,2) NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(20,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "XrayOrder_ledgerTransactionId_key" ON "XrayOrder"("ledgerTransactionId");

-- AddForeignKey
ALTER TABLE "XrayOrder" ADD CONSTRAINT "XrayOrder_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

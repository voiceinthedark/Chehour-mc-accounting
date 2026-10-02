-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "revisionFee" DECIMAL(20,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MonthlyTally" ADD COLUMN     "revisionPatients" INTEGER NOT NULL DEFAULT 0;

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('PATIENT_FEE', 'SERVICE_FEE', 'DOCTOR_PAYOUT', 'LAB_COST', 'LAB_REVENUE', 'CHARITY_EXPENSE', 'GENERAL_EXPENSE');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "perPatientFee" DECIMAL(10,2) NOT NULL,
    "perVisitFee" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "doctorSplitPercent" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTally" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "regularPatients" INTEGER NOT NULL DEFAULT 0,
    "charityPatients" INTEGER NOT NULL DEFAULT 0,
    "isPaidOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MonthlyTally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyServiceLog" (
    "id" TEXT NOT NULL,
    "tallyId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "regularCount" INTEGER NOT NULL DEFAULT 0,
    "charityCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlyServiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(10,2) NOT NULL,
    "isOutflow" BOOLEAN NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientName" TEXT,
    "testName" TEXT NOT NULL,
    "labCost" DECIMAL(10,2) NOT NULL,
    "centerCharge" DECIMAL(10,2) NOT NULL,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTally_doctorId_month_year_key" ON "MonthlyTally"("doctorId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyTally" ADD CONSTRAINT "MonthlyTally_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyServiceLog" ADD CONSTRAINT "MonthlyServiceLog_tallyId_fkey" FOREIGN KEY ("tallyId") REFERENCES "MonthlyTally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyServiceLog" ADD CONSTRAINT "MonthlyServiceLog_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

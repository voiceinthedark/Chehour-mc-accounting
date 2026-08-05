-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('PERCENT', 'FLAT');

-- CreateTable
CREATE TABLE "DoctorServiceSplit" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "splitType" "SplitType" NOT NULL,
    "splitValue" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DoctorServiceSplit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorServiceSplit_doctorId_serviceId_key" ON "DoctorServiceSplit"("doctorId", "serviceId");

-- AddForeignKey
ALTER TABLE "DoctorServiceSplit" ADD CONSTRAINT "DoctorServiceSplit_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorServiceSplit" ADD CONSTRAINT "DoctorServiceSplit_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

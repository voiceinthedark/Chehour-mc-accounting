-- CreateTable
CREATE TABLE "DoctorPayoutSnapshot" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "financials" JSONB NOT NULL,
    "dataWarning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorPayoutSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorPayoutSnapshot_doctorId_month_year_key" ON "DoctorPayoutSnapshot"("doctorId", "month", "year");

-- AddForeignKey
ALTER TABLE "DoctorPayoutSnapshot" ADD CONSTRAINT "DoctorPayoutSnapshot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

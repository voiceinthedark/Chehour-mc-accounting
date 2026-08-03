// filepath: apps/backend/src/services/billingService.js

const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();

/**
 * Calculates a doctor's payout for a specific month.
 */
async function calculateMonthlyDoctorPayout(doctorId, year, month) {
  // 1. Fetch the aggregated monthly tally (one record per doctor/month/year)
  const tally = await prisma.monthlyTally.findUnique({
    where: {
      doctorId_month_year: { doctorId, month, year },
    },
    include: {
      doctor: true,
      serviceLogs: { include: { service: true } },
    },
  });

  if (!tally || tally.isPaidOut)
    return { totalOwed: "0.00", message: "No unpaid tally for this month." };

  const doctor = tally.doctor;
  const totalVisits = tally.totalVisits;

  let totalPatients = tally.regularPatients + tally.charityPatients;
  let servicePayout = new Decimal(0);
  let totalCharityCost = new Decimal(0);

  // 2. Track the charity cost for consultations
  if (tally.charityPatients > 0) {
    totalCharityCost = totalCharityCost.plus(
      new Decimal(doctor.perPatientFee).mul(tally.charityPatients),
    );
  }

  // 3. Process EKG, Echo, etc., for this month
  tally.serviceLogs.forEach((log) => {
    const totalServices = log.regularCount + log.charityCount;
    const serviceRevenue = new Decimal(log.service.price).mul(totalServices);

    // Add the doctor's split to their payout
    const doctorCut = serviceRevenue.mul(log.service.doctorSplitPercent);
    servicePayout = servicePayout.plus(doctorCut);

    // Track center's loss for charity services
    if (log.charityCount > 0) {
      totalCharityCost = totalCharityCost.plus(
        new Decimal(log.service.price).mul(log.charityCount),
      );
    }
  });

  // 4. Apply the Monthly Rule for Consultation Pay
  let consultationPay = new Decimal(0);
  let appliedRule = "";

  if (totalPatients < 5) {
    // Under 5 for the whole month -> Pay them per visit/day
    consultationPay = new Decimal(doctor.perVisitFee).mul(totalVisits);
    appliedRule = "PER_VISIT_FEE";
  } else {
    // 5 or more for the whole month -> Pay them per patient
    consultationPay = new Decimal(doctor.perPatientFee).mul(totalPatients);
    appliedRule = "PER_PATIENT_FEE";
  }

  // 5. Final Calculation
  const totalOwed = consultationPay.plus(servicePayout);

  return {
    doctorName: doctor.name,
    stats: {
      totalVisits,
      totalPatients,
      appliedRule,
    },
    financials: {
      consultationPay: consultationPay.toFixed(2),
      servicePay: servicePayout.toFixed(2),
      totalOwed: totalOwed.toFixed(2),
      charityCostToCenter: totalCharityCost.toFixed(2),
    },
  };
}

module.exports = {
  calculateMonthlyDoctorPayout,
};

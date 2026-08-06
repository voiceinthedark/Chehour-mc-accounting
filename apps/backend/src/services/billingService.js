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
      doctor: { include: { serviceSplits: true } },
      serviceLogs: { include: { service: true } },
    },
  });

  if (!tally || tally.isPaidOut)
    return { totalOwed: "0.00", message: "No unpaid tally for this month." };

  const doctor = tally.doctor;
  const totalVisits = tally.totalVisits;

  // Build a quick lookup of per-doctor service overrides
  const splitOverrides = new Map(
    doctor.serviceSplits.map((s) => [s.serviceId, s]),
  );

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
    const override = splitOverrides.get(log.serviceId);

    let doctorCut;
    if (override && override.splitType === "FLAT") {
      // Doctor gets a fixed amount per service performed, regardless of price
      doctorCut = new Decimal(override.splitValue).mul(totalServices);
    } else {
      const serviceRevenue = new Decimal(log.service.price).mul(totalServices);
      const percent = override
        ? new Decimal(override.splitValue)
        : new Decimal(log.service.doctorSplitPercent);
      doctorCut = serviceRevenue.mul(percent);
    }

    servicePayout = servicePayout.plus(doctorCut);

    // Track center's loss for charity services (always at full price, split doesn't apply)
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

/**
 * Lists every doctor's payout status for a given month — useful for a
 * reception dashboard "payouts due this month" overview.
 */
async function listMonthlyPayouts(year, month) {
  const tallies = await prisma.monthlyTally.findMany({
    where: { year, month },
    include: { doctor: true },
  });

  const results = [];
  for (const tally of tallies) {
    const payout = await calculateMonthlyDoctorPayout(
      tally.doctorId,
      year,
      month,
    );
    results.push({
      doctorId: tally.doctorId,
      doctorName: tally.doctor.name,
      isPaidOut: tally.isPaidOut,
      ...payout,
    });
  }

  return results;
}

module.exports = {
  calculateMonthlyDoctorPayout,
  confirmDoctorPayout,
  listMonthlyPayouts,
};

/**
 * Confirms and finalizes a doctor's payout for a specific month:
 * - Recalculates the amount owed
 * - Marks the MonthlyTally as paid out
 * - Records a DOCTOR_PAYOUT ledger transaction
 * All done atomically so partial writes never happen.
 */
async function confirmDoctorPayout(doctorId, year, month) {
  const payout = await calculateMonthlyDoctorPayout(doctorId, year, month);

  if (!payout.financials || new Decimal(payout.financials.totalOwed).lte(0)) {
    return payout; // Nothing to pay out
  }

  const tally = await prisma.monthlyTally.findUnique({
    where: { doctorId_month_year: { doctorId, month, year } },
  });

  const [, transaction] = await prisma.$transaction([
    prisma.monthlyTally.update({
      where: { id: tally.id },
      data: { isPaidOut: true },
    }),
    prisma.ledgerTransaction.create({
      data: {
        amount: payout.financials.totalOwed,
        isOutflow: true,
        category: "DOCTOR_PAYOUT",
        description: `Payout to ${payout.doctorName} for ${month}/${year}`,
      },
    }),
  ]);

  return { ...payout, transactionId: transaction.id };
}

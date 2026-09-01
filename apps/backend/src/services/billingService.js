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
    return { totalOwed: "0.00", message: "لا يوجد مستحقات لهذا الشهر" };

  const doctor = tally.doctor;
  const totalVisits = tally.totalVisits;

  // Build a quick lookup of per-doctor service overrides
  const splitOverrides = new Map(
    doctor.serviceSplits.map((s) => [s.serviceId, s]),
  );

  let totalPatients = tally.regularPatients + tally.charityPatients;
  let servicePayout = new Decimal(0);
  let totalCharityCost = new Decimal(0);

  // 2. Determine the consultation pay rule first, so charity cost is computed correctly
  const isPerVisitDoctor = new Decimal(doctor.perVisitFee).gt(0);
  const coveredVisits = tally.coveredVisits ?? 0;

  // doctorPatientCut: what the doctor earns per patient (may differ from perPatientFee
  // which is the center's collection rate)
  const doctorPatientCut = new Decimal(
    doctor.doctorPatientCut ?? doctor.perPatientFee,
  );
  const centerPatientFee = new Decimal(doctor.perPatientFee);

  let consultationPay = new Decimal(0);
  let appliedRule = "";

  if (isPerVisitDoctor && coveredVisits > 0) {
    // Mixed rule: some days were under per-visit (covered), the rest per-patient
    const guaranteedPay = new Decimal(doctor.perVisitFee).mul(coveredVisits);
    const patientPay = doctorPatientCut.mul(totalPatients);
    consultationPay = guaranteedPay.plus(patientPay);
    appliedRule = "MIXED";
    // Net cost to center for covered days = what it paid doctor − what it collected from patients those days
    const coveredPatients = tally.coveredPatients ?? 0;
    const coveredDayNetCost = guaranteedPay.minus(
      centerPatientFee.mul(coveredPatients),
    );
    totalCharityCost = coveredDayNetCost.gt(0)
      ? coveredDayNetCost
      : new Decimal(0);
    // Center also covers the doctor's cut for charity patients on normal days
    if (tally.charityPatients > 0) {
      totalCharityCost = totalCharityCost.plus(
        doctorPatientCut.mul(tally.charityPatients),
      );
    }
  } else if (
    isPerVisitDoctor &&
    (totalVisits === 0 || totalPatients < totalVisits * 5)
  ) {
    // Per-visit rule: all visits fell under the threshold — doctor paid per day
    consultationPay = new Decimal(doctor.perVisitFee).mul(totalVisits);
    appliedRule = "PER_VISIT_FEE";
    // Center's loss = what it pays the doctor minus what it collects from real patients
    totalCharityCost = consultationPay.minus(
      centerPatientFee.mul(tally.regularPatients),
    );
    if (totalCharityCost.lt(0)) totalCharityCost = new Decimal(0);
    // For stats, only real patients count
    totalPatients = tally.regularPatients;
  } else {
    // Per-patient rule: doctor is paid per patient seen (using doctorPatientCut, not perPatientFee)
    consultationPay = doctorPatientCut.mul(totalPatients);
    appliedRule = "PER_PATIENT_FEE";
    // Center covers the doctor's cut for charity patients
    if (tally.charityPatients > 0) {
      totalCharityCost = totalCharityCost.plus(
        doctorPatientCut.mul(tally.charityPatients),
      );
    }
  }

  // 3. Process EKG, Echo, etc., for this month
  tally.serviceLogs.forEach((log) => {
    const totalServices = log.regularCount + log.charityCount;
    const override = splitOverrides.get(log.serviceId);

    let doctorCut;
    if (override && override.splitType === "FLAT") {
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

  // 4. Final Calculation
  const totalOwed = consultationPay.plus(servicePayout);

  // Net gain/loss for the center from consultations only
  // (paying patients = regularPatients + coveredPatients; charity patients don't pay)
  const coveredPatientsCount = tally.coveredPatients ?? 0;
  const centerConsultationNet = centerPatientFee
    .mul(tally.regularPatients + coveredPatientsCount)
    .minus(consultationPay);

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
      centerConsultationNet: centerConsultationNet.toFixed(2),
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
      tallyId: tally.id,
      doctorId: tally.doctorId,
      doctorName: tally.doctor.name,
      isPaidOut: tally.isPaidOut,
      ...payout,
    });
  }

  return results;
}

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

module.exports = {
  calculateMonthlyDoctorPayout,
  confirmDoctorPayout,
  listMonthlyPayouts,
};

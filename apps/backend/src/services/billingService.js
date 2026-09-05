// filepath: apps/backend/src/services/billingService.js

const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();

/**
 * Calculates a doctor's payout for a specific month.
 */
async function calculateMonthlyDoctorPayout(
  doctorId,
  year,
  month,
  existingTally = null,
) {
  // 1. Fetch the aggregated monthly tally if one was not provided
  let tally = existingTally;
  if (!tally) {
    tally = await prisma.monthlyTally.findUnique({
      where: {
        doctorId_month_year: { doctorId, month, year },
      },
      include: {
        doctor: { include: { serviceSplits: true } },
        serviceLogs: { include: { service: true } },
      },
    });
  }

  if (!tally)
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
  let dataWarning = null;

  if (isPerVisitDoctor && coveredVisits > 0) {
    // Mixed rule: some days were under per-visit (covered), the rest per-patient.
    // "Regular" (non-covered) patients can only exist on visit days that
    // weren't already covered by the guaranteed per-visit fee. If every
    // visit this month was covered (coveredVisits >= totalVisits), there
    // are no remaining non-covered days for regularPatients/charityPatients
    // to have occurred on, so patientPay must be 0 to avoid double-paying
    // the doctor for the same visits.
    const remainingVisits = totalVisits - coveredVisits;
    const guaranteedPay = new Decimal(doctor.perVisitFee).mul(coveredVisits);
    const patientPay =
      remainingVisits > 0
        ? doctorPatientCut.mul(totalPatients)
        : new Decimal(0);
    consultationPay = guaranteedPay.plus(patientPay);
    appliedRule = "MIXED";

    if (remainingVisits <= 0 && totalPatients > 0) {
      // Every visit was covered, yet regularPatients/charityPatients were
      // still submitted — most likely a data-entry mistake where patients
      // were logged under "regularPatients" instead of "coveredPatients".
      dataWarning =
        'جميع الزيارات كانت مغطاة (أيام تغطية = الزيارات الكلية)، لكن تم تسجيل مرضى منتظمين/مغطين إضافيين. تأكد من إدخال هؤلاء المرضى ضمن "مرضى أيام التغطية" بدلاً من ذلك.';
      totalPatients = 0;
    }

    // Net cost to center for covered days = what it paid doctor − what it collected from patients those days
    const coveredPatients = tally.coveredPatients ?? 0;
    const coveredDayNetCost = guaranteedPay.minus(
      centerPatientFee.mul(coveredPatients),
    );
    totalCharityCost = coveredDayNetCost.gt(0)
      ? coveredDayNetCost
      : new Decimal(0);
    // Center also covers the doctor's cut for charity patients on normal days
    if (remainingVisits > 0 && tally.charityPatients > 0) {
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

  // 3. Process EKG, Echo, Ultrasound, etc., for this month
  let totalServiceRevenue = new Decimal(0);
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

    // The center only actually COLLECTS revenue from paying (regular)
    // service instances — charity services are performed for free, so
    // they don't contribute to revenue (their cost is tracked below).
    totalServiceRevenue = totalServiceRevenue.plus(
      new Decimal(log.service.price).mul(log.regularCount),
    );

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

  // Net gain/loss for the center from services (ultrasound, EKG, etc.):
  // what it collected from paying patients minus what it paid the doctor.
  const centerServiceNet = totalServiceRevenue.minus(servicePayout);

  return {
    doctorName: doctor.name,
    isPaidOut: tally.isPaidOut,
    stats: {
      totalVisits,
      totalPatients,
      appliedRule,
    },
    financials: {
      consultationPay: consultationPay.toFixed(2),
      servicePay: servicePayout.toFixed(2),
      serviceRevenue: totalServiceRevenue.toFixed(2),
      totalOwed: totalOwed.toFixed(2),
      charityCostToCenter: totalCharityCost.toFixed(2),
      centerConsultationNet: centerConsultationNet.toFixed(2),
      centerServiceNet: centerServiceNet.toFixed(2),
    },
    ...(dataWarning ? { dataWarning } : {}),
  };
}

/**
 * Returns the locked payout snapshot for a paid month, or a live
 * recalculation if the month has not yet been paid out.
 */
async function getDoctorPayoutDetails(
  doctorId,
  year,
  month,
  existingTally = null,
) {
  let tally = existingTally;
  if (!tally) {
    tally = await prisma.monthlyTally.findUnique({
      where: { doctorId_month_year: { doctorId, month, year } },
      include: {
        doctor: { include: { serviceSplits: true } },
        serviceLogs: { include: { service: true } },
      },
    });
  }

  if (!tally)
    return { totalOwed: "0.00", message: "لا يوجد مستحقات لهذا الشهر" };

  // If this month is already paid out, return the saved snapshot so the
  // user always sees the numbers that were actually paid.
  if (tally.isPaidOut) {
    const snapshot = await prisma.doctorPayoutSnapshot.findUnique({
      where: { doctorId_month_year: { doctorId, month, year } },
      include: { doctor: true },
    });

    if (snapshot) {
      return {
        doctorName: snapshot.doctor.name,
        isPaidOut: true,
        paidAt: snapshot.createdAt,
        stats: snapshot.stats,
        financials: snapshot.financials,
        ...(snapshot.dataWarning
          ? { dataWarning: snapshot.dataWarning }
          : {}),
      };
    }
  }

  return calculateMonthlyDoctorPayout(doctorId, year, month, tally);
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
    // Load the full detail (snapshot for paid months, live calc otherwise)
    const payout = await getDoctorPayoutDetails(tally.doctorId, year, month);
    results.push({
      tallyId: tally.id,
      doctorId: tally.doctorId,
      doctorName: payout.doctorName ?? tally.doctor.name,
      isPaidOut: tally.isPaidOut,
      ...payout,
    });
  }

  return results;
}

/**
 * Confirms and finalizes a doctor's payout for a specific month:
 * - Recalculates the amount owed
 * - Locks a snapshot of the payout calculation
 * - Marks the MonthlyTally as paid out
 * - Records DOCTOR_PAYOUT / patient-fee / service-fee ledger transactions
 * All done atomically so partial writes never happen.
 */
async function confirmDoctorPayout(doctorId, year, month) {
  // Load the tally with all related data up front
  const tally = await prisma.monthlyTally.findUnique({
    where: { doctorId_month_year: { doctorId, month, year } },
    include: {
      doctor: { include: { serviceSplits: true } },
      serviceLogs: { include: { service: true } },
    },
  });

  if (!tally) {
    return { totalOwed: "0.00", message: "لا يوجد مستحقات لهذا الشهر" };
  }

  // Idempotency: if already paid, return the locked snapshot. If this is
  // a legacy paid month with no snapshot, just return the live recalculation
  // without creating duplicate ledger entries.
  if (tally.isPaidOut) {
    const snapshot = await prisma.doctorPayoutSnapshot.findUnique({
      where: { doctorId_month_year: { doctorId, month, year } },
      include: { doctor: true },
    });
    if (snapshot) {
      return {
        doctorName: snapshot.doctor.name,
        isPaidOut: true,
        paidAt: snapshot.createdAt,
        stats: snapshot.stats,
        financials: snapshot.financials,
        transactionId: null,
        ...(snapshot.dataWarning
          ? { dataWarning: snapshot.dataWarning }
          : {}),
      };
    }

    return {
      ...(await calculateMonthlyDoctorPayout(doctorId, year, month, tally)),
      isPaidOut: true,
    };
  }

  const payout = await calculateMonthlyDoctorPayout(
    doctorId,
    year,
    month,
    tally,
  );

  if (!payout.financials || new Decimal(payout.financials.totalOwed).lte(0)) {
    return payout; // Nothing to pay out
  }

  const payoutDate = new Date(year, month - 1, 1);
  const doctor = tally.doctor;
  const payingPatients =
    (tally.regularPatients ?? 0) + (tally.coveredPatients ?? 0);
  const patientRevenue = new Decimal(doctor.perPatientFee).mul(payingPatients);

  const operations = [
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
        // Record the transaction as having occurred in the target month/year
        // being paid out, not the current real-world date.
        date: payoutDate,
      },
    }),
    prisma.doctorPayoutSnapshot.create({
      data: {
        doctorId,
        month,
        year,
        stats: payout.stats,
        financials: payout.financials,
        dataWarning: payout.dataWarning ?? null,
      },
    }),
  ];

  if (patientRevenue.gt(0)) {
    operations.push(
      prisma.ledgerTransaction.create({
        data: {
          amount: patientRevenue.toFixed(2),
          isOutflow: false,
          category: "PATIENT_FEE",
          description: `Patient fees collected for ${payout.doctorName} — ${month}/${year}`,
          date: payoutDate,
        },
      }),
    );
  }

  // Revenue the center collected from paying service instances (ultrasound,
  // EKG, etc.) this month.
  const serviceRevenue = new Decimal(payout.financials.serviceRevenue ?? 0);
  if (serviceRevenue.gt(0)) {
    operations.push(
      prisma.ledgerTransaction.create({
        data: {
          amount: serviceRevenue.toFixed(2),
          isOutflow: false,
          category: "SERVICE_FEE",
          description: `Service fees collected for ${payout.doctorName} — ${month}/${year}`,
          date: payoutDate,
        },
      }),
    );
  }

  const results = await prisma.$transaction(operations);
  const transaction = results[1];

  return { ...payout, isPaidOut: true, transactionId: transaction.id };
}

module.exports = {
  calculateMonthlyDoctorPayout,
  confirmDoctorPayout,
  listMonthlyPayouts,
  getDoctorPayoutDetails,
};

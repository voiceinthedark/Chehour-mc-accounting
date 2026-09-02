// filepath: apps/backend/scripts/backfillServiceFees.js
//
// One-off migration script: backfills missing SERVICE_FEE ledger
// transactions for MonthlyTally records that were already paid out
// before confirmDoctorPayout() was fixed to also record the full service
// revenue (ultrasound, EKG, echo, etc.) collected by the center — not just
// the doctor's cut of it (which was already recorded as part of the
// DOCTOR_PAYOUT outflow).
//
// For every MonthlyTally with isPaidOut = true, this script:
//   1. Loads the tally's serviceLogs (with service prices)
//   2. Computes total service revenue collected that month:
//      sum(service.price * log.regularCount) — charity service instances
//      don't pay and are excluded (their cost is tracked elsewhere)
//   3. Checks whether a matching SERVICE_FEE transaction already exists
//      (by description, to stay idempotent / re-runnable safely)
//   4. Creates the missing SERVICE_FEE inflow transaction, dated to the
//      first day of that tally's month/year
//
// Usage:
//   node apps/backend/scripts/backfillServiceFees.js         # dry run
//   node apps/backend/scripts/backfillServiceFees.js --apply # write changes

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");

function descriptionFor(doctorName, month, year) {
  return `Service fees collected for ${doctorName} — ${month}/${year}`;
}

async function main() {
  const tallies = await prisma.monthlyTally.findMany({
    where: { isPaidOut: true },
    include: {
      doctor: true,
      serviceLogs: { include: { service: true } },
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  console.log(`Found ${tallies.length} paid-out MonthlyTally record(s).`);

  let created = 0;
  let skippedExisting = 0;
  let skippedZero = 0;

  for (const tally of tallies) {
    const { doctor, month, year } = tally;

    let serviceRevenue = new Decimal(0);
    for (const log of tally.serviceLogs) {
      serviceRevenue = serviceRevenue.plus(
        new Decimal(log.service.price).mul(log.regularCount),
      );
    }

    if (serviceRevenue.lte(0)) {
      skippedZero++;
      continue;
    }

    const description = descriptionFor(doctor.name, month, year);

    const existing = await prisma.ledgerTransaction.findFirst({
      where: { category: "SERVICE_FEE", description },
    });

    if (existing) {
      skippedExisting++;
      continue;
    }

    created++;
    console.log(
      `${APPLY ? "Creating" : "[dry-run] Would create"} SERVICE_FEE tx: "${description}" | amount=${serviceRevenue.toFixed(2)} | date=${year}-${String(month).padStart(2, "0")}-01`,
    );

    if (APPLY) {
      await prisma.ledgerTransaction.create({
        data: {
          amount: serviceRevenue.toFixed(2),
          isOutflow: false,
          category: "SERVICE_FEE",
          description,
          date: new Date(year, month - 1, 1),
        },
      });
    }
  }

  console.log("---");
  console.log(`Total paid-out tallies: ${tallies.length}`);
  console.log(`Created: ${created}`);
  console.log(`Skipped (already exists): ${skippedExisting}`);
  console.log(`Skipped (zero revenue): ${skippedZero}`);
  console.log(
    APPLY
      ? "Changes applied."
      : "Dry run only — re-run with --apply to write changes.",
  );

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

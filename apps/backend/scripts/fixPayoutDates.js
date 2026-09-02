// filepath: apps/backend/scripts/fixPayoutDates.js
//
// One-off migration script: corrects the `date` field on previously
// confirmed DOCTOR_PAYOUT ledger transactions.
//
// Before the fix in billingService.js, confirmDoctorPayout() created
// ledger entries without an explicit `date`, so Prisma defaulted them
// to `now()` — meaning payouts confirmed for e.g. July ended up dated
// in September (whenever they were actually confirmed).
//
// This script parses the target month/year out of each transaction's
// description (format: "Payout to {doctorName} for {month}/{year}")
// and rewrites `date` to the first day of that month/year.
//
// Usage:
//   node apps/backend/scripts/fixPayoutDates.js         # dry run (no writes)
//   node apps/backend/scripts/fixPayoutDates.js --apply # actually update rows

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");

// Matches "... for 7/2026" at the end of the description
const DESC_REGEX = /for (\d{1,2})\/(\d{4})$/;

async function main() {
  const payouts = await prisma.ledgerTransaction.findMany({
    where: { category: "DOCTOR_PAYOUT" },
    orderBy: { date: "asc" },
  });

  console.log(`Found ${payouts.length} DOCTOR_PAYOUT transaction(s).`);

  let toFix = 0;
  let skipped = 0;

  for (const tx of payouts) {
    const match = tx.description.match(DESC_REGEX);

    if (!match) {
      console.warn(
        `⚠ Skipping tx ${tx.id} — could not parse month/year from description: "${tx.description}"`,
      );
      skipped++;
      continue;
    }

    const month = Number(match[1]);
    const year = Number(match[2]);
    const correctDate = new Date(year, month - 1, 1);

    const alreadyCorrect =
      tx.date.getFullYear() === correctDate.getFullYear() &&
      tx.date.getMonth() === correctDate.getMonth();

    if (alreadyCorrect) {
      continue;
    }

    toFix++;
    console.log(
      `${APPLY ? "Fixing" : "[dry-run] Would fix"} tx ${tx.id}: "${tx.description}" | current date=${tx.date.toISOString().slice(0, 10)} -> new date=${correctDate.toISOString().slice(0, 10)}`,
    );

    if (APPLY) {
      await prisma.ledgerTransaction.update({
        where: { id: tx.id },
        data: { date: correctDate },
      });
    }
  }

  console.log("---");
  console.log(`Total: ${payouts.length}`);
  console.log(`Needing fix: ${toFix}`);
  console.log(`Skipped (unparseable): ${skipped}`);
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

// filepath: apps/backend/src/services/labService.js

const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();

const LAB_MARKUP = new Decimal("1.4");

/**
 * Creates a lab order and atomically records the corresponding ledger entries:
 * - LAB_COST outflow (what the Center owes the external laboratory)
 * - LAB_REVENUE inflow (what the Center charges the patient, i.e. labCost * 1.4)
 */
async function createLabOrder({ patientName, testName, labCost }) {
  const cost = new Decimal(labCost);
  const centerCharge = cost.mul(LAB_MARKUP);

  const [labOrder] = await prisma.$transaction([
    prisma.labOrder.create({
      data: {
        patientName,
        testName,
        labCost: cost.toFixed(2),
        centerCharge: centerCharge.toFixed(2),
        isSettled: true,
      },
    }),
    prisma.ledgerTransaction.create({
      data: {
        amount: cost.toFixed(2),
        isOutflow: true,
        category: "LAB_COST",
        description: `Lab cost for ${testName}${patientName ? ` (${patientName})` : ""}`,
      },
    }),
    prisma.ledgerTransaction.create({
      data: {
        amount: centerCharge.toFixed(2),
        isOutflow: false,
        category: "LAB_REVENUE",
        description: `Patient charge for ${testName}${patientName ? ` (${patientName})` : ""}`,
      },
    }),
  ]);

  return {
    ...labOrder,
    margin: centerCharge.minus(cost).toFixed(2),
  };
}

module.exports = {
  createLabOrder,
};

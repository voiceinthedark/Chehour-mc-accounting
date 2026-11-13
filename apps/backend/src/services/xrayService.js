// filepath: apps/backend/src/services/xrayService.js

const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();

/**
 * Creates an X-ray order and atomically records its XRAY_REVENUE ledger entry.
 * The Center keeps the whole fee; doctors receive no cut.
 */
async function createXrayOrder({ patientsCount, pricePerPatient, date }) {
  const count = Number(patientsCount);
  const price = new Decimal(pricePerPatient);
  const total = price.mul(count);
  const txDate = date ? new Date(date) : new Date();

  return prisma.$transaction(async (tx) => {
    const ledgerTx = await tx.ledgerTransaction.create({
      data: {
        amount: total.toFixed(2),
        isOutflow: false,
        category: "XRAY_REVENUE",
        description: `X-ray fees — ${count} patient(s)`,
        date: txDate,
      },
    });

    return tx.xrayOrder.create({
      data: {
        date: txDate,
        patientsCount: count,
        pricePerPatient: price.toFixed(2),
        totalAmount: total.toFixed(2),
        ledgerTransactionId: ledgerTx.id,
      },
    });
  });
}

/**
 * Lists X-ray orders, optionally filtered by date range.
 */
async function listXrayOrders({ startDate, endDate }) {
  const where = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  return prisma.xrayOrder.findMany({ where, orderBy: { date: "desc" } });
}

/**
 * Deletes an X-ray order together with its ledger entry.
 * Returns null if the order does not exist.
 */
async function deleteXrayOrder(id) {
  const order = await prisma.xrayOrder.findUnique({ where: { id } });
  if (!order) return null;

  // The foreign key lives on XrayOrder, so delete the order first.
  await prisma.$transaction([
    prisma.xrayOrder.delete({ where: { id } }),
    ...(order.ledgerTransactionId
      ? [prisma.ledgerTransaction.delete({ where: { id: order.ledgerTransactionId } })]
      : []),
  ]);

  return order;
}

/**
 * Records a manual X-ray expense (films, maintenance, technician, etc.).
 */
async function createXrayExpense({ amount, description, date }) {
  return prisma.ledgerTransaction.create({
    data: {
      amount: new Decimal(amount).toFixed(2),
      isOutflow: true,
      category: "XRAY_EXPENSE",
      description,
      ...(date ? { date: new Date(date) } : {}),
    },
  });
}

module.exports = {
  createXrayOrder,
  listXrayOrders,
  deleteXrayOrder,
  createXrayExpense,
};

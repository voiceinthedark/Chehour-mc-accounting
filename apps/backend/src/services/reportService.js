// filepath: apps/backend/src/services/reportService.js

const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();

/**
 * Computes the aggregated revenue/expense summary for a given month,
 * broken down by ledger category, plus the overall net profit/loss.
 */
async function getMonthlySummary(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
  });

  let totalInflow = new Decimal(0);
  let totalOutflow = new Decimal(0);
  const byCategory = {};

  transactions.forEach((tx) => {
    const amount = new Decimal(tx.amount);

    if (!byCategory[tx.category]) {
      byCategory[tx.category] = { inflow: new Decimal(0), outflow: new Decimal(0) };
    }

    if (tx.isOutflow) {
      totalOutflow = totalOutflow.plus(amount);
      byCategory[tx.category].outflow = byCategory[tx.category].outflow.plus(amount);
    } else {
      totalInflow = totalInflow.plus(amount);
      byCategory[tx.category].inflow = byCategory[tx.category].inflow.plus(amount);
    }
  });

  const categoryBreakdown = Object.fromEntries(
    Object.entries(byCategory).map(([category, { inflow, outflow }]) => [
      category,
      { inflow: inflow.toFixed(2), outflow: outflow.toFixed(2) },
    ]),
  );

  return {
    period: { year, month },
    totalInflow: totalInflow.toFixed(2),
    totalOutflow: totalOutflow.toFixed(2),
    netProfit: totalInflow.minus(totalOutflow).toFixed(2),
    categoryBreakdown,
    transactionCount: transactions.length,
  };
}

module.exports = {
  getMonthlySummary,
};

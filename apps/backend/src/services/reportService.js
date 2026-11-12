// filepath: apps/backend/src/services/reportService.js

const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");
const prisma = new PrismaClient();
const logger = require("../utils/logger");
const { isOphtalmologistTx } = require("../utils/helpers");

//                                                           ▲
//   NOTE: the ophtalmologist's name can be configured via   █
//   the OPHTALMOLOGIST_NAME environment variable,           █
//   defaulting to "محمد خليل" if not set.                   █
//   OPHTALMOLOGIST_ID is also set in the environment
//   variables to identify the ophtalmologist's transactions.
//                                                           ▼

/**
 * Computes the aggregated revenue/expense summary for a given month,
 * broken down by ledger category, plus the overall net profit/loss.
 * Mohammed Khalil the ophtalmologist is counted distinctly in the summary
 * @param {number} year - The year for which to compute the summary.
 * @param {number} month - The month (1-12) for which to compute the summary.
 */
async function getMonthlySummary(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
  });

  let totalInflow = new Decimal(0);
  let totalOutflow = new Decimal(0);
  let ophtalmologistInflow = new Decimal(0);
  let ophtalmologistOutflow = new Decimal(0);
  const byCategory = {};

  transactions.forEach((tx) => {
    const amount = new Decimal(tx.amount);

    //                                                           ▲
    //   NOTE: ophtalmologist transactions are tracked           █
    //   separately and excluded                                 █
    //   from the general totals and category breakdowns.        █
    //                                                           ▼

    if (isOphtalmologistTx(tx)) {
      if (tx.isOutflow) {
        ophtalmologistOutflow = ophtalmologistOutflow.plus(amount);
      } else {
        ophtalmologistInflow = ophtalmologistInflow.plus(amount);
      }
      return; // Skip further processing for this transaction
    }

    if (!byCategory[tx.category]) {
      byCategory[tx.category] = {
        inflow: new Decimal(0),
        outflow: new Decimal(0),
      };
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
    ophtalmologist: {
      inflow: ophtalmologistInflow.toFixed(2),
      outflow: ophtalmologistOutflow.toFixed(2),
      net: ophtalmologistInflow.minus(ophtalmologistOutflow).toFixed(2),
    },
    categoryBreakdown,
    transactionCount: transactions.length,
  };
}

/**
 * Computes the total revenue and total expenses for a given year.
 * Revenue is the sum of all inflows, and expenses are the sum of all outflows.
 * @param {number} year - The year for which to compute totals.
 * @returns {Promise<{ totalRevenue: string, totalExpenses: string }>} - The total revenue and expenses as strings.
 * **/
async function getTotalRevenueAndExpenses(year) {
  const startDate = new Date(year, 0, 1);
  // FIX: The endDate should be the last day of the year, not the first day of the next year.
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // NOTE: Ophtalmologist are also excluded from the total revenue and expenses calculations,
  // as they are tracked separately.

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
  });

  let totalRevenue = new Decimal(0);
  let totalExpenses = new Decimal(0);
  let ophtalmologistRevenue = new Decimal(0);
  let ophtalmologistExpenses = new Decimal(0);

  transactions.forEach((tx) => {
    const amount = new Decimal(tx.amount);

    if (isOphtalmologistTx(tx)) {
      if (tx.isOutflow) {
        ophtalmologistExpenses = ophtalmologistExpenses.plus(amount);
      } else {
        ophtalmologistRevenue = ophtalmologistRevenue.plus(amount);
      }
      return; // Skip further processing for this transaction
    }

    if (tx.isOutflow) {
      totalExpenses = totalExpenses.plus(amount);
    } else {
      totalRevenue = totalRevenue.plus(amount);
    }
  });

  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    netProfit: totalRevenue.minus(totalExpenses).toFixed(2),
    ophtalmologist: {
      revenue: ophtalmologistRevenue.toFixed(2),
      expenses: ophtalmologistExpenses.toFixed(2),
      net: ophtalmologistRevenue.minus(ophtalmologistExpenses).toFixed(2),
    },
  };
}

/**
 * Fetches the monthly summary along with detailed transactions for that month.
 * @param {number} year - The year for which to fetch the summary.
 * @param {number} month - The month (1-12) for which to fetch the summary.
 * @returns {Promise<Object>} - An object containing the monthly summary and detailed transactions.
 * */
async function getMonthlySummaryWithDetails(year, month) {
  const summary = await getMonthlySummary(year, month);

  // Fetch detailed transactions for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  });

  return {
    ...summary,
    transactions,
  };
}

/**
 * Fetches total revenue and expenses for the provided year along with detailed transactions for that year.
 * @param {number} year - The year for which to fetch the totals and details.
 * @returns {Promise<Object>} - An object containing total revenue, total expenses, net profit, and detailed transactions.
 * */
async function getTotalRevenueAndExpensesWithDetails(year) {
  const totals = await getTotalRevenueAndExpenses(year);

  // Fetch detailed transactions for the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  });

  return {
    ...totals,
    transactions,
  };
}

/**
 * Fetches total revenue and expenses for the provided year along with a breakdown by category.
 * @param {number} year - The year for which to fetch the totals and category breakdown.
 * @returns {Promise<Object>} - An object containing total revenue, total expenses, net profit, and a breakdown by category.
 * */
async function getTotalRevenueAndExpensesWithCategoryBreakdown(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
  });

  let totalRevenue = new Decimal(0);
  let totalExpenses = new Decimal(0);
  let ophtalmologistRevenue = new Decimal(0);
  let ophtalmologistExpenses = new Decimal(0);
  const byCategory = {};

  transactions.forEach((tx) => {
    const amount = new Decimal(tx.amount);

    //                                                           ▲
    //   NOTE: Ophtalmologist transactions are tracked separately█
    //   and excluded from the general totals and category       █
    //   breakdowns.                                             █
    //                                                           ▼
    if (isOphtalmologistTx(tx)) {
      if (tx.isOutflow) {
        ophtalmologistExpenses = ophtalmologistExpenses.plus(amount);
      } else {
        ophtalmologistRevenue = ophtalmologistRevenue.plus(amount);
      }
      return; // Skip further processing for this transaction
    }

    if (!byCategory[tx.category]) {
      byCategory[tx.category] = {
        inflow: new Decimal(0),
        outflow: new Decimal(0),
      };
    }

    if (tx.isOutflow) {
      totalExpenses = totalExpenses.plus(amount);
      byCategory[tx.category].outflow = byCategory[tx.category].outflow.plus(amount);
    } else {
      totalRevenue = totalRevenue.plus(amount);
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
    totalRevenue: totalRevenue.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    netProfit: totalRevenue.minus(totalExpenses).toFixed(2),
    ophtalmologist: {
      revenue: ophtalmologistRevenue.toFixed(2),
      expenses: ophtalmologistExpenses.toFixed(2),
      net: ophtalmologistRevenue.minus(ophtalmologistExpenses).toFixed(2),
    },
    categoryBreakdown,
  };
}

async function getMonthlySummaryWithDoctorDetails(year, month) {
  // const summary = await getMonthlySummary(year, month);

  const transactions = await prisma.doctorPayoutSnapshot.findMany({
    where: { month: month, year: year },
    orderBy: { doctorId: "asc" },
    include: {
      doctor: true,
    },
  });

  return {
    transactions,
  };
}

/**
 * Fetches the monthly summaries for all months in a given year.
 * @param {number} year - The year for which to fetch the monthly summaries.
 * @returns {Promise<Array>} - An array of monthly summaries for each month in the year.
 * */
async function getYearlySummary(year) {
  const monthlySummaries = [];

  for (let month = 1; month <= 12; month++) {
    const summary = await getMonthlySummary(year, month);
    monthlySummaries.push(summary);
  }

  // Get the total revenue and expenses for the year
  const totals = await getTotalRevenueAndExpenses(year);

  return {
    totals,
    monthly: monthlySummaries,
  };
}

module.exports = {
  getMonthlySummary,
  getTotalRevenueAndExpenses,
  getMonthlySummaryWithDetails,
  getTotalRevenueAndExpensesWithDetails,
  getTotalRevenueAndExpensesWithCategoryBreakdown,
  getMonthlySummaryWithDoctorDetails,
  getYearlySummary,
};

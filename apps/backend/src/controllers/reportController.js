// filepath: apps/backend/src/controllers/reportController.js

const {
  getMonthlySummary,
  getTotalRevenueAndExpenses,
  getMonthlySummaryWithDetails,
  getTotalRevenueAndExpensesWithDetails,
  getTotalRevenueAndExpensesWithCategoryBreakdown,
} = require("../services/reportService");

/**
 * Controller for generating monthly summary report.
 * Returns aggregated revenue/expense summary for a given month.
 */
async function monthlySummary(req, res) {
  const { year, month } = req.params;

  try {
    const summary = await getMonthlySummary(Number(year), Number(month));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to compute monthly summary" });
  }
}

/**
 * Controller for generating total revenue and expenses report.
 * Returns aggregated revenue and expenses for a given year.
 * */
async function totalRevenueAndExpenses(req, res) {
  const { year } = req.params;
  try {
    const totals = await getTotalRevenueAndExpenses(year);
    res.json(totals);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to compute total revenue and expenses" });
  }
}

/**
 * Controller for generating monthly summary report with detailed transactions.
 * Returns aggregated revenue/expense summary along with detailed transactions for a given month.
 * */
async function monthlySummaryWithDetails(req, res) {
  const { year, month } = req.params;

  try {
    const summaryWithDetails = await getMonthlySummaryWithDetails(
      Number(year),
      Number(month),
    );
    res.json(summaryWithDetails);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to compute monthly summary with details" });
  }
}

/**
 * Controller for generating total revenue and expenses report with detailed transactions.
 * Returns aggregated revenue and expenses along with detailed transactions for a given year.
 * */
async function totalRevenueAndExpensesWithDetails(req, res) {
  const { year } = req.params;

  try {
    let totalsWithDetails = await getTotalRevenueAndExpensesWithDetails(
      Number(year),
    );
    res.json(totalsWithDetails);
  } catch (error) {
    res.status(500).json({
      error: "Failed to compute total revenue and expenses with details",
    });
  }
}

/**
 * Controller for generating total revenue and expenses report with category breakdown.
 * Returns aggregated revenue and expenses along with a breakdown by category for a given year.
 * */
async function totalRevenueAndExpensesWithCategoryBreakdown(req, res) {
  const { year } = req.params;
  try {
    let totalsWithCategoryBreakdown =
      await getTotalRevenueAndExpensesWithCategoryBreakdown(Number(year));
    res.json(totalsWithCategoryBreakdown);
  } catch (error) {
    res.status(500).json({
      error:
        "Failed to compute total revenue and expenses with category breakdown",
    });
  }
}

module.exports = {
  monthlySummary,
  totalRevenueAndExpenses,
  monthlySummaryWithDetails,
  totalRevenueAndExpensesWithDetails,
  totalRevenueAndExpensesWithCategoryBreakdown,
};

// filepath: apps/backend/src/controllers/reportController.js

const {
  getMonthlySummary,
  getTotalRevenueAndExpenses,
} = require("../services/reportService");

async function monthlySummary(req, res) {
  const { year, month } = req.params;

  try {
    const summary = await getMonthlySummary(Number(year), Number(month));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to compute monthly summary" });
  }
}

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

module.exports = {
  monthlySummary,
  totalRevenueAndExpenses,
};

// filepath: apps/backend/src/controllers/reportController.js

const { getMonthlySummary } = require("../services/reportService");

async function monthlySummary(req, res) {
  const { year, month } = req.params;

  try {
    const summary = await getMonthlySummary(Number(year), Number(month));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to compute monthly summary" });
  }
}

module.exports = {
  monthlySummary,
};

// filepath: apps/backend/src/controllers/billingController.js

const {
  calculateMonthlyDoctorPayout,
  confirmDoctorPayout,
} = require("../services/billingService");

// Preview what a doctor is owed for a given month (no side effects)
async function previewPayout(req, res) {
  const { doctorId, year, month } = req.params;

  try {
    const result = await calculateMonthlyDoctorPayout(
      doctorId,
      Number(year),
      Number(month),
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate payout" });
  }
}

// Finalize the payout, mark the tally paid, and log it in the ledger
async function confirmPayout(req, res) {
  const { doctorId, year, month } = req.params;

  try {
    const result = await confirmDoctorPayout(
      doctorId,
      Number(year),
      Number(month),
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to confirm payout" });
  }
}

module.exports = {
  previewPayout,
  confirmPayout,
};

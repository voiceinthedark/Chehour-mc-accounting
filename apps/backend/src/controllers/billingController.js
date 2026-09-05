// filepath: apps/backend/src/controllers/billingController.js

const {
  getDoctorPayoutDetails,
  confirmDoctorPayout,
  listMonthlyPayouts,
} = require("../services/billingService");

// Preview what a doctor is owed for a given month (no side effects)
async function previewPayout(req, res) {
  const { doctorId, year, month } = req.params;

  try {
    const result = await getDoctorPayoutDetails(
      doctorId,
      Number(year),
      Number(month),
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payout details" });
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

async function monthlyPayoutsOverview(req, res) {
  const { year, month } = req.params;

  try {
    const result = await listMonthlyPayouts(Number(year), Number(month));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monthly payouts overview" });
  }
}

module.exports = {
  previewPayout,
  confirmPayout,
  monthlyPayoutsOverview,
};

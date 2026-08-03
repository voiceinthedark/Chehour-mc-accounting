// filepath: apps/backend/src/routes/billing.js

const express = require("express");
const router = express.Router();
const {
  calculateMonthlyDoctorPayout,
  confirmDoctorPayout,
} = require("../services/billingService");

// 1. PREVIEW: Calculate what a doctor is owed for a given month (no side effects)
router.get("/payout/:doctorId/:year/:month", async (req, res) => {
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
});

// 2. CONFIRM: Finalize the payout, mark the tally paid, and log it in the ledger
router.post("/payout/:doctorId/:year/:month/confirm", async (req, res) => {
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
});

module.exports = router;

// filepath: apps/backend/src/routes/billing.js

const express = require("express");
const router = express.Router();
const {
  previewPayout,
  confirmPayout,
  monthlyPayoutsOverview,
} = require("../controllers/billingController");

// 1. PREVIEW: Calculate what a doctor is owed for a given month (no side effects)
router.get("/payout/:doctorId/:year/:month", previewPayout);

// 2. CONFIRM: Finalize the payout, mark the tally paid, and log it in the ledger
router.post("/payout/:doctorId/:year/:month/confirm", confirmPayout);

// 3. OVERVIEW: List every doctor's payout status for a given month
router.get("/payouts/:year/:month", monthlyPayoutsOverview);

module.exports = router;

// filepath: apps/backend/src/routes/billing.js

const express = require("express");
const router = express.Router();
const {
  previewPayout,
  confirmPayout,
} = require("../controllers/billingController");

// 1. PREVIEW: Calculate what a doctor is owed for a given month (no side effects)
router.get("/payout/:doctorId/:year/:month", previewPayout);

// 2. CONFIRM: Finalize the payout, mark the tally paid, and log it in the ledger
router.post("/payout/:doctorId/:year/:month/confirm", confirmPayout);

module.exports = router;

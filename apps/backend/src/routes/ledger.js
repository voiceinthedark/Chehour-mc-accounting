// filepath: apps/backend/src/routes/ledger.js

const express = require("express");
const router = express.Router();
const {
  createLedgerTransaction,
  getLedgerTransactions,
} = require("../controllers/ledgerController");

// Record a manual transaction (utility, office/kitchen supplies, repairs, etc.)
router.post("/", createLedgerTransaction);

// List/filter transactions: ?startDate=...&endDate=...&category=...
router.get("/", getLedgerTransactions);

module.exports = router;

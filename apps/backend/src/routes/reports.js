// filepath: apps/backend/src/routes/reports.js

const express = require("express");
const router = express.Router();
const {
  monthlySummary,
  totalRevenueAndExpenses,
} = require("../controllers/reportController");

// Aggregated revenue/expense summary for a given month
router.get("/monthly-summary/:year/:month", monthlySummary);

// Total revenue and expenses for a given year
router.get("/total-revenue-expenses/:year", totalRevenueAndExpenses);

module.exports = router;

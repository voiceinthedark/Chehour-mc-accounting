// filepath: apps/backend/src/routes/reports.js

const express = require("express");
const router = express.Router();
const {
  monthlySummary,
  totalRevenueAndExpenses,
  monthlySummaryWithDetails,
  totalRevenueAndExpensesWithCategoryBreakdown,
  totalRevenueAndExpensesWithDetails,
  monthlySummaryWithDoctorDetails,
  yearlySummary,
} = require("../controllers/reportController");

// Aggregated revenue/expense summary for a given month
router.get("/monthly-summary/:year/:month", monthlySummary);

// Total revenue and expenses for a given year
router.get("/total-revenue-expenses/:year", totalRevenueAndExpenses);

// Monthly summary with detailed transactions for a given month
router.get("/monthly-summary/:year/:month/details", monthlySummaryWithDetails);

// Total revenue and expenses with category breakdown for a given year
router.get(
  "/total-revenue-expenses/:year/category-breakdown",
  totalRevenueAndExpensesWithCategoryBreakdown,
);

// Total revenue and expenses with detailed transactions for a given year
router.get(
  "/total-revenue-expenses/:year/details",
  totalRevenueAndExpensesWithDetails,
);

// Monthly summary with doctor details for a given month
router.get(
  "/monthly-summary/:year/:month/doctor-details",
  monthlySummaryWithDoctorDetails,
);

// Yearly summary for a given year
router.get("/yearly-summary/:year", yearlySummary);

module.exports = router;

// filepath: apps/backend/src/routes/reports.js

const express = require("express");
const router = express.Router();
const { monthlySummary } = require("../controllers/reportController");

// Aggregated revenue/expense summary for a given month
router.get("/monthly-summary/:year/:month", monthlySummary);

module.exports = router;

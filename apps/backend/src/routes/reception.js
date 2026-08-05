// filepath: apps/backend/src/routes/reception.js

const express = require("express");
const router = express.Router();
const {
  updateDoctorSettings,
  submitMonthlyTally,
} = require("../controllers/receptionController");

// 1. SETTINGS: Update a doctor's fees and service arrangements
router.put("/doctors/:id/settings", updateDoctorSettings);

// 2. DATA ENTRY: Submit the monthly tally
router.post("/monthly-tally", submitMonthlyTally);

module.exports = router;

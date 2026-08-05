// filepath: apps/backend/src/routes/reception.js

const express = require("express");
const router = express.Router();
const {
  updateDoctorSettings,
  submitMonthlyTally,
  addNewDoctor,
  addNewService,
  updateService,
} = require("../controllers/receptionController");

// 1. SETTINGS: Update a doctor's fees and service arrangements
router.put("/doctors/:id/settings", updateDoctorSettings);

// 2. DATA ENTRY: Submit the monthly tally
router.post("/monthly-tally", submitMonthlyTally);

// 3. Add Doctor: Add a new doctor to the system
router.post("/doctors/new", addNewDoctor);

// 4. Add Service: Add a new service to the system
router.post("/services/new", addNewService);

// 5. Update Service: Update an existing service's details
router.put("/services/:id", updateService);

module.exports = router;

// filepath: apps/backend/src/routes/reception.js

const express = require("express");
const router = express.Router();
const {
  updateDoctorSettings,
  submitMonthlyTally,
  addNewDoctor,
  addNewService,
  updateService,
  getDoctors,
  getDoctorById,
  deleteDoctor,
  getServices,
  getServiceById,
  deleteService,
  deleteDoctorServiceSplit,
  deleteMonthlyTally,
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

// 6. List / Read / Delete Doctors
router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);
router.delete("/doctors/:id", deleteDoctor);

// 7. List / Read / Delete Services
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.delete("/services/:id", deleteService);

// 8. Delete an unconfirmed monthly tally
router.delete("/monthly-tally/:id", deleteMonthlyTally);

// 9. Remove a doctor-specific service split override
router.delete(
  "/doctors/:doctorId/service-splits/:serviceId",
  deleteDoctorServiceSplit,
);

module.exports = router;

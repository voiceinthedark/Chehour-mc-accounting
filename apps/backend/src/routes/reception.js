// filepath: apps/backend/src/routes/reception.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// 1. SETTINGS: Update a doctor's fees and service arrangements
router.put("/doctors/:id/settings", async (req, res) => {
  const { id } = req.params;
  const { perPatientFee, perVisitFee, serviceSplits } = req.body;

  try {
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        perPatientFee,
        perVisitFee,
        // Assuming we added a relation for custom doctor-service splits
        // to handle "percentage or flat fee for that service"
      },
    });
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to update doctor settings" });
  }
});

// 2. DATA ENTRY: Submit the monthly tally
router.post("/monthly-tally", async (req, res) => {
  const {
    doctorId,
    month,
    year,
    totalVisits,
    regularPatients,
    charityPatients,
    servicesUsed,
  } = req.body;

  try {
    // We save this as a single aggregated record for the month
    const tally = await prisma.monthlyTally.create({
      data: {
        doctorId,
        month,
        year,
        totalVisits,
        regularPatients,
        charityPatients,
        serviceLogs: {
          create: servicesUsed.map((srv) => ({
            serviceId: srv.serviceId,
            regularCount: srv.regularCount,
            charityCount: srv.charityCount,
          })),
        },
      },
    });

    res.json({ success: true, tally });
  } catch (error) {
    res.status(500).json({ error: "Failed to save monthly tally" });
  }
});

module.exports = router;

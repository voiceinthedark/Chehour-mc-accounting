// filepath: apps/backend/src/routes/lab.js

const express = require("express");
const router = express.Router();
const { createLabOrder } = require("../services/labService");

// Create a lab order: Center collects the sample, sends it out,
// and charges the patient 1.4x the amount owed to the lab.
router.post("/lab-orders", async (req, res) => {
  const { patientName, testName, labCost } = req.body;

  if (!testName || labCost === undefined) {
    return res.status(400).json({ error: "testName and labCost are required" });
  }

  try {
    const labOrder = await createLabOrder({ patientName, testName, labCost });
    res.json({ success: true, labOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to create lab order" });
  }
});

module.exports = router;

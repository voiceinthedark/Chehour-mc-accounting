// filepath: apps/backend/src/controllers/labController.js

const { createLabOrder } = require("../services/labService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a lab order: Center collects the sample, sends it out,
// and charges the patient 1.4x the amount owed to the lab.
async function createLabOrderHandler(req, res) {
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
}

async function listLabOrders(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const labOrders = await prisma.labOrder.findMany({
      where,
      orderBy: { date: "desc" },
    });
    res.json(labOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lab orders" });
  }
}

module.exports = {
  createLabOrderHandler,
  listLabOrders,
};

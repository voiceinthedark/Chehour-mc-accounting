// filepath: apps/backend/src/controllers/xrayController.js

const {
  createXrayOrder,
  listXrayOrders,
  deleteXrayOrder,
  createXrayExpense,
} = require("../services/xrayService");
const logger = require("../utils/logger");

async function createXrayOrderHandler(req, res) {
  const { patientsCount, pricePerPatient, date } = req.body;

  if (!Number.isInteger(Number(patientsCount)) || Number(patientsCount) <= 0) {
    return res.status(400).json({ error: "patientsCount must be a positive integer" });
  }
  if (pricePerPatient === undefined || Number.isNaN(Number(pricePerPatient)) || Number(pricePerPatient) < 0) {
    return res.status(400).json({ error: "pricePerPatient must be a non-negative number" });
  }

  try {
    const xrayOrder = await createXrayOrder({ patientsCount, pricePerPatient, date });
    res.status(201).json({ success: true, xrayOrder });
  } catch (error) {
    logger.error(`Failed to create X-ray order: ${error.message}`);
    res.status(500).json({ error: "Failed to create X-ray order" });
  }
}

async function listXrayOrdersHandler(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const xrayOrders = await listXrayOrders({ startDate, endDate });
    res.json(xrayOrders);
  } catch (error) {
    logger.error(`Failed to fetch X-ray orders: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch X-ray orders" });
  }
}

async function deleteXrayOrderHandler(req, res) {
  try {
    const deleted = await deleteXrayOrder(req.params.id);
    if (!deleted) return res.status(404).json({ error: "X-ray order not found" });
    res.json({ success: true });
  } catch (error) {
    logger.error(`Failed to delete X-ray order: ${error.message}`);
    res.status(500).json({ error: "Failed to delete X-ray order" });
  }
}

async function createXrayExpenseHandler(req, res) {
  const { amount, description, date } = req.body;

  if (amount === undefined || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }
  if (!description) {
    return res.status(400).json({ error: "description is required" });
  }

  try {
    const transaction = await createXrayExpense({ amount, description, date });
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    logger.error(`Failed to record X-ray expense: ${error.message}`);
    res.status(500).json({ error: "Failed to record X-ray expense" });
  }
}

module.exports = {
  createXrayOrderHandler,
  listXrayOrdersHandler,
  deleteXrayOrderHandler,
  createXrayExpenseHandler,
};

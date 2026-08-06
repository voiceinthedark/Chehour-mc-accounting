// filepath: apps/backend/src/controllers/ledgerController.js

const {
  createTransaction,
  listTransactions,
} = require("../services/ledgerService");

async function createLedgerTransaction(req, res) {
  const { amount, isOutflow, category, description, date } = req.body;

  if (amount === undefined || isOutflow === undefined || !category || !description) {
    return res.status(400).json({
      error: "amount, isOutflow, category, and description are required",
    });
  }

  try {
    const transaction = await createTransaction({
      amount,
      isOutflow,
      category,
      description,
      date,
    });
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to record transaction" });
  }
}

async function getLedgerTransactions(req, res) {
  const { startDate, endDate, category } = req.query;

  try {
    const transactions = await listTransactions({ startDate, endDate, category });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}

module.exports = {
  createLedgerTransaction,
  getLedgerTransactions,
};

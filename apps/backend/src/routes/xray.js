// filepath: apps/backend/src/routes/xray.js

const express = require("express");
const router = express.Router();
const {
  createXrayOrderHandler,
  listXrayOrdersHandler,
  deleteXrayOrderHandler,
  createXrayExpenseHandler,
} = require("../controllers/xrayController");

// X-ray orders (revenue)
router.post("/orders", createXrayOrderHandler);
router.get("/orders", listXrayOrdersHandler);
router.delete("/orders/:id", deleteXrayOrderHandler);

// X-ray expenses (films, maintenance, ...)
router.post("/expenses", createXrayExpenseHandler);

module.exports = router;

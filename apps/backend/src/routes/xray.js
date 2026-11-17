// filepath: apps/backend/src/routes/xray.js

const express = require("express");
const router = express.Router();
const {
  createXrayOrderHandler,
  listXrayOrdersHandler,
  deleteXrayOrderHandler,
  createXrayExpenseHandler,
  createXrayOrderWithTotalHandler,
} = require("../controllers/xrayController");

// X-ray orders (revenue)
router.post("/orders", createXrayOrderHandler);
router.post("/orders/with-total", createXrayOrderWithTotalHandler);
router.get("/orders", listXrayOrdersHandler);
router.delete("/orders/:id", deleteXrayOrderHandler);

// X-ray expenses (films, maintenance, ...)
router.post("/expenses", createXrayExpenseHandler);

module.exports = router;

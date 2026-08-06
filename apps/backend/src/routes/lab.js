// filepath: apps/backend/src/routes/lab.js

const express = require("express");
const router = express.Router();
const {
  createLabOrderHandler,
  listLabOrders,
} = require("../controllers/labController");

router.post("/lab-orders", createLabOrderHandler);
router.get("/lab-orders", listLabOrders);

module.exports = router;

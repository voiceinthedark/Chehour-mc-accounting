// filepath: apps/backend/src/routes/lab.js

const express = require("express");
const router = express.Router();
const { createLabOrderHandler } = require("../controllers/labController");

router.post("/lab-orders", createLabOrderHandler);

module.exports = router;

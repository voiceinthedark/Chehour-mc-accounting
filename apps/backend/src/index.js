// filepath: apps/backend/src/index.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");

const receptionRoutes = require("./routes/reception");
const billingRoutes = require("./routes/billing");
const labRoutes = require("./routes/lab");
const ledgerRoutes = require("./routes/ledger");
const reportsRoutes = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("combined")); // Logging HTTP requests

app.use("/api/reception", receptionRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

// filepath: apps/backend/src/index.js

const express = require("express");
const cors = require("cors");

const receptionRoutes = require("./routes/reception");
const billingRoutes = require("./routes/billing");
const labRoutes = require("./routes/lab");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/reception", receptionRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api", labRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

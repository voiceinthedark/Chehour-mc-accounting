require("dotenv").config();

const OPHTALMOLOGIST_NAME = process.env.OPHTALMOLOGIST_NAME || "محمد خليل";
const OPHTALMOLOGIST_ID = process.env.OPHTALMOLOGIST_ID || "a0be8dc6-133c-4d30-be1d-9b79deda36d7";

module.exports = { OPHTALMOLOGIST_NAME, OPHTALMOLOGIST_ID };

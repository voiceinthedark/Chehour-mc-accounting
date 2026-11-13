// filepath: apps/backend/src/utils/helpers.js

require("dotenv").config();

// NOTE: The ophtalmologist name is stored in the environment variable OPHTALMOLOGIST_NAME.
const OPHTALMOLOGIST_NAME = process.env.OPHTALMOLOGIST_NAME || "محمد خليل";
const OPHTALMOLOGIST_ID = process.env.OPHTALMOLOGIST_ID || "a0be8dc6-133c-4d30-be1d-9b79deda36d7";

/**
 * Checks if a transaction is related to the ophtalmologist.
 * @param {Object} tx - The transaction object.
 * @returns {boolean} - True if the transaction is related to the ophtalmologist, false otherwise.
 * **/
const isOphtalmologistTx = (tx) => {
  //          ╭─────────────────────────────────────────────────────────╮
  //          │  NOTE: Added a new field doctorId to the transactions   │
  //          │     table to uniquely identify the ophtalmologist's     │
  //          │                      transactions.                      │
  //          ╰─────────────────────────────────────────────────────────╯
  if (tx.doctorId && tx.doctorId === OPHTALMOLOGIST_ID) {
    return true;
  }
  // Backward compatibility: check by name if doctorId is not available
  else {
    return tx.description && tx.description.includes(OPHTALMOLOGIST_NAME);
  }
};

// ──────────────────────────────────────────────────────────────────────
// NOTE: X-ray helper functions to identify X-ray related transactions
// based on their categories.
// ──────────────────────────────────────────────────────────────────────

const XRAY_CATEGORIES = ["XRAY_REVENUE", "XRAY_EXPENSE"];

const isXrayTx = (tx) => XRAY_CATEGORIES.includes(tx.category);

module.exports = { isOphtalmologistTx, isXrayTx, OPHTALMOLOGIST_NAME, OPHTALMOLOGIST_ID };

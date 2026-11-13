// filepath: apps/backend/src/utils/helpers.js

require("dotenv").config();
const { OPHTALMOLOGIST_NAME, OPHTALMOLOGIST_ID } = require("@chehour/utils");

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

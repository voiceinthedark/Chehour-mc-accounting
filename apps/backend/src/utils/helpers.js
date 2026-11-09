// filepath: apps/backend/src/utils/helpers.js

// NOTE: The ophtalmologist name is stored in the environment variable OPHTALMOLOGIST_NAME.
const OPHTALMOLOGIST_NAME = process.env.OPHTALMOLOGIST_NAME || "محمد خليل";

/**
 * Checks if a transaction is related to the ophtalmologist.
 * @param {Object} tx - The transaction object.
 * @returns {boolean} - True if the transaction is related to the ophtalmologist, false otherwise.
 * **/
export const isOphtalmologistTx = (tx) => {
  tx.description.toLowerCase().includes(OPHTALMOLOGIST_NAME.toLowerCase());
};

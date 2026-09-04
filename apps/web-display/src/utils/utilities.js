// filepath: apps/web-display/src/utils/utilities.js

export const formatCurrencyToLebanese = (currency) => {
  // Format the currency to Lebanese Lira format
  return new Intl.NumberFormat("en-LB", {
    style: "currency",
    currency: "LBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currency);
};

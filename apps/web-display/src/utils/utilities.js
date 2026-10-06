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

export const formatLebaneseToDollar = (currency) => {
  return new Intl.NumberFormat("en-LB", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currency);
};

export const saveCurrencyToJsonFile = (currency) => {
  // Save the currency to a JSON file
  const currencyString = JSON.stringify(currency);
  const blob = new Blob([currencyString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "currency.json";
  link.click();
};

export const getCurrencyFromJsonFile = (file) => {
  // Get the currency from a JSON file
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const currency = JSON.parse(event.target.result);
        resolve(currency);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};

export const saveCurrencyToLocalStorage = (currency) => {
  // Save the currency to local storage
  const currencyString = JSON.stringify(currency);
  localStorage.setItem("currencyRateToDollar", currencyString);
};

export const getCurrencyFromLocalStorage = () => {
  // Get the currency from local storage
  const currency = localStorage.getItem("currencyRateToDollar");
  return currency ? JSON.parse(currency) : null;
};

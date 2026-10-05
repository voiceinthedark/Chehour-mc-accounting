// filepath: apps/web-display/src/contexts/currencyContext.jsx

import { createContext, useState, useEffect } from "react";
import {
  getCurrencyFromLocalStorage,
  saveCurrencyToLocalStorage,
} from "../utils/utilities";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencyRate, setCurrencyRate] = useState(0);

  useEffect(() => {
    const storedCurrency = getCurrencyFromLocalStorage();
    if (storedCurrency) {
      setCurrencyRate(storedCurrency.currencyRate);
    }
  }, []);
  const updateCurrencyRate = (newRate) => {
    setCurrencyRate(newRate);
    saveCurrencyToLocalStorage(newRate);
  };

  return (
    <CurrencyContext.Provider value={{ currencyRate, updateCurrencyRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

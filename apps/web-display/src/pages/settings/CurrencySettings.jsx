// filepath: apps/web-display/src/pages/settings/CurrencySettings.jsx

import { use, useState, useEffect } from "react";
import { Typography } from "@mui/material";
import "@fontsource/almarai";
import {
  saveCurrencyToJsonFile,
  getCurrencyFromJsonFile,
  saveCurrencyToLocalStorage,
  getCurrencyFromLocalStorage,
} from "../../utils/utilities";
import { toast } from "react-hot-toast";
import { CurrencyContext } from "../../contexts/CurrencyContext";

const CurrencySettings = () => {
  const { currencyRate, updateCurrencyRate } = use(CurrencyContext);
  const [localCurrencyRate, setLocalCurrencyRate] = useState(currencyRate);

  useEffect(() => {
    const storedCurrency = getCurrencyFromLocalStorage();
    if (storedCurrency) {
      setLocalCurrencyRate(storedCurrency);
      updateCurrencyRate(storedCurrency);
    }
  }, [updateCurrencyRate]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        إعدادات العملة
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        يمكنك تعديل سعر صرف الدولار مقابل الليرة اللبنانية هنا. بعد تعديل السعر،
        سيتم حفظه في ملف JSON على جهازك ويمكنك تحميله لاحقًا.
      </Typography>
      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="currencyRate">سعر الصرف (الدولار مقابل الليرة):</label>
        <input
          type="number"
          id="currencyRate"
          name="currencyRate"
          value={localCurrencyRate}
          step="0.01"
          onChange={(e) => {
            const newRate = parseFloat(e.target.value);
            setLocalCurrencyRate(newRate);
            updateCurrencyRate(newRate);
          }}
          style={{ marginLeft: "1rem", padding: "0.5rem", width: "200px" }}
        />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => {
            if (!isNaN(currencyRate)) {
              saveCurrencyToJsonFile(localCurrencyRate);
              saveCurrencyToLocalStorage(localCurrencyRate);
              toast.success("تم حفظ سعر الصرف بنجاح!");
            } else {
              toast.error("يرجى إدخال قيمة صحيحة لسعر الصرف.");
            }
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          حفظ سعر الصرف
        </button>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <input
          type="file"
          accept=".json"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              try {
                const currency = await getCurrencyFromJsonFile(file);
                if (currency && currency.localCurrencyRate) {
                  setLocalCurrencyRate(currency.localCurrencyRate);
                  updateCurrencyRate(currency.localCurrencyRate);
                }
                saveCurrencyToLocalStorage(currency);
                toast.success("تم تحميل سعر الصرف بنجاح!");
              } catch (error) {
                toast.error(
                  "حدث خطأ أثناء تحميل الملف. يرجى التأكد من صحة الملف.",
                );
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default CurrencySettings;

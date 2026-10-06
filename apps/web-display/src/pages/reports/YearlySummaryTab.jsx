// filepath: apps/web-display/src/pages/reports/YearlySummaryTab.jsx

import { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-hot-toast";
import DollarPill from "../../components/Pills/DollarPill";
import "@fontsource/almarai";
import "@fontsource-variable/montserrat";
import { API_REPORTS_URL } from "../../apiconfig";
import {
  formatCurrencyToLebanese,
  formatLebaneseToDollar,
  getCurrencyFromLocalStorage,
} from "../../utils/utilities";

const YearlySummaryTab = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [localCurrencyRate, setLocalCurrencyRate] = useState(89500);

  useEffect(() => {
    const currency = getCurrencyFromLocalStorage();
    if (currency) setLocalCurrencyRate(currency);
    else setLocalCurrencyRate(89500);
  }, []);

  useEffect(() => {
    // Fetch the yearly summary data from the backend
    const fetchSummaryData = async () => {
      try {
        const response = await axios.get(
          `${API_REPORTS_URL}/total-revenue-expenses/${year}`,
        );
        setSummaryData(response.data);
      } catch (error) {
        console.error("Error fetching yearly summary data:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الملخص السنوي.");
      }
    };

    fetchSummaryData();
  }, [year]);

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        الملخص المالي السنوي
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="year-select-label">
          <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
            اختر السنة
          </Typography>
        </InputLabel>
        <Select
          labelId="year-select-label"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i,
          ).map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {summaryData ? (
        <Grid
          container
          spacing={2}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        >
          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              mb: 2,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "rgb(0, 133, 0, 0.3)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: "Almarai, sans-serif" }}
              >
                إجمالي الإيرادات
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontFamily: "montserrat, sans-serif" }}
              >
                {formatCurrencyToLebanese(summaryData.totalRevenue)}
              </Typography>

              <DollarPill
                position={"top-left"}
                amountInDollars={formatLebaneseToDollar(
                  summaryData.totalRevenue / localCurrencyRate,
                )}
              />
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              mb: 2,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",

              position: "relative",
            }}
          >
            <DollarPill
              position={"top-left"}
              amountInDollars={formatLebaneseToDollar(
                summaryData.totalExpenses / localCurrencyRate,
              )}
            />
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "#ffebee",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                opacity:
                  summaryData.totalExpenses > summaryData.totalRevenue
                    ? 0.5
                    : 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: "Almarai, sans-serif" }}
              >
                إجمالي المصاريف
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontFamily: "montserrat, sans-serif" }}
              >
                {formatCurrencyToLebanese(summaryData.totalExpenses)}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              mb: 2,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              position: "relative",
            }}
          >
            <DollarPill
              position={"top-left"}
              amountInDollars={formatLebaneseToDollar(
                summaryData.netProfit / localCurrencyRate,
              )}
            />
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "#e3f2fd",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                opacity: summaryData.netProfit < 0 ? 0.5 : 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: "Almarai, sans-serif" }}
              >
                صافي الربح
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontFamily: "montserrat, sans-serif" }}
              >
                {formatCurrencyToLebanese(summaryData.netProfit)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Typography
          variant="body1"
          sx={{
            fontFamily: "Almarai, sans-serif",
          }}
        >
          جاري تحميل البيانات...
        </Typography>
      )}
    </div>
  );
};

export default YearlySummaryTab;

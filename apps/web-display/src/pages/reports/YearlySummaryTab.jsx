// filepath: apps/web-display/src/pages/reports/YearlySummaryTab.jsx

import { useState, useEffect, useCallback } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Typography, Grid, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
import { monthArabic } from "@chehour/utils";

const YearlySummaryTab = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [localCurrencyRate, setLocalCurrencyRate] = useState(89500);
  const [yearlyData, setYearlyData] = useState([]); // State to hold the yearly data for the line chart
  const [ophtalmologistData, setOphtalmologistData] = useState([]); // State to hold the ophtalmologist data for the line chart

  const fetchYearlyData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_REPORTS_URL}/yearly-summary/${year}`);

      const monthlyData = response.data.monthly;

      setYearlyData(
        monthlyData.map((item) => ({
          month: monthArabic[item.period.month] || item.period.month,
          totalInflow: parseFloat(item.totalInflow),
          totalOutflow: parseFloat(item.totalOutflow),
          netProfit: parseFloat(item.netProfit),
        })),
      );
    } catch (error) {
      console.error("Error fetching yearly data for line chart:", error);
      toast.error("حدث خطأ أثناء جلب بيانات الملخص السنوي للرسم البياني.");
    }
  }, [year]);

  const fetchOphtalmologistData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_REPORTS_URL}/yearly-summary/${year}`);
      const monthlyData = response.data.monthly;

      setOphtalmologistData(
        monthlyData.map((item) => ({
          month: monthArabic[item.period.month] || item.period.month,
          net: parseFloat(item.ophtalmologist?.net || 0),
        })),
      );
    } catch (error) {
      console.error("Error fetching ophtalmologist data for line chart:", error);
      toast.error("حدث خطأ أثناء جلب بيانات طبيب العيون للرسم البياني.");
    }
  }, [year]);

  useEffect(() => {
    const currency = getCurrencyFromLocalStorage();
    if (currency) setLocalCurrencyRate(currency);
    else setLocalCurrencyRate(89500);
  }, []);

  useEffect(() => {
    // Fetch the yearly summary data from the backend
    const fetchSummaryData = async () => {
      try {
        const response = await axios.get(`${API_REPORTS_URL}/total-revenue-expenses/${year}`);
        setSummaryData(response.data);
      } catch (error) {
        console.error("Error fetching yearly summary data:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الملخص السنوي.");
      }
    };

    fetchSummaryData();
    fetchYearlyData(); // Fetch the yearly data for the line chart
    fetchOphtalmologistData(); // Fetch the ophtalmologist data for the line chart
  }, [year, fetchYearlyData, fetchOphtalmologistData]);

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Almarai, sans-serif" }}>
        الملخص المالي السنوي
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="year-select-label">
          <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>اختر السنة</Typography>
        </InputLabel>
        <Select labelId="year-select-label" value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {summaryData ? (
        <Grid
          container
          wrap="wrap"
          alignItems="stretch"
          alignContent="stretch"
          spacing={2}
          justifyContent="space-around"
          sx={{
            mt: 2,
            display: "flex",
            fontSize: "1rem",
          }}
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
                backgroundColor: "rgb(0, 173, 0, 0.3)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                position: "relative",
                fontWeight: "thin",
              }}
              variant="outlined"
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  color: "rgb(51, 133, 10)",
                }}
              >
                إجمالي الإيرادات
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "montserrat, sans-serif",
                  color: "rgb(51, 133, 90)",
                }}
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
                opacity: summaryData.totalExpenses > summaryData.totalRevenue ? 0.8 : 1,
              }}

              variant="outlined"
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  color: "rgb(255, 0, 0)",
                }}
              >
                إجمالي المصاريف
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "montserrat, sans-serif",
                  color: "rgb(255, 0, 0)",
                }}
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
              amountInDollars={formatLebaneseToDollar(summaryData.netProfit / localCurrencyRate)}
            />
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "rgb(0, 0, 155, 0.1)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                opacity: summaryData.netProfit < 0 ? 0.5 : 1,
              }}

              variant="outlined"
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  color: "rgb(0, 0, 100)",
                }}
              >
                رصيد حالي
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "montserrat, sans-serif",
                  color: "rgb(0, 0, 100)",
                }}
              >
                {formatCurrencyToLebanese(summaryData.netProfit)}
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ mb: 2, textAlign: "center", backgroundColor: "#f5f5f5", borderRadius: "8px" }}
            position={"relative"}
          >
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "rgb(0, 173, 0, 0.3)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}

              variant="outlined"
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  color: "rgb(51, 133, 10)",
                }}
              >
                مدخول طبيب العيون
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "montserrat, sans-serif",
                  color: "rgb(51, 133, 90)",
                }}
              >
                {summaryData.ophtalmologist
                  ? formatCurrencyToLebanese(summaryData.ophtalmologist.revenue)
                  : "—"}
              </Typography>
            </Box>

            <DollarPill
              position={"top-right"}
              amountInDollars={
                summaryData.ophtalmologist
                  ? formatLebaneseToDollar(summaryData.ophtalmologist.revenue / localCurrencyRate)
                  : "—"
              }
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ mb: 2, textAlign: "center", backgroundColor: "#f5f5f5", borderRadius: "8px" }}
            position={"relative"}
          >
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "#ffebee",
                opacity:
                  summaryData.ophtalmologist?.expenses > summaryData.ophtalmologist?.revenue
                    ? 0.8
                    : 1,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}

              variant="outlined"
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  color: "rgb(255, 0, 0)",
                }}
              >
                مصاريف طبيب العيون
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "montserrat, sans-serif",
                  color: "rgb(255, 0, 0)",
                }}
              >
                {summaryData.ophtalmologist
                  ? formatCurrencyToLebanese(summaryData.ophtalmologist.expenses)
                  : "—"}
              </Typography>
            </Box>

            <DollarPill
              position={"top-right"}
              amountInDollars={
                summaryData.ophtalmologist
                  ? formatLebaneseToDollar(summaryData.ophtalmologist.expenses / localCurrencyRate)
                  : "—"
              }
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ mb: 2, textAlign: "center", backgroundColor: "#f5f5f5", borderRadius: "8px" }}
            position={"relative"}
          >
            <Box
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                backgroundColor: "rgb(0, 0, 155, 0.1)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}

              variant="outlined"
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  color: "rgb(0, 0, 100)",
                }}
              >
                رصيد طبيب العيون
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "montserrat, sans-serif",
                  color: "rgb(0, 0, 100)",
                }}
              >
                {summaryData.ophtalmologist
                  ? formatCurrencyToLebanese(summaryData.ophtalmologist.net)
                  : "—"}
              </Typography>
            </Box>

            <DollarPill
              position={"top-right"}
              amountInDollars={
                summaryData.ophtalmologist
                  ? formatLebaneseToDollar(summaryData.ophtalmologist.net / localCurrencyRate)
                  : "—"
              }
            />
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontFamily: "Almarai, sans-serif", mb: 2 }}>
              ملخص الإيرادات والمصاريف على مدار السنة
            </Typography>
            {yearlyData.length > 0 ? (
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: yearlyData.map((item) => item.month),
                    tickLabelStyle: {
                      fontFamily: "Almarai, sans-serif",
                      fontSize: 12,
                    },
                  },
                ]}
                series={[
                  {
                    data: yearlyData.map((item) => item.totalInflow),
                    label: "الإيرادات",
                    color: "rgb(51, 133, 10)",
                    area: true,
                  },
                  {
                    data: yearlyData.map((item) => item.totalOutflow),
                    label: "المصاريف",
                    color: "rgb(255, 0, 0)",
                    area: true,
                  },
                  {
                    data: yearlyData.map((item) => item.netProfit),
                    label: "الرصيد الشهري",
                    color: "rgb(0, 0, 255)",
                    area: true,
                  },
                  {
                    data: ophtalmologistData.map((item) => item.net),
                    label: "رصيد طبيب العيون",
                    color: "rgb(0, 173, 0)",
                    area: true,
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "المبلغ (ل.ل)",
                    tickFormat: (value) => formatCurrencyToLebanese(value),
                    tickLabelStyle: {
                      fontFamily: "Almarai, sans-serif",
                    },
                  },
                ]}
                onLineClick={(seriesIndex, pointIndex) => {
                  const clickedData = yearlyData[pointIndex];
                  toast(
                    `شهر: ${clickedData.month}, الإيرادات: ${formatCurrencyToLebanese(
                      clickedData.totalInflow,
                    )}, المصاريف: ${formatCurrencyToLebanese(
                      clickedData.totalOutflow,
                    )}, الرصيد الشهري: ${formatCurrencyToLebanese(clickedData.netProfit)}`,
                  );
                }}
                width={980}
                height={500}
                sx={{ mt: 3 }}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Almarai, sans-serif",
                  mt: 2,
                }}
              >
                جاري تحميل بيانات الرسم البياني...
              </Typography>
            )}
          </Box>
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

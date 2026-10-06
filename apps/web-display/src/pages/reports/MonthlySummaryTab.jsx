import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import MonthYearSelector from "../../components/MonthYearSelector";
import DollarPill from "../../components/Pills/DollarPill";
import { API_REPORTS_URL } from "../../apiconfig";
import {
  formatLebaneseToDollar,
  getCurrencyFromLocalStorage,
} from "../../utils/utilities";

const CATEGORY_LABELS = {
  PATIENT_FEE: "رسوم المرضى",
  SERVICE_FEE: "رسوم الخدمات",
  DOCTOR_PAYOUT: "مدفوعات الأطباء",
  LAB_COST: "تكلفة المختبر",
  LAB_REVENUE: "إيرادات المختبر",
  CHARITY_EXPENSE: "نفقات التغطية",
  GENERAL_EXPENSE: "مصاريف عامة",
};

// ============================================================
// TAB 2 — MONTHLY FINANCIAL SUMMARY
// ============================================================
function MonthlySummaryTab() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localCurrencyRate, setLocalCurrencyRate] = useState(89500);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_REPORTS_URL}/monthly-summary/${year}/${month}`,
      );
      setSummary(res.data);
    } catch {
      toast.error("فشل تحميل الملخص المالي");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const currency = getCurrencyFromLocalStorage();
    if (currency) setLocalCurrencyRate(currency);
    else setLocalCurrencyRate(89500);
  }, []);

  const netIsPositive = summary && Number(summary.netProfit) >= 0;

  return (
    <Box>
      <MonthYearSelector
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !summary ? null : (
        <>
          {/* Top KPI cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4} sx={{ position: "relative" }}>
              <Card variant="outlined" sx={{ bgcolor: "#f0fdf4" }}>
                <CardContent>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "success.dark",
                    }}
                  >
                    إجمالي الإيرادات
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: "success.dark" }}
                  >
                    {Number(summary.totalInflow).toLocaleString()}
                  </Typography>
                  <DollarPill
                    position={"top-right"}
                    amountInDollars={formatLebaneseToDollar(
                      summary.totalInflow / localCurrencyRate,
                    )}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "text.secondary",
                    }}
                  >
                    ل.ل
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ position: "relative" }}>
              <Card variant="outlined" sx={{ bgcolor: "#fff1f2" }}>
                <CardContent>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "error.dark",
                    }}
                  >
                    إجمالي المصاريف
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: "error.dark" }}
                  >
                    {Number(summary.totalOutflow).toLocaleString()}
                  </Typography>
                  <DollarPill
                    position={"top-right"}
                    amountInDollars={formatLebaneseToDollar(
                      summary.totalOutflow / localCurrencyRate,
                    )}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "text.secondary",
                    }}
                  >
                    ل.ل
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ position: "relative" }}>
              <Card
                variant="outlined"
                sx={{ bgcolor: netIsPositive ? "#eff6ff" : "#fff7ed" }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: netIsPositive ? "primary.dark" : "warning.dark",
                    }}
                  >
                    صافي الربح
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                      color: netIsPositive ? "primary.dark" : "warning.dark",
                    }}
                  >
                    {Number(summary.netProfit).toLocaleString()}
                  </Typography>
                  <DollarPill
                    amountInDollars={formatLebaneseToDollar(
                      summary.netProfit / localCurrencyRate,
                    )}
                    position={"top-right"}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "text.secondary",
                    }}
                  >
                    ل.ل
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Category breakdown */}
          {Object.keys(summary.categoryBreakdown).length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: "Almarai, sans-serif" }}
                      >
                        الفئة
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: "Almarai, sans-serif",
                          color: "success.dark",
                        }}
                      >
                        وارد (ل.ل)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: "Almarai, sans-serif",
                          color: "error.dark",
                        }}
                      >
                        صادر (ل.ل)
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(summary.categoryBreakdown).map(
                    ([cat, vals]) => (
                      <TableRow key={cat} hover>
                        <TableCell>
                          <Typography
                            sx={{ fontFamily: "Almarai, sans-serif" }}
                          >
                            {CATEGORY_LABELS[cat] ?? cat}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color:
                                Number(vals.inflow) > 0
                                  ? "success.dark"
                                  : "text.disabled",
                            }}
                          >
                            {Number(vals.inflow) > 0
                              ? Number(vals.inflow).toLocaleString()
                              : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color:
                                Number(vals.outflow) > 0
                                  ? "error.dark"
                                  : "text.disabled",
                            }}
                          >
                            {Number(vals.outflow) > 0
                              ? Number(vals.outflow).toLocaleString()
                              : "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {Object.keys(summary.categoryBreakdown).length === 0 && (
            <Typography
              sx={{
                fontFamily: "Almarai, sans-serif",
                color: "text.secondary",
                textAlign: "center",
                py: 4,
              }}
            >
              لا توجد معاملات مسجّلة لهذا الشهر
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

export default MonthlySummaryTab;

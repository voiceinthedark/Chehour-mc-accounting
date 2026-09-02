// filepath: apps/web-display/src/pages/reports/Reports.jsx

import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "@fontsource/almarai";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  API_BILLING_URL,
  API_REPORTS_URL,
  API_RECEPTION_URL,
} from "../../apiconfig";

const MONTH_NAMES = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

const CATEGORY_LABELS = {
  PATIENT_FEE: "رسوم المرضى",
  SERVICE_FEE: "رسوم الخدمات",
  DOCTOR_PAYOUT: "مدفوعات الأطباء",
  LAB_COST: "تكلفة المختبر",
  LAB_REVENUE: "إيرادات المختبر",
  CHARITY_EXPENSE: "نفقات التغطية",
  GENERAL_EXPENSE: "مصاريف عامة",
};

function MonthYearSelector({ month, year, onMonthChange, onYearChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontFamily: "Almarai, sans-serif" }}>
            الشهر
          </InputLabel>
          <Select
            value={month}
            label="الشهر"
            onChange={(e) => onMonthChange(e.target.value)}
          >
            {MONTH_NAMES.map((name, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                  {name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={3}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontFamily: "Almarai, sans-serif" }}>
            السنة
          </InputLabel>
          <Select
            value={year}
            label="السنة"
            onChange={(e) => onYearChange(e.target.value)}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                  {y}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

// ============================================================
// TAB 1 — DOCTOR PAYOUTS
// ============================================================
function DoctorPayoutsTab() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BILLING_URL}/payouts/${year}/${month}`,
      );
      setPayouts(res.data);
    } catch {
      toast.error("فشل تحميل بيانات المدفوعات");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleViewDetail = async (doctorId) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setDetailData(null);
    try {
      const res = await axios.get(
        `${API_BILLING_URL}/payout/${doctorId}/${year}/${month}`,
      );
      setDetailData({ ...res.data, doctorId });
    } catch {
      toast.error("فشل تحميل تفاصيل الطبيب");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmPayout = async (doctorId) => {
    setConfirmingId(doctorId);
    try {
      await axios.post(
        `${API_BILLING_URL}/payout/${doctorId}/${year}/${month}/confirm`,
      );
      toast.success("تم تأكيد الدفع وتسجيله في الدفتر");
      setDetailOpen(false);
      fetchPayouts();
    } catch {
      toast.error("فشل تأكيد الدفع");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDeleteClick = (tallyId) => {
    setPendingDeleteId(tallyId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    setDeleteConfirmOpen(false);
    setDeletingId(pendingDeleteId);
    try {
      await axios.delete(
        `${API_RECEPTION_URL}/monthly-tally/${pendingDeleteId}`,
      );
      toast.success("تم حذف التقرير الشهري بنجاح");
      fetchPayouts();
    } catch {
      toast.error("فشل حذف التقرير الشهري");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const handleDeleteCancelled = () => {
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
  };

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
      ) : payouts.length === 0 ? (
        <Typography
          sx={{
            fontFamily: "Almarai, sans-serif",
            color: "text.secondary",
            py: 4,
            textAlign: "center",
          }}
        >
          لا توجد بيانات شهرية لهذا الشهر
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    الطبيب
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    الزيارات
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    المرضى
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    المبلغ المستحق
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    الحالة
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {payouts.map((row) => (
                <TableRow
                  key={row.doctorId}
                  sx={{
                    bgcolor: row.financials
                      ? Number(row.financials.centerConsultationNet) >= 0
                        ? "#f0fdf4"
                        : "#fff1f2"
                      : undefined,
                  }}
                >
                  <TableCell>
                    <Typography
                      sx={{
                        fontFamily: "Almarai, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {row.doctorName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                      {row.stats?.totalVisits ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                      {row.stats?.totalPatients ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontFamily: "Almarai, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {row.financials
                        ? `${Number(row.financials.totalOwed).toLocaleString()} ل.ل`
                        : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {row.isPaidOut ? (
                      <Chip label="مدفوع" color="success" size="small" />
                    ) : (
                      <Chip label="غير مدفوع" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetail(row.doctorId)}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: "Almarai, sans-serif" }}
                      >
                        عرض التفاصيل
                      </Typography>
                    </Button>
                    {!row.isPaidOut && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={deletingId === row.tallyId}
                        onClick={() => handleDeleteClick(row.tallyId)}
                        sx={{ ml: 1 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: "Almarai, sans-serif" }}
                        >
                          {deletingId === row.tallyId ? "..." : "حذف"}
                        </Typography>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* DETAIL DIALOG */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: "Almarai, sans-serif" }}>
          تفاصيل مستحقات الطبيب — {MONTH_NAMES[month - 1]} {year}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading || !detailData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !detailData.financials ? (
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              {detailData.message}
            </Typography>
          ) : (
            <Box>
              {detailData.dataWarning && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "#fff7ed",
                    border: "1px solid #fdba74",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "warning.dark",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    ⚠ {detailData.dataWarning}
                  </Typography>
                </Box>
              )}
              {/* Stats row */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1 }}>
                      <Typography variant="h5" fontWeight={700}>
                        {detailData.stats.totalVisits}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "Almarai, sans-serif",
                          color: "text.secondary",
                        }}
                      >
                        أيام الحضور
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1 }}>
                      <Typography variant="h5" fontWeight={700}>
                        {detailData.stats.totalPatients}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "Almarai, sans-serif",
                          color: "text.secondary",
                        }}
                      >
                        إجمالي المرضى
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1 }}>
                      <Chip
                        size="small"
                        color={
                          detailData.stats.appliedRule === "PER_VISIT_FEE"
                            ? "warning"
                            : detailData.stats.appliedRule === "MIXED"
                              ? "secondary"
                              : "primary"
                        }
                        label={
                          detailData.stats.appliedRule === "PER_VISIT_FEE"
                            ? "تعرفة زيارة"
                            : detailData.stats.appliedRule === "MIXED"
                              ? "مختلطة"
                              : "تعرفة مريض"
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "Almarai, sans-serif",
                          color: "text.secondary",
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        القاعدة المطبقة
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Financials breakdown */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "text.secondary",
                    }}
                  >
                    أجر الاستشارات
                  </Typography>
                  <Typography
                    sx={{ fontFamily: "Almarai, sans-serif", fontWeight: 600 }}
                  >
                    {Number(
                      detailData.financials.consultationPay,
                    ).toLocaleString()}{" "}
                    ل.ل
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "text.secondary",
                    }}
                  >
                    أجر الخدمات (EKG, Echo…)
                  </Typography>
                  <Typography
                    sx={{ fontFamily: "Almarai, sans-serif", fontWeight: 600 }}
                  >
                    {Number(detailData.financials.servicePay).toLocaleString()}{" "}
                    ل.ل
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                    }}
                  >
                    الإجمالي المستحق
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "primary.main",
                    }}
                  >
                    {Number(detailData.financials.totalOwed).toLocaleString()}{" "}
                    ل.ل
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "error.main",
                      fontSize: "0.85rem",
                    }}
                  >
                    تكلفة التغطية على المركز في ايام العجز
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "error.main",
                      fontSize: "0.85rem",
                    }}
                  >
                    {Number(
                      detailData.financials.charityCostToCenter,
                    ).toLocaleString()}{" "}
                    ل.ل
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor:
                      Number(detailData.financials.centerConsultationNet) >= 0
                        ? "#f0fdf4"
                        : "#fff1f2",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      fontWeight: 700,
                      color:
                        Number(detailData.financials.centerConsultationNet) >= 0
                          ? "success.dark"
                          : "error.dark",
                      fontSize: "0.95rem",
                    }}
                  >
                    صافي المركز من الاستشارات
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      fontWeight: 700,
                      color:
                        Number(detailData.financials.centerConsultationNet) >= 0
                          ? "success.dark"
                          : "error.dark",
                      fontSize: "0.95rem",
                    }}
                  >
                    {Number(
                      detailData.financials.centerConsultationNet,
                    ).toLocaleString()}{" "}
                    ل.ل{" "}
                    {Number(detailData.financials.centerConsultationNet) >= 0
                      ? "▲"
                      : "▼"}
                  </Typography>
                </Box>
                {detailData.financials.serviceRevenue !== undefined && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor:
                        Number(detailData.financials.centerServiceNet) >= 0
                          ? "#f0fdf4"
                          : "#fff1f2",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Almarai, sans-serif",
                        fontWeight: 700,
                        color:
                          Number(detailData.financials.centerServiceNet) >= 0
                            ? "success.dark"
                            : "error.dark",
                        fontSize: "0.95rem",
                      }}
                    >
                      صافي المركز من الخدمات (إجمالي التحصيل{" "}
                      {Number(
                        detailData.financials.serviceRevenue,
                      ).toLocaleString()}{" "}
                      ل.ل)
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Almarai, sans-serif",
                        fontWeight: 700,
                        color:
                          Number(detailData.financials.centerServiceNet) >= 0
                            ? "success.dark"
                            : "error.dark",
                        fontSize: "0.95rem",
                      }}
                    >
                      {Number(
                        detailData.financials.centerServiceNet,
                      ).toLocaleString()}{" "}
                      ل.ل{" "}
                      {Number(detailData.financials.centerServiceNet) >= 0
                        ? "▲"
                        : "▼"}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Almarai, sans-serif",
                      color: "text.secondary",
                      fontSize: "0.85rem",
                    }}
                  >
                    ملاحظة: تكلفة التغطية على المركز لا تخصم من مستحقات الطبيب
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{ fontFamily: "Almarai, sans-serif" }}
          >
            إغلاق
          </Button>
          {detailData && detailData.financials && !detailData.isPaidOut && (
            <Button
              variant="contained"
              color="success"
              disabled={confirmingId === detailData?.doctorId}
              onClick={() => handleConfirmPayout(detailData.doctorId)}
            >
              <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                {confirmingId === detailData?.doctorId
                  ? "جاري التأكيد..."
                  : "تأكيد الدفع ✓"}
              </Typography>
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancelled}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: "Almarai, sans-serif" }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
            هل أنت متأكد من حذف هذا التقرير الشهري؟ لا يمكن التراجع عن هذا
            الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancelled}
            sx={{ fontFamily: "Almarai, sans-serif" }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirmed}
          >
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              حذف
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ============================================================
// TAB 2 — MONTHLY FINANCIAL SUMMARY
// ============================================================
function MonthlySummaryTab() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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

// ============================================================
// ROOT COMPONENT
// ============================================================
const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        تقارير النظام
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label={
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              مستحقات الأطباء
            </Typography>
          }
        />
        <Tab
          label={
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              الملخص المالي الشهري
            </Typography>
          }
        />
      </Tabs>

      {activeTab === 0 && <DoctorPayoutsTab />}
      {activeTab === 1 && <MonthlySummaryTab />}
    </div>
  );
};

export default Reports;

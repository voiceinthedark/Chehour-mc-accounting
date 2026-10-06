import { useState, useCallback, useEffect } from "react";
import MonthYearSelector from "../../components/MonthYearSelector";
import {
  Box,
  Typography,
  CircularProgress,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
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
        <DialogTitle
          sx={{
            fontFamily: "Almarai, sans-serif",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            تفاصيل مستحقات الطبيب — {MONTH_NAMES[month - 1]} {year}
          </span>
          {detailData?.isPaidOut && (
            <Chip label="مدفوع" color="success" size="small" />
          )}
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
                {detailData.financials.revisionPay !== undefined && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Almarai, sans-serif",
                        color: "text.secondary",
                      }}
                    >
                      أجر المراجعات ({detailData.stats.revisionPatients ?? 0})
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Almarai, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {Number(
                        detailData.financials.revisionPay,
                      ).toLocaleString()}{" "}
                      ل.ل
                    </Typography>
                  </Box>
                )}
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

export default DoctorPayoutsTab;

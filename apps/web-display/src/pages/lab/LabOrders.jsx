// filepath: apps/web-display/src/pages/lab/LabOrders.jsx

import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import "@fontsource/almarai";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_LAB_URL } from "../../apiconfig";

const LAB_MARKUP = 1.4;

export default function LabOrders() {
  // Form state
  const [patientName, setPatientName] = useState("");
  const [testName, setTestName] = useState("");
  const [labCost, setLabCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // List state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const centerCharge =
    labCost && !isNaN(Number(labCost))
      ? (Number(labCost) * LAB_MARKUP).toLocaleString()
      : "—";

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API_LAB_URL}/lab-orders`);
      setOrders(res.data);
    } catch {
      toast.error("فشل تحميل طلبات المختبر");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName || !labCost || isNaN(Number(labCost)) || Number(labCost) <= 0) {
      toast.error("يرجى إدخال اسم الفحص وتكلفة المختبر");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_LAB_URL}/lab-orders`, {
        patientName: patientName.trim() || undefined,
        testName: testName.trim(),
        labCost: Number(labCost),
      });
      toast.success("تم تسجيل طلب المختبر وقيد المبالغ في الدفتر");
      setPatientName("");
      setTestName("");
      setLabCost("");
      fetchOrders();
    } catch {
      toast.error("فشل تسجيل طلب المختبر");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        طلبات المختبر
      </Typography>

      {/* NEW ORDER FORM */}
      <Card sx={{ mb: 4, bgcolor: "#f8fafc" }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontFamily: "Almarai, sans-serif", mb: 2 }}
            gutterBottom
          >
            تسجيل طلب جديد
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="اسم المريض (اختياري)"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  inputProps={{ style: { fontFamily: "Almarai, sans-serif" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="اسم الفحص"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  inputProps={{ style: { fontFamily: "Almarai, sans-serif" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="تكلفة المختبر (ل.ل)"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={labCost}
                  onChange={(e) => setLabCost(e.target.value)}
                  helperText={`سعر المريض (×1.4): ${centerCharge} ل.ل`}
                />
              </Grid>
            </Grid>

            {/* Live preview */}
            {labCost && !isNaN(Number(labCost)) && Number(labCost) > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#eff6ff",
                  borderRadius: 1,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "Almarai, sans-serif", color: "error.dark" }}
                  >
                    مستحق للمختبر
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "error.dark" }}
                  >
                    {Number(labCost).toLocaleString()} ل.ل
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "Almarai, sans-serif", color: "success.dark" }}
                  >
                    يُحصَّل من المريض
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "success.dark" }}
                  >
                    {(Number(labCost) * LAB_MARKUP).toLocaleString()} ل.ل
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "Almarai, sans-serif", color: "primary.dark" }}
                  >
                    هامش الربح
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "primary.dark" }}
                  >
                    {(Number(labCost) * (LAB_MARKUP - 1)).toLocaleString()} ل.ل
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ mt: 3 }}
            >
              <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                {submitting ? "جاري التسجيل..." : "تسجيل الطلب وقيده في الدفتر"}
              </Typography>
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ORDERS TABLE */}
      <Typography
        variant="h6"
        sx={{ fontFamily: "Almarai, sans-serif", mb: 2 }}
      >
        سجل الطلبات
      </Typography>

      {loadingOrders ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography
          sx={{
            fontFamily: "Almarai, sans-serif",
            color: "text.secondary",
            textAlign: "center",
            py: 4,
          }}
        >
          لا توجد طلبات مسجّلة بعد
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    التاريخ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    المريض
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    الفحص
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif", color: "error.dark" }}
                  >
                    تكلفة المختبر (ل.ل)
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: "Almarai, sans-serif", color: "success.dark" }}
                  >
                    سعر المريض (ل.ل)
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
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.date).toLocaleDateString("ar-LB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{ fontFamily: "Almarai, sans-serif" }}
                    >
                      {order.patientName || (
                        <span style={{ color: "#aaa" }}>—</span>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{ fontFamily: "Almarai, sans-serif", fontWeight: 500 }}
                    >
                      {order.testName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ color: "error.dark" }}>
                      {Number(order.labCost).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ color: "success.dark", fontWeight: 600 }}>
                      {Number(order.centerCharge).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {order.isSettled ? (
                      <Chip label="مقيَّد" color="success" size="small" />
                    ) : (
                      <Chip label="معلّق" color="warning" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

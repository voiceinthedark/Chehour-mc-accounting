// filepath: apps/web-display/src/pages/billing/MonthlyEntry.jsx

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  TextField,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
} from "@mui/material";
import "@fontsource/almarai";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BILLING_URL, API_RECEPTION_URL } from "../../apiconfig";

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

export default function MonthlyEntry() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // Settings State
  const [perPatientFee, setPerPatientFee] = useState("");
  const [doctorPatientCut, setDoctorPatientCut] = useState("");
  const [perVisitFee, setPerVisitFee] = useState("");

  // Monthly Data Entry State
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year] = useState(new Date().getFullYear());
  const [totalVisits, setTotalVisits] = useState(0);
  const [coveredVisits, setCoveredVisits] = useState(0);
  const [regularPatients, setRegularPatients] = useState(0);
  const [charityPatients, setCharityPatients] = useState(0);

  // Services State: { serviceId: { regularCount, charityCount } }
  const [services, setServices] = useState([]);
  const [serviceCounts, setServiceCounts] = useState({});

  useEffect(() => {
    axios
      .get(`${API_RECEPTION_URL}/doctors`)
      .then((res) => setDoctors(res.data))
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_RECEPTION_URL}/services`)
      .then((res) => setServices(res.data))
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setPerPatientFee(doc.perPatientFee);
      setDoctorPatientCut(doc.doctorPatientCut);
      setPerVisitFee(doc.perVisitFee);
    }
  };

  const handleServiceCountChange = (serviceId, field, value) => {
    setServiceCounts((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put(
        `${API_RECEPTION_URL}/doctors/${selectedDoctorId}/settings`,
        { perPatientFee, doctorPatientCut, perVisitFee },
      );
      toast.success("تم حفظ الاعدادات");
    } catch (err) {
      toast.error("فشل حفظ الاعدادات");
    }
  };

  const handleSubmitTally = async () => {
    const servicesUsed = services
      .filter(
        (s) =>
          (serviceCounts[s.id]?.regularCount || 0) > 0 ||
          (serviceCounts[s.id]?.charityCount || 0) > 0,
      )
      .map((s) => ({
        serviceId: s.id,
        regularCount: Number(serviceCounts[s.id]?.regularCount || 0),
        charityCount: Number(serviceCounts[s.id]?.charityCount || 0),
      }));

    try {
      await axios.post(`${API_RECEPTION_URL}/monthly-tally`, {
        doctorId: selectedDoctorId,
        month,
        year,
        totalVisits: Number(totalVisits),
        coveredVisits: Number(coveredVisits),
        regularPatients: Number(regularPatients),
        charityPatients: Number(charityPatients),
        servicesUsed,
      });
      toast.success("تم حفظ البيانات الشهرية");
    } catch (err) {
      toast.error("فشل حفظ البيانات الشهرية");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        sx={{ fontFamily: "almarai, sans-serif" }}
        gutterBottom
      >
        حسابات شهرية للطبيب
      </Typography>

      {/* 1. DOCTOR SELECTION */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>
              <Typography
                variant="h6"
                sx={{ fontFamily: "Almarai, sans-serif" }}
              >
                اختر الطبيب
              </Typography>
            </InputLabel>
            <Select value={selectedDoctorId} onChange={handleDoctorChange}>
              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    {doc.name}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedDoctorId && (
        <>
          {/* 2. DOCTOR FINANCIAL SETTINGS */}
          <Card sx={{ mb: 4, bgcolor: "#f8fafc" }}>
            <CardContent>
              <Typography
                variant="h4"
                color="primary"
                sx={{ fontFamily: "Almarai, sans-serif", marginBottom: "1rem" }}
                gutterBottom
              >
                اعدادات مالية للطبيب
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="تعرفة المركز للمريض (ل.ل)"
                    helperText="المبلغ الذي يدفعه المريض للمركز"
                    type="number"
                    value={perPatientFee}
                    onChange={(e) => setPerPatientFee(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="حصة الطبيب من كل مريض (ل.ل)"
                    helperText="المبلغ الذي يتقاضاه الطبيب لكل مريض"
                    type="number"
                    value={doctorPatientCut}
                    onChange={(e) => setDoctorPatientCut(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="تعرفة لكل زيارة (ل.ل)"
                    helperText="تدفع في حال اتى اقل من 5 مرضى في اليوم"
                    type="number"
                    value={perVisitFee}
                    onChange={(e) => setPerVisitFee(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handleSaveSettings}
              >
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "Almarai, sans-serif" }}
                >
                  حفظ الاعدادات
                </Typography>
              </Button>
            </CardContent>
          </Card>

          {/* 3. MONTHLY DATA ENTRY */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontFamily: "almarai, sans-serif" }}
                gutterBottom
              >
                بيانات شهرية للطبيب
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Month Selector */}
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontFamily: "Almarai, sans-serif" }}>
                      الشهر
                    </InputLabel>
                    <Select
                      value={month}
                      label="الشهر"
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      {MONTH_NAMES.map((name, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          <Typography
                            sx={{ fontFamily: "Almarai, sans-serif" }}
                          >
                            {name}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="الزيارات الكلية"
                    helperText="عدد الأيام التي حضر فيها الطبيب"
                    type="number"
                    value={totalVisits}
                    onChange={(e) => setTotalVisits(e.target.value)}
                  />
                </Grid>
                {perVisitFee > 0 && (
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="أيام التغطية"
                      helperText="أيام كان فيها أقل من 5 مرضى"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={coveredVisits}
                      onChange={(e) => setCoveredVisits(e.target.value)}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="عدد المرضى المنتظمين"
                    type="number"
                    value={regularPatients}
                    onChange={(e) => setRegularPatients(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="عدد المرضى المغطين"
                    type="number"
                    value={charityPatients}
                    onChange={(e) => setCharityPatients(e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* SERVICES */}
              <Typography
                variant="h6"
                sx={{ fontFamily: "almarai, sans-serif", mt: 1 }}
                gutterBottom
              >
                الخدمات المستخدمة
              </Typography>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    الخدمة
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    عدد مرضى منتظمين
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    عدد مرضى مغطين
                  </Typography>
                </Grid>
              </Grid>
              {services.map((service) => (
                <Grid
                  columnSpacing={2}
                  container
                  spacing={3}
                  key={service.id}
                  sx={{
                    mb: 1,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        rontFamily: "almarai, sans-serif",
                        fontWeight: "bold",
                      }}
                    >
                      {service.name}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "flex-end",
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="منتظمين"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={serviceCounts[service.id]?.regularCount || ""}
                      onChange={(e) =>
                        handleServiceCountChange(
                          service.id,
                          "regularCount",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="مغطين"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={serviceCounts[service.id]?.charityCount || ""}
                      onChange={(e) =>
                        handleServiceCountChange(
                          service.id,
                          "charityCount",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>
                </Grid>
              ))}

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleSubmitTally}
              >
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "Almarai, sans-serif" }}
                >
                  حفظ البيانات الشهرية
                </Typography>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

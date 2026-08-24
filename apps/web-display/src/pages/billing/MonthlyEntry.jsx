// filepath: apps/web-display/src/pages/MonthlyEntry.jsx

import React, { useState, useEffect } from "react";
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
import "@fontsource/almarai"; // Import the Almarai font
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BILLING_URL, API_RECEPTION_URL } from "../../apiconfig";

export default function MonthlyEntry() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // Settings State
  const [perPatientFee, setPerPatientFee] = useState("");
  const [perVisitFee, setPerVisitFee] = useState("");

  // Monthly Data Entry State
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [totalVisits, setTotalVisits] = useState(0); // Days they showed up
  const [regularPatients, setRegularPatients] = useState(0);
  const [charityPatients, setCharityPatients] = useState(0);

  // Services State
  const [services, setServices] = useState([]);
  const [serviceSplits, setServiceSplits] = useState({}); // { serviceId: { splitType, splitValue } }

  // Fetch doctors on mount
  useEffect(() => {
    axios
      .get(`${API_RECEPTION_URL}/doctors`)
      .then((res) => {
        setDoctors(res.data);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
  }, []);

  useEffect(() => {
    // get services from the backend
    axios
      .get(`${API_RECEPTION_URL}/services`)
      .then((res) => {
        setServices(res.data);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
      });
  }, []);

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setPerPatientFee(doc.perPatientFee);
      setPerVisitFee(doc.perVisitFee);
    }
  };

  const handleSaveSettings = async () => {
    // TODO: Add validation for the fee inputs before submission
    await axios.put(
      `${API_RECEPTION_URL}/doctors/${selectedDoctorId}/settings`,
      {
        perPatientFee,
        perVisitFee,
      },
    );
  };

  const handleSubmitTally = async () => {
    // TODO: Add validation for the monthly tally data before submission
    // collect service usage data
    await axios.post(`${API_RECEPTION_URL}/monthly-tally`, {
      doctorId: selectedDoctorId,
      month,
      year: new Date().getFullYear(),
      totalVisits,
      regularPatients,
      charityPatients,
      servicesUsed: [], // Add service state logic here similarly
    });
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
                    label="تعرفة لكل مريض (ل.ل)"
                    type="number"
                    value={perPatientFee}
                    onChange={(e) => setPerPatientFee(e.target.value)}
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
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="الزيارات الكلية"
                    type="number"
                    value={totalVisits}
                    onChange={(e) => setTotalVisits(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="عدد المرضى المنتظمين"
                    type="number"
                    value={regularPatients}
                    onChange={(e) => setRegularPatients(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="عدد المرضى الذين تم تغطيتهم"
                    type="number"
                    value={charityPatients}
                    onChange={(e) => setCharityPatients(e.target.value)}
                  />
                </Grid>
              </Grid>
              {/* SERVICES */}
              <Grid>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "almarai, sans-serif", marginTop: "1rem" }}
                  gutterBottom
                >
                  الخدمات المستخدمة
                </Typography>
                {services.map((service) => (
                  <Grid container spacing={2} key={service.id}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: "almarai, sans-serif" }}
                      >
                        {service.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="نوع التقسيم"
                        value={
                          serviceSplits[service.id]?.splitType || "default"
                        }
                        onChange={(e) =>
                          setServiceSplits({
                            ...serviceSplits,
                            [service.id]: {
                              ...serviceSplits[service.id],
                              splitType: e.target.value,
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="قيمة التقسيم"
                        type="number"
                        value={serviceSplits[service.id]?.splitValue || 0}
                        onChange={(e) =>
                          setServiceSplits({
                            ...serviceSplits,
                            [service.id]: {
                              ...serviceSplits[service.id],
                              splitValue: e.target.value,
                            },
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                ))}
              </Grid>

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

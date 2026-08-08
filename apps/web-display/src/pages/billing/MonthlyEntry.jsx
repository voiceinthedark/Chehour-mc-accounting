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
import axios from "axios";

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

  // Fetch doctors on mount
  useEffect(() => {
    // axios.get('/api/doctors').then(res => setDoctors(res.data));
    // Mock data for illustration:
    setDoctors([
      {
        id: "1",
        name: "Dr. Sarah Jenkins",
        perPatientFee: 15,
        perVisitFee: 60,
      },
      { id: "2", name: "Dr. Ahmed Khan", perPatientFee: 12, perVisitFee: 50 },
    ]);
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
    await axios.put(`/api/doctors/${selectedDoctorId}/settings`, {
      perPatientFee,
      perVisitFee,
    });
    alert("Settings Saved!");
  };

  const handleSubmitTally = async () => {
    await axios.post("/api/monthly-tally", {
      doctorId: selectedDoctorId,
      month,
      year: new Date().getFullYear(),
      totalVisits,
      regularPatients,
      charityPatients,
      servicesUsed: [], // Add service state logic here similarly
    });
    alert("Monthly Data Logged Successfully!");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        End of Month Tally & Settings
      </Typography>

      {/* 1. DOCTOR SELECTION */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Doctor</InputLabel>
            <Select value={selectedDoctorId} onChange={handleDoctorChange}>
              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.name}
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
              <Typography variant="h6" color="primary" gutterBottom>
                Financial Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Per Patient Fee ($)"
                    type="number"
                    value={perPatientFee}
                    onChange={(e) => setPerPatientFee(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fallback Per Visit Fee ($)"
                    helperText="Paid if < 5 patients total this month"
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
                Update Fees
              </Button>
            </CardContent>
          </Card>

          {/* 3. MONTHLY DATA ENTRY */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Monthly Volumes
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Days Visited"
                    type="number"
                    value={totalVisits}
                    onChange={(e) => setTotalVisits(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Regular Patients"
                    type="number"
                    value={regularPatients}
                    onChange={(e) => setRegularPatients(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Charity Patients"
                    type="number"
                    value={charityPatients}
                    onChange={(e) => setCharityPatients(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleSubmitTally}
              >
                Submit Monthly Tally
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

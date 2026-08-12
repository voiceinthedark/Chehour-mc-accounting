// filepath: apps/web-display/src/components/Rows/DoctorRow.jsx

import { useState } from "react";
import { TextField, Box, Container, Typography } from "@mui/material";
import NumberField from "../Inputs/NumberField";
import DoctorServiceSplitRow from "./DoctorServiceSplitRow";
import "./doctorRow.scss";
import "@fontsource/almarai";

const DoctorRow = ({ doctor, services }) => {
  const [doctorName, setDoctorName] = useState(doctor.name);
  const [perPatientFee, setPerPatientFee] = useState(doctor.perPatientFee);
  const [perVisitFee, setPerVisitFee] = useState(doctor.perVisitFee);

  const handleDoctorChange = (field, value) => {
    switch (field) {
      case "name":
        setDoctorName(value);
        break;
      case "perPatientFee":
        setPerPatientFee(value);
        break;
      case "perVisitFee":
        setPerVisitFee(value);
        break;
      default:
        break;
    }
  };

  return (
    <Box className="doctor-row-container">
      <Container className="doctor-row" key={doctor.id}>
        <div className="doctor-row-header">
          <Typography
            variant="h5"
            component="h1"
            style={{
              fontFamily: "Almarai, sans-serif",
              backgroundColor: "#e0f7e0",
              color: "#2ca312",
              fontWeight: "bold",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            {doctor.name}
          </Typography>
        </div>
        <div className="doctor-row-body">
          <div className="doctor-row-name">
            <label className="doctor-row-label">
              <Typography
                variant="h6"
                component="h2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                اسم الطبيب
              </Typography>
            </label>
            <TextField
              key={doctor.id}
              variant="outlined"
              fullWidth
              value={doctorName}
              onChange={(e) => handleDoctorChange("name", e.target.value)}
            />
          </div>
          <div className="doctor-row-fee">
            <label className="doctor-row-label">
              <Typography
                variant="h6"
                component="h2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                رسوم الطبيب
              </Typography>
            </label>
            <NumberField
              key={`${doctor.id}-fee`}
              variant="outlined"
              fullWidth
              value={perPatientFee}
              onChange={(value) => handleDoctorChange("perPatientFee", value)}
            />
          </div>
          <div className="doctor-row-visit-fee">
            <label className="doctor-row-label">
              <Typography
                variant="h6"
                component="h2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                تعرفة زيارة
              </Typography>
            </label>
            <TextField
              key={`${doctor.id}-visit-fee`}
              variant="outlined"
              fullWidth
              value={perVisitFee}
              onChange={(e) =>
                handleDoctorChange("perVisitFee", e.target.value)
              }
            />
          </div>
        </div>
      </Container>
      <Container className="doctor-service-splits-container">
        {doctor.serviceSplits.map((split) => (
          <DoctorServiceSplitRow
            key={split.serviceId}
            split={split}
            services={services}
          />
        ))}
      </Container>
    </Box>
  );
};

export default DoctorRow;

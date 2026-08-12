// filepath: apps/web-display/src/components/Rows/DoctorServiceSplitRow.jsx

import { useState } from "react";
import {
  TextField,
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import NumberField from "../Inputs/NumberField";
import "./doctorServiceSplit.scss";
import "@fontsource/almarai";

const DoctorServiceSplitRow = ({ split, services }) => {
  const [serviceId, setServiceId] = useState(split.serviceId);
  const [splitType, setSplitType] = useState(split.splitType);
  const [splitValue, setSplitValue] = useState(split.splitValue);

  const handleSplitChange = (field, value) => {
    switch (field) {
      case "splitType":
        setSplitType(value);
        break;
      case "splitValue":
        setSplitValue(value);
        break;
      default:
        break;
    }
  };

  return (
    <Box className="doctor-service-split-row-container">
      <Container className="doctor-service-split-row" key={split.serviceId}>
        <div className="doctor-service-split-row-name">
          <label className="doctor-service-split-row-label">
            <Select
              key={`${split.serviceId}-name`}
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  <Typography
                    variant="h6"
                    component="h2"
                    style={{ fontFamily: "Almarai, sans-serif" }}
                  >
                    {service.name}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </label>
        </div>
        <div className="doctor-service-split-row-type">
          <label className="doctor-service-split-row-label">
            <Typography
              variant="h6"
              component="h2"
              style={{ fontFamily: "Almarai, sans-serif" }}
            >
              نوع الحصة
            </Typography>
          </label>
          <Select
            key={`${split.serviceId}-type`}
            value={splitType}
            onChange={(e) => handleSplitChange("splitType", e.target.value)}
          >
            <MenuItem value="PERCENT">
              <Typography
                variant="h6"
                component="h2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                نسبة مئوية
              </Typography>
            </MenuItem>
            <MenuItem value="FLAT">
              <Typography
                variant="h6"
                component="h2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                مبلغ ثابت
              </Typography>
            </MenuItem>
          </Select>
        </div>
        <div className="doctor-service-split-row-value">
          <label className="doctor-service-split-row-label">
            <Typography
              variant="h6"
              component="h2"
              style={{ fontFamily: "Almarai, sans-serif" }}
            >
              قيمة الحصة
            </Typography>
          </label>
          <NumberField
            key={`${split.serviceId}-value`}
            variant="outlined"
            fullWidth
            value={splitValue}
            onChange={(value) => setSplitValue(value)}
          />
        </div>
      </Container>
    </Box>
  );
};

export default DoctorServiceSplitRow;

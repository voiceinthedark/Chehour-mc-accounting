import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
} from "@mui/material";
import NumberField from "../Inputs/NumberField";
import "@fontsource/almarai";
import axios from "axios";
import "./addNewDoctorModal.scss";

const AddNewDoctorModal = ({ open, onClose, services }) => {
  const [doctorName, setDoctorName] = useState("");
  const [doctorPatientFee, setDoctorPatientFee] = useState("");
  const [doctorVisitFee, setDoctorVisitFee] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/reception/doctors/new", {
      name: doctorName,
      patientFee: parseFloat(doctorPatientFee.replace(/[^0-9.-]+/g, "")),
      visitFee: parseFloat(doctorVisitFee.replace(/[^0-9.-]+/g, "")),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          style={{ fontFamily: "Almarai, sans-serif", fontWeight: "bold" }}
          sx={{ mb: 2 }}
        >
          إضافة طبيب جديد
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="اسم الطبيب"
            fullWidth
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <NumberField
            label="رسوم المريض"
            fullWidth
            value={doctorPatientFee}
            onChange={(value) => setDoctorPatientFee(value)}
            sx={{ mb: 2 }}
            placeholder="1,000,000 ل.ل"
          />
          <NumberField
            label="رسوم الزيارة"
            fullWidth
            value={doctorVisitFee}
            onChange={(value) => setDoctorVisitFee(value)}
            sx={{ mb: 2 }}
            placeholder="1,000,000 ل.ل"
          />
          <hr />
          <Typography
            variant="body1"
            style={{ fontFamily: "Almarai, sans-serif", fontWeight: "bold" }}
            sx={{ mt: 2, mb: 1 }}
          >
            الخدمات المتاحة
          </Typography>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Select
              multiple
              fullWidth
              value={[]}
              onChange={() => {}}
              sx={{ mb: 2 }}
              displayEmpty
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
            <NumberField
              label="قيم الخدمة للطبيب"
              fullWidth
              value={""}
              onChange={() => {}}
              sx={{ mb: 2 }}
              placeholder="1,000,000 ل.ل"
            />
          </div>

          <Button type="submit" variant="contained" color="primary">
            <Typography
              variant="body1"
              style={{ fontFamily: "Almarai, sans-serif", fontWeight: "bold" }}
            >
              إضافة
            </Typography>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClose}
            sx={{ ml: 2 }}
          >
            <Typography
              variant="body1"
              style={{ fontFamily: "Almarai, sans-serif", fontWeight: "bold" }}
            >
              إلغاء
            </Typography>
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddNewDoctorModal;

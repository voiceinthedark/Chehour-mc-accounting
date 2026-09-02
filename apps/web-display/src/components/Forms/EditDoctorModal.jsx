// filepath: apps/web-display/src/components/Forms/EditDoctorModal.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import NumberField from "../Inputs/NumberField";
import axios from "axios";
import "@fontsource/almarai";

const EditDoctorModal = ({ open, onClose, id, onDoctorEdited }) => {
  const [doctorName, setDoctorName] = useState("");
  const [doctorPatientFee, setDoctorPatientFee] = useState("");
  const [doctorPatientCut, setDoctorPatientCut] = useState("");
  const [doctorVisitFee, setDoctorVisitFee] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [services, setServices] = useState([]);
  const [splitType, setSplitType] = useState("FLAT");
  const [splitValue, setSplitValue] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [serviceSplits, setServiceSplits] = useState([]);

  // Fetch services
  useEffect(() => {
    // Fetch services from the server when the component mounts
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/reception/services");
        setServices(response.data);
      } catch (error) {
        toast.error("Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  // Fetch doctor data when the modal opens
  useEffect(() => {
    if (open && id) {
      const fetchDoctorData = async () => {
        try {
          const response = await axios.get(`/api/reception/doctors/${id}`);
          const doctorData = response.data;
          setDoctorName(doctorData.name);
          setDoctorPatientFee(doctorData.perPatientFee);
          setDoctorPatientCut(doctorData.doctorPatientCut);
          setDoctorVisitFee(doctorData.perVisitFee);
          setDoctorId(doctorData.id);
          setServiceSplits(doctorData.serviceSplits ?? []);
        } catch (error) {
          toast.error("Failed to fetch doctor data");
        }
      };
      fetchDoctorData();
    }
  }, [open, id]);

  const handleAddSplit = () => {
    if (!selectedService || !splitValue) return;
    if (serviceSplits.some((s) => s.serviceId === selectedService)) return;
    setServiceSplits((prev) => [
      ...prev,
      {
        serviceId: selectedService,
        splitType,
        splitValue:
          splitType === "PERCENT"
            ? parseFloat(splitValue) / 100
            : parseFloat(splitValue),
      },
    ]);
    setSelectedService("");
    setSplitType("FLAT");
    setSplitValue("");
  };

  const handleRemoveSplit = (serviceId) => {
    setServiceSplits((prev) => {
      const updatedSplits = prev.filter((s) => s.serviceId !== serviceId);
      return updatedSplits;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      toast.error("يرجى إدخال اسم الطبيب");
      return;
    }
    if (!doctorPatientFee) {
      toast.error("يرجى إدخال رسوم المريض");
      return;
    }
    try {
      await axios.put(`/api/reception/doctors/${doctorId}/settings`, {
        name: doctorName.trim(),
        perPatientFee: parseFloat(
          String(doctorPatientFee).replace(/[^0-9.-]+/g, ""),
        ),
        // If left blank, backend falls back to perPatientFee.
        doctorPatientCut: doctorPatientCut
          ? parseFloat(String(doctorPatientCut).replace(/[^0-9.-]+/g, ""))
          : undefined,
        // If left blank, backend defaults to 0.
        perVisitFee: doctorVisitFee
          ? parseFloat(String(doctorVisitFee).replace(/[^0-9.-]+/g, ""))
          : 0,
        serviceSplits,
      });
      toast.success("تم تعديل بيانات الطبيب بنجاح");
      onDoctorEdited(); // Notify parent component to refresh the list
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "فشل تعديل بيانات الطبيب",
      );
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 480,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          style={{ fontFamily: "Almarai, sans-serif", fontWeight: "bold" }}
          sx={{ mb: 2 }}
        >
          تعديل بيانات الطبيب
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
            label="حصة الطبيب من رسوم المريض"
            fullWidth
            value={doctorPatientCut}
            onChange={(value) => setDoctorPatientCut(value)}
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
            sx={{ mt: 2, mb: 2 }}
          >
            تقسيم الخدمات
          </Typography>

          {/* Added splits list */}
          {serviceSplits.map((split) => (
            <Box
              key={split.serviceId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                p: 1,
                border: "1px solid #ddd",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                {getServiceName(split.serviceId)} —{" "}
                {split.splitType === "PERCENT"
                  ? `${(split.splitValue * 100).toFixed(0)}%`
                  : `${split.splitValue.toLocaleString()} ل.ل`}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleRemoveSplit(split.serviceId)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {/* Add new split row */}
          <Box
            sx={{ display: "flex", gap: 1, mb: 1, alignItems: "flex-start" }}
          >
            <FormControl sx={{ flex: 2 }}>
              <InputLabel>الخدمة</InputLabel>
              <Select
                value={selectedService}
                label="الخدمة"
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services
                  .filter(
                    (s) => !serviceSplits.some((sp) => sp.serviceId === s.id),
                  )
                  .map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>النوع</InputLabel>
              <Select
                value={splitType}
                label="النوع"
                onChange={(e) => setSplitType(e.target.value)}
              >
                <MenuItem value="FLAT">مبلغ ثابت</MenuItem>
                <MenuItem value="PERCENT">نسبة %</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "flex-end" }}>
            <Box sx={{ flex: 2 }}>
              <NumberField
                label={
                  splitType === "PERCENT" ? "النسبة (0-100)" : "المبلغ ل.ل"
                }
                value={splitValue}
                onChange={(value) => setSplitValue(value)}
                placeholder={
                  splitType === "PERCENT" ? "e.g. 30" : "1,000,000 ل.ل"
                }
              />
            </Box>
            <Button
              variant="outlined"
              onClick={handleAddSplit}
              disabled={!selectedService || !splitValue}
              sx={{ flex: 1, mb: "16px" }}
            >
              <Typography
                variant="body2"
                style={{ fontFamily: "Almarai, sans-serif" }}
              >
                إضافة خدمة
              </Typography>
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button type="submit" variant="contained" color="primary">
              <Typography
                variant="body1"
                style={{
                  fontFamily: "Almarai, sans-serif",
                  fontWeight: "bold",
                }}
              >
                تعديل
              </Typography>
            </Button>
            <Button variant="contained" color="secondary" onClick={onClose}>
              <Typography
                variant="body1"
                style={{
                  fontFamily: "Almarai, sans-serif",
                  fontWeight: "bold",
                }}
              >
                إلغاء
              </Typography>
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditDoctorModal;

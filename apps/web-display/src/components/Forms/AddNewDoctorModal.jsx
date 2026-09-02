import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import NumberField from "../Inputs/NumberField";
import { toast } from "react-hot-toast";
import "@fontsource/almarai";
import axios from "axios";
import "./addNewDoctorModal.scss";

const AddNewDoctorModal = ({ open, onClose, onDoctorAdded }) => {
  const [doctorName, setDoctorName] = useState("");
  const [doctorPatientFee, setDoctorPatientFee] = useState("");
  const [doctorPatientCut, setDoctorPatientCut] = useState("");
  const [doctorVisitFee, setDoctorVisitFee] = useState("");
  const [services, setServices] = useState([]);

  // Per-service split state
  const [selectedService, setSelectedService] = useState("");
  const [splitType, setSplitType] = useState("FLAT");
  const [splitValue, setSplitValue] = useState("");
  const [serviceSplits, setServiceSplits] = useState([]);

  useEffect(() => {
    if (open) {
      axios
        .get("/api/reception/services")
        .then((res) => setServices(res.data))
        .catch(() => toast.error("فشل تحميل الخدمات"));
    }
  }, [open]);

  const handleAddSplit = () => {
    if (!selectedService || !splitValue) return;
    const alreadyAdded = serviceSplits.some(
      (s) => s.serviceId === selectedService,
    );
    if (alreadyAdded) return;
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
    setServiceSplits((prev) => prev.filter((s) => s.serviceId !== serviceId));
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
      await axios.post("/api/reception/doctors/new", {
        name: doctorName.trim(),
        perPatientFee: parseFloat(doctorPatientFee.replace(/[^0-9.-]+/g, "")),
        // If left blank, fall back to the same value as perPatientFee
        // (most doctors receive the full patient fee unless overridden).
        doctorPatientCut: doctorPatientCut
          ? parseFloat(doctorPatientCut.replace(/[^0-9.-]+/g, ""))
          : undefined,
        // If left blank, defaults to 0 (no guaranteed per-visit rate).
        perVisitFee: doctorVisitFee
          ? parseFloat(doctorVisitFee.replace(/[^0-9.-]+/g, ""))
          : 0,
        serviceSplits,
      });
      // Add a success toast notification
      toast.success("تم إضافة الطبيب بنجاح");
      onDoctorAdded(); // Notify parent component to refresh the list
      onClose();
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "فشل في إضافة الطبيب. حاول مرة أخرى.",
      );
    }
  };

  const getServiceName = (id) => services.find((s) => s.id === id)?.name ?? id;

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
            label="نسبة الطبيب من رسوم المريض"
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
                إضافة
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

export default AddNewDoctorModal;

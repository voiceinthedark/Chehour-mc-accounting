// filepath: apps/web-display/src/components/Forms/AddNewServiceModal.jsx

import { useState } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-hot-toast";
import "@fontsource/almarai"; // Import the Almarai font

const AddNewServiceModal = ({ open, onClose, onServiceAdded }) => {
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [doctorSplitPercent, setDoctorSplitPercent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddService = async () => {
    if (!serviceName.trim()) {
      toast.error("يرجى إدخال اسم الخدمة");
      return;
    }
    if (!price) {
      toast.error("يرجى إدخال سعر الخدمة");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/reception/services/new", {
        name: serviceName.trim(),
        price: Number(price),
        // Backend defaults to 0 if left blank
        doctorSplitPercent: doctorSplitPercent
          ? Number(doctorSplitPercent)
          : undefined,
      });
      toast.success("تم إضافة الخدمة بنجاح");
      setServiceName("");
      setPrice("");
      setDoctorSplitPercent("");
      onServiceAdded();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "فشل في إضافة الخدمة",
      );
    }
    setLoading(false);
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
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ mb: 2, fontFamily: "Almarai, sans-serif" }}
        >
          إضافة خدمة جديدة
        </Typography>
        <TextField
          fullWidth
          label="اسم الخدمة"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="السعر"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="نسبة الطبيب ( 0-1 %)"
          type="number"
          value={doctorSplitPercent}
          onChange={(e) => setDoctorSplitPercent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddService}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                إضافة
              </Typography>
            )}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            disabled={loading}
          >
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              إلغاء
            </Typography>
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddNewServiceModal;

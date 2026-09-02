// filepath: apps/web-display/src/components/Forms/EditServiceModal.jsx

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

const EditServiceModal = ({ open, onClose, service, onServiceEdited }) => {
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(service.price);
  const [doctorSplitPercent, setDoctorSplitPercent] = useState(
    service.doctorSplitPercent ?? "",
  );
  const [loading, setLoading] = useState(false);

  const handleEditService = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم الخدمة");
      return;
    }
    if (!price) {
      toast.error("يرجى إدخال سعر الخدمة");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/reception/services/${service.id}`, {
        name: name.trim(),
        price: Number(price),
        doctorSplitPercent:
          doctorSplitPercent === "" ? undefined : Number(doctorSplitPercent),
      });
      toast.success("تم تعديل الخدمة بنجاح");
      onServiceEdited(); // Notify parent component about the edit
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "فشل تعديل الخدمة",
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
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          تعديل الخدمة
        </Typography>
        <TextField
          fullWidth
          label="اسم الخدمة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="السعر"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiInputBase-input": {
              textAlign: "right", // Align the input text to the right
            },
          }}
        />
        <TextField
          fullWidth
          label="نسبة الطبيب (0-1)"
          helperText="مثالً 0.5 لـ 50%. يمكن تخطي هذا إذا كان لدى الطبيب تخصيص خاص"
          type="number"
          inputProps={{ min: 0, max: 1, step: 0.01 }}
          value={doctorSplitPercent}
          onChange={(e) => setDoctorSplitPercent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditService}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "حفظ التعديلات"}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditServiceModal;

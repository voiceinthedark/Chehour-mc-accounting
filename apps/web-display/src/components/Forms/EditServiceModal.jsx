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
import "@fontsource/almarai"; // Import the Almarai font

const EditServiceModal = ({ open, onClose, service, onServiceEdited }) => {
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(service.price);
  const [loading, setLoading] = useState(false);

  const handleEditService = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/reception/services/${service.id}`,
        {
          name,
          price,
        },
      );
      console.log("Service updated:", response.data);
      onServiceEdited(); // Notify parent component about the edit
    } catch (error) {
      console.error("Error updating service:", error);
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

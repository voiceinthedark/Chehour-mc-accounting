// filepath: apps/web-display/src/components/Forms/DeleteServiceModal.jsx

import { useState } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font

const DeleteServiceModal = ({ open, onClose, serviceId, onServiceDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteService = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/reception/services/${serviceId}`);
      console.log("Service deleted");
      onServiceDeleted(); // Notify parent component about the deletion
    } catch (error) {
      console.error("Error deleting service:", error);
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
          هل أنت متأكد أنك تريد حذف هذه الخدمة؟
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteService}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                حذف
              </Typography>
            )}
          </Button>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              إلغاء
            </Typography>
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteServiceModal;

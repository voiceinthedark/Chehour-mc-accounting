// filepath: apps/web-display/src/components/Forms/DeleteDoctorConfirm.jsx

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import "@fontsource/almarai";
import "./deleteDoctorConfirm.scss";

const DeleteDoctorConfirm = ({
  open,
  onClose,
  onConfirm,
  doctorName,
  onDoctorDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontFamily: "Almarai, sans-serif" }}>
        تأكيد الحذف
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
          هل أنت متأكد أنك تريد حذف الدكتور {doctorName}؟
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          sx={{ fontFamily: "Almarai, sans-serif" }}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          disabled={isDeleting}
          sx={{ fontFamily: "Almarai, sans-serif" }}
        >
          {isDeleting ? "جارٍ الحذف..." : "حذف"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDoctorConfirm;

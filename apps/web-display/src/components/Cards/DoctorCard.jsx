// filepath: apps/frontend/web-display/src/components/Cards/DoctorCard.jsx

import { useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import EditDoctorModal from "../Forms/EditDoctorModal";
import DeleteDoctorConfirm from "../Forms/DeleteDoctorConfirm";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import axios from "axios";
import "@fontsource/almarai";
import "./doctorCard.scss";

const DoctorCard = ({ doctorId, doctor, onDoctorEdited, onDoctorDeleted }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteDoctor = async () => {
    try {
      await axios.delete(
        `http://localhost:4000/api/reception/doctors/${doctorId}`,
      );
      setIsDeleteModalOpen(false);
      // Optionally, you can call a callback function to update the parent component's state
      // onDoctorDeleted(doctorId);
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const formatFeesToLebaneseLira = (fees) => {
    return Intl.NumberFormat("en-LB", {
      style: "currency",
      currency: "LBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      significantDigits: 3,
    }).format(fees);
  };

  return (
    <>
      <Card className="doctor-card">
        <CardContent className="doctor-card-body">
          <Typography
            className="doctor-card-name"
            variant="h5"
            component="div"
            sx={{ fontFamily: "Almarai, sans-serif", fontWeight: "bold" }}
          >
            {doctor.name}
          </Typography>
          <div
            className="doctor-card-fee-container"
            style={{
              display: "flex",
              direction: "rtl",
              gap: "0.5rem",
            }}
          >
            <AttachMoneyIcon sx={{ color: "#2ca312", fontSize: "1.5rem" }} />
            <Typography
              className="doctor-card-fee"
              sx={{ mb: 1.5, fontFamily: "Almarai, sans-serif" }}
              color="text.secondary"
            >
              رسوم:
            </Typography>
            <Typography
              className="doctor-card-fee-value"
              sx={{
                mb: 1.5,
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                color: "#2ca312",
                fontSize: "1.2rem",
              }}
            >
              {formatFeesToLebaneseLira(doctor.perPatientFee)}
            </Typography>
          </div>
          <div
            className="doctor-card-fee-container"
            style={{
              display: "flex",
              direction: "rtl",
              gap: "0.5rem",
            }}
          >
            <LocalAtmIcon sx={{ color: "#2ca312", fontSize: "1.5rem" }} />
            <Typography
              className="doctor-card-visit-fee"
              sx={{
                mb: 1.5,
                fontFamily: "Almarai, sans-serif",
              }}
              color="text.secondary"
            >
              رسم زيارة:
            </Typography>
            <Typography
              className="doctor-card-visit-fee-value"
              sx={{
                mb: 1.5,
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                color: "#2ca312",
                fontSize: "1.2rem",
              }}
            >
              {formatFeesToLebaneseLira(doctor.perVisitFee)}
            </Typography>
          </div>
          <div className="doctor-card-functionality">
            <button
              type="button"
              className="doctor-card-edit-button"
              onClick={() => setIsEditModalOpen(true)}
            >
              <EditRoundedIcon
                className="doctor-card-edit-icon"
                sx={{ color: "#2c33f2", fontSize: "1.5rem", cursor: "pointer" }}
              />
            </button>
            <button
              type="button"
              className="doctor-card-delete-button"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <DeleteRoundedIcon
                className="doctor-card-delete-icon"
                sx={{ color: "#ff0000", fontSize: "1.5rem", cursor: "pointer" }}
              />
            </button>
          </div>
        </CardContent>
      </Card>
      <EditDoctorModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        id={doctorId}
        onDoctorEdited={onDoctorEdited}
      />
      <DeleteDoctorConfirm
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        doctorName={doctor.name}
        onConfirm={() => {
          handleDeleteDoctor();
        }}
        onDoctorDeleted={onDoctorDeleted}
      />
    </>
  );
};

export default DoctorCard;

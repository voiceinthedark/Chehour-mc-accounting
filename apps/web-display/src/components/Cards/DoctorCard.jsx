// filepath: apps/frontend/web-display/src/components/Cards/DoctorCard.jsx

import { useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import EditDoctorModal from "../Forms/EditDoctorModal";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import "@fontsource/almarai";
import "./doctorCard.scss";

const DoctorCard = ({ doctorId, doctor, onDoctorEdited }) => {
  //TODO: Add functionality for edit and delete icons
  //TODO: Add Doctor add/edit form in a modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
            <DeleteRoundedIcon
              className="doctor-card-delete-icon"
              sx={{ color: "#ff0000", fontSize: "1.5rem", cursor: "pointer" }}
            />
          </div>
        </CardContent>
      </Card>
      <EditDoctorModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        id={doctorId}
        onDoctorEdited={onDoctorEdited}
      />
    </>
  );
};

export default DoctorCard;

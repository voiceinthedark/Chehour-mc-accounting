// filepath: apps/web-display/src/components/Cards/ServiceCard.jsx

import { useState } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import EditServiceModal from "../Forms/EditServiceModal";
import DeleteServiceModal from "../Forms/DeleteServiceModal";
import "@fontsource/almarai"; // Import the Almarai font

const ServiceCard = ({ service, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <Card
        style={{
          margin: "10px",
          fontFamily: "Almarai, sans-serif",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            style={{ fontWeight: "bold", fontFamily: "Almarai, sans-serif" }}
          >
            {service.name}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginTop: "10px", fontFamily: "Almarai, sans-serif" }}
          >
            السعر: {service.price} ل.ل
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "15px",
            }}
          >
            <Button
              variant="outlined"
              style={{ color: "#197634", border: "none" }}
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit style={{ marginRight: "5px" }} />
            </Button>
            <Button
              variant="outlined"
              style={{ color: "red", border: "none" }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Delete style={{ marginRight: "5px" }} />
            </Button>
          </div>
        </CardContent>
      </Card>
      <EditServiceModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        service={service}
        onServiceEdited={() => {
          setIsEditModalOpen(false);
          onEdit(service.id); // Notify parent component about the edit
        }}
      />
      <DeleteServiceModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        serviceId={service.id}
        onServiceDeleted={() => {
          setIsDeleteModalOpen(false);
          onDelete(service.id); // Notify parent component about the deletion
        }}
      />
    </>
  );
};

export default ServiceCard;

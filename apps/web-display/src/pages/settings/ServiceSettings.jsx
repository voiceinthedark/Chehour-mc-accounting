// filepath: apps/web-display/src/pages/settings/ServiceSettings.jsx

import { useState, useEffect } from "react";
import { Typography, Button } from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font
import ServiceList from "../../components/Cards/ServiceList";
import ServiceTable from "../../components/Tables/ServiceTable";
import AddNewServiceModal from "../../components/Forms/AddNewServiceModal";
import { Add } from "@mui/icons-material";
import { API_RECEPTION_URL } from "../../apiconfig.js";

const ServiceSettings = () => {
  const [services, setServices] = useState([]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_RECEPTION_URL}/services`);
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleServiceEdited = () => {
    fetchServices(); // Refresh the list of services after editing
  };

  const handleServiceDeleted = () => {
    fetchServices(); // Refresh the list of services after deleting
  };
  const handleServiceAdded = () => {
    fetchServices(); // Refresh the list of services after adding a new service
    setIsAddServiceModalOpen(false); // Close the modal after adding a new service
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <>
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
        >
          إعدادات الخدمات
        </Typography>
        <Button
          variant="contained"
          onClick={() => setIsAddServiceModalOpen(true)}
          style={{
            marginBottom: "20px",
            color: "white",
            backgroundColor: "#197632",
          }}
        >
          <Add style={{ marginRight: "8px" }} />
          <Typography
            variant="button"
            style={{ fontFamily: "Almarai, sans-serif", fontsize: "16px" }}
          >
            إضافة خدمة جديدة
          </Typography>
        </Button>
        <ServiceTable
          services={services}
          onServiceEdited={handleServiceEdited}
          onServiceDeleted={handleServiceDeleted}
        />
      </div>
      <AddNewServiceModal
        open={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onServiceAdded={handleServiceAdded} // Refresh the list after adding a new service
      />
    </>
  );
};

export default ServiceSettings;

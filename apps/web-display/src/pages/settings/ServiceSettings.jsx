// filepath: apps/web-display/src/pages/settings/ServiceSettings.jsx

import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { useLoaderData, Outlet } from "react-router-dom";
import "@fontsource/almarai"; // Import the Almarai font
import ServiceList from "../../components/Cards/ServiceList";
import { API_RECEPTION_URL } from "../../apiconfig.js";

const ServiceSettings = () => {
  const loaderData = useLoaderData();
  const [services, setServices] = useState(loaderData);

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

  // BUG: The service list does not update after editing or deleting a service.
  // The fetchServices function is called, but the state is not updated correctly.
  // This might be due to the useLoaderData hook not being reactive to changes in the services state.
  // TODO: Fix the issue with the service list not updating after editing or deleting a service
  const handleServiceEdited = () => {
    fetchServices(); // Refresh the list of services after editing
  };

  const handleServiceDeleted = () => {
    fetchServices(); // Refresh the list of services after deleting
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <>
      <div style={{ padding: "20px" }}>
        <Typography
          variant="h3"
          component="h1"
          style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
        >
          إعدادات الخدمات
        </Typography>
        <ServiceList
          services={loaderData}
          onEdit={handleServiceEdited}
          onDelete={handleServiceDeleted}
        />
      </div>
      <Outlet />
    </>
  );
};

export default ServiceSettings;

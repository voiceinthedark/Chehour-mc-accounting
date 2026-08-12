// filepath: apps/web-display/src/pages/settings/DoctorSettings.jsx

import { Typography, Stack, Box } from "@mui/material";
import "@fontsource/almarai";
import { useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import DoctorRow from "../../components/Rows/DoctorRow";

const DoctorSettings = () => {
  const [services, setServices] = useState([]);
  // Use the useLoaderData hook to access the data loaded by the loader function
  const data = useLoaderData();
  useEffect(() => {
    console.log("Loaded data:", data);
    // TODO: Use the loaded data to populate the settings form or display relevant information
  }, [data]);

  // Fetch services from the backend API
  useEffect(() => {
    const fetchServices = async () => {
      const response = await fetch("/api/reception/services");
      const data = await response.json();
      console.log("Fetched services:", data);
      setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      <Typography
        variant="h3"
        component="h1"
        style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
      >
        إعدادات الأطباء
      </Typography>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <Stack direction="column" spacing={2}>
          {(data || []).map((doctor) => (
            <DoctorRow key={doctor.id} doctor={doctor} services={services} />
          ))}
        </Stack>
      </Box>
    </div>
  );
};

export default DoctorSettings;

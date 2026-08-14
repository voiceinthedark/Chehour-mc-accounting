// filepath: apps/web-display/src/pages/settings/DoctorSettings.jsx

import { Typography, Box, Pagination } from "@mui/material";
import "@fontsource/almarai";
import { useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import DoctorCard from "../../components/Cards/DoctorCard";
import "./doctorSettings.scss";

const DoctorSettings = () => {
  // TODO: implement adding a new doctor functionality

  const [services, setServices] = useState([]);
  // Use the useLoaderData hook to access the data loaded by the loader function
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of items to display per page
  const data = useLoaderData();

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    console.log("Loaded data:", data);
    console.log("Paginated data:", paginatedData);
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
    <div className="main-container" style={{ width: "100%" }}>
      <Typography
        variant="h3"
        component="h1"
        style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
      >
        إعدادات الأطباء
      </Typography>
      <Box className="doctor-settings-container" component="form">
        {paginatedData.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} services={services} />
        ))}
      </Box>

      <Pagination
        count={Math.ceil(data.length / itemsPerPage)}
        page={currentPage}
        onChange={(event, value) => setCurrentPage(value)}
        color="primary"
        style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
      />
    </div>
  );
};

export default DoctorSettings;

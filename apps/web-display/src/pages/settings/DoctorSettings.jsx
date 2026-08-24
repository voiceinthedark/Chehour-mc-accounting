// filepath: apps/web-display/src/pages/settings/DoctorSettings.jsx

import { Typography, Box, Pagination } from "@mui/material";
import "@fontsource/almarai";
import { useLoaderData, Outlet } from "react-router-dom";
import { useState } from "react";
import { PersonAdd } from "@mui/icons-material";
import DoctorCard from "../../components/Cards/DoctorCard";
import AddNewDoctorModal from "../../components/Forms/AddNewDoctorModal";
import "./doctorSettings.scss";

const DoctorSettings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6; // Number of items to display per page
  const loaderData = useLoaderData();
  const [doctors, setDoctors] = useState(loaderData);

  const paginatedData = doctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/reception/doctors");
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleDoctorEdited = () => {
    fetchDoctors(); // Refresh the list of doctors after editing
    setIsModalOpen(false);
  };

  const handleDoctorAdded = () => {
    fetchDoctors(); // Refresh the list of doctors after adding a new one
    setIsModalOpen(false);
  };

  const handleDoctorDeleted = () => {
    fetchDoctors(); // Refresh the list of doctors after deleting
  };

  return (
    <>
      <div className="main-container" style={{ width: "100%" }}>
        <Box
          className="add-new-doctor-button"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <PersonAdd style={{ marginRight: "8px", color: "#fff" }} />
          <Typography
            variant="body1"
            style={{
              fontFamily: "Almarai, sans-serif",
              fontWeight: "bold",
              fontSize: "26px",
              color: "#fff",
            }}
          >
            إضافة طبيب جديد
          </Typography>
        </Box>
        <Typography
          variant="h3"
          component="h1"
          style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
        >
          إعدادات الأطباء
        </Typography>
        <Box className="doctor-settings-container" component="form">
          {paginatedData.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctorId={doctor.id}
              doctor={doctor}
              onDoctorEdited={handleDoctorEdited}
              onDoctorDeleted={handleDoctorDeleted}
            />
          ))}
        </Box>

        <Pagination
          count={Math.ceil(doctors.length / itemsPerPage)}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          color="primary"
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        />
      </div>
      <Outlet />
      {
        <AddNewDoctorModal
          open={isModalOpen}
          onClose={() => {
            fetchDoctors(); // Refresh the list of doctors after adding a new one
            setIsModalOpen(false);
          }}
          onDoctorAdded={handleDoctorAdded}
        />
      }
    </>
  );
};

export default DoctorSettings;

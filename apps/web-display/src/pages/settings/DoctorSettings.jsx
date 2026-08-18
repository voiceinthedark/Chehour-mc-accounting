// filepath: apps/web-display/src/pages/settings/DoctorSettings.jsx

import { Typography, Box, Pagination } from "@mui/material";
import "@fontsource/almarai";
import {
  useLoaderData,
  useNavigate,
  Outlet,
  useRevalidator,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { PersonAdd } from "@mui/icons-material";
import DoctorCard from "../../components/Cards/DoctorCard";
import AddNewDoctorModal from "../../components/Forms/AddNewDoctorModal";
import "./doctorSettings.scss";

const DoctorSettings = () => {
  // TODO: implement adding a new doctor functionality

  const [services, setServices] = useState([]);
  // Use the useLoaderData hook to access the data loaded by the loader function
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 6; // Number of items to display per page
  const data = useLoaderData();
  const navigate = useNavigate();

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const revalidator = useRevalidator();

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
              services={services}
            />
          ))}
        </Box>

        <Pagination
          count={Math.ceil(data.length / itemsPerPage)}
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
          onClose={() => setIsModalOpen(false)}
          services={services}
        />
      }
    </>
  );
};

export default DoctorSettings;

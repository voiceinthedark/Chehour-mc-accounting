// filepath: apps/web-display/src/pages/settings/DoctorSettings.jsx

import { Typography, Box, Pagination } from "@mui/material";
import "@fontsource/almarai";
import { useEffect } from "react";
import { useState } from "react";
import { PersonAdd } from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import EditDoctorModal from "../../components/Forms/EditDoctorModal";
import DeleteDoctorConfirm from "../../components/Forms/DeleteDoctorConfirm";
import { IconButton } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import axios from "axios";
import AddNewDoctorModal from "../../components/Forms/AddNewDoctorModal";
import "./doctorSettings.scss";

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: "rtl", // Set the direction to right-to-left
});

const DoctorSettings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6; // Number of items to display per page
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // { id, name }
  const [modalMode, setModalMode] = useState(null); // 'edit' | 'delete'

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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDoctorEdited = () => {
    fetchDoctors();
    setIsModalOpen(false);
  };

  const handleDoctorAdded = () => {
    fetchDoctors(); // Refresh the list of doctors after adding a new one
    setIsModalOpen(false);
  };

  const handleDoctorDeleted = () => {
    fetchDoctors(); // Refresh the list of doctors after deleting
  };

  const formatCurrencyToLebanese = (currency) => {
    // Format the currency to Lebanese Lira format
    return new Intl.NumberFormat("en-LB", {
      style: "currency",
      currency: "LBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(currency);
  };

  return (
    <>
      <div className="main-container" style={{ width: "100%" }}>
        <Typography
          variant="h3"
          component="h1"
          style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
        >
          إعدادات الأطباء
        </Typography>
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
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <div dir="rtl" style={{ width: "100%" }}>
              <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table aria-label="doctor table" style={{ minWidth: 650 }}>
                  <TableHead
                    style={{
                      backgroundColor: "#12a312",
                      fontweight: "bold",
                      opacity: 0.9,
                      color: "#fff",
                    }}
                  >
                    <TableRow
                      style={{
                        backgroundColor: "#12a312",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      <TableCell
                        style={{
                          fontFamily: "Almarai, sans-serif",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        اسم الطبيب
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Almarai, sans-serif",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        رسوم المريض
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Almarai, sans-serif",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        نسبة الطبيب من المريض
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Almarai, sans-serif",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        تعديل
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Almarai, sans-serif",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        حذف
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <Typography
                            variant="body1"
                            style={{
                              fontFamily: "Almarai, sans-serif",
                              fontSize: "16px",
                            }}
                          >
                            {doctor.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            style={{
                              fontFamily: "Almarai, sans-serif",
                              fontSize: "18px",
                            }}
                          >
                            {formatCurrencyToLebanese(
                              doctor.perPatientFee.toLocaleString(),
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            style={{
                              fontFamily: "Almarai, sans-serif",
                              fontSize: "18px",
                            }}
                          >
                            {formatCurrencyToLebanese(
                              doctor.doctorPatientCut.toLocaleString(),
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => {
                              setSelectedDoctor({
                                id: doctor.id,
                                name: doctor.name,
                              });
                              setModalMode("edit");
                            }}
                          >
                            <EditRoundedIcon sx={{ color: "#2c33f2" }} />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => {
                              setSelectedDoctor({
                                id: doctor.id,
                                name: doctor.name,
                              });
                              setModalMode("delete");
                            }}
                          >
                            <DeleteRoundedIcon sx={{ color: "#ff0000" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </ThemeProvider>
        </CacheProvider>

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
      <AddNewDoctorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDoctorAdded={handleDoctorAdded}
      />
      <EditDoctorModal
        open={modalMode === "edit" && !!selectedDoctor}
        onClose={() => setModalMode(null)}
        id={selectedDoctor?.id}
        onDoctorEdited={() => {
          fetchDoctors();
          setModalMode(null);
        }}
      />
      <DeleteDoctorConfirm
        open={modalMode === "delete" && !!selectedDoctor}
        onClose={() => setModalMode(null)}
        doctorName={selectedDoctor?.name}
        onConfirm={async () => {
          try {
            await axios.delete(`/api/reception/doctors/${selectedDoctor.id}`);
            setModalMode(null);
            setSelectedDoctor(null);
            fetchDoctors();
          } catch (e) {
            console.error("Error deleting doctor:", e);
          }
        }}
        onDoctorDeleted={fetchDoctors}
      />
    </>
  );
};

export default DoctorSettings;

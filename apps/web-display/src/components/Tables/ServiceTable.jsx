// filepath: apps/web-display/src/components/Tables/ServiceTable.jsx

import { useState, useEffect } from "react";
import "@fontsource/almarai"; // Import the Almarai font
import EditServiceModal from "../Forms/EditServiceModal";
import DeleteServiceModal from "../Forms/DeleteServiceModal";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { formatCurrencyToLebanese } from "../../utils/utilities";

const ServiceTable = ({ services, onServiceEdited, onServiceDeleted }) => {
  const [openEditServiceId, setOpenEditServiceId] = useState(null);
  const [openDeleteServiceId, setOpenDeleteServiceId] = useState(null);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography
                  variant="h6"
                  style={{ fontFamily: "Almarai, sans-serif" }}
                >
                  اسم الخدمة
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="h6"
                  style={{ fontFamily: "Almarai, sans-serif" }}
                >
                  التعرفة
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="h6"
                  style={{ fontFamily: "Almarai, sans-serif" }}
                >
                  الإجراءات
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <>
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>
                    {formatCurrencyToLebanese(service.price)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      sx={{ color: "#197632" }}
                      onClick={() => setOpenEditServiceId(service.id)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      sx={{ color: "red" }}
                      onClick={() => setOpenDeleteServiceId(service.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <EditServiceModal
                  open={openEditServiceId === service.id}
                  onClose={() => setOpenEditServiceId(null)}
                  service={service}
                  onServiceEdited={() => {
                    setOpenEditServiceId(null);
                    onServiceEdited(service.id); // Notify parent component about the edit
                  }}
                />
                <DeleteServiceModal
                  open={openDeleteServiceId === service.id}
                  onClose={() => setOpenDeleteServiceId(null)}
                  serviceId={service.id}
                  onServiceDeleted={() => {
                    setOpenDeleteServiceId(null);
                    onServiceDeleted(service.id); // Notify parent component about the deletion
                  }}
                />
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ServiceTable;

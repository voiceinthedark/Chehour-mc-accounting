// filepath: apps/web-display/src/components/Cards/ServiceList.jsx

import { Grid } from "@mui/material";
import ServiceCard from "./ServiceCard";

const ServiceList = ({ services, onEdit, onDelete }) => {
  return (
    <Grid
      container
      spacing={2}
      style={{ marginTop: "20px" }}
      justifyContent="start"
    >
      {services.map((service) => (
        <Grid item xs={12} sm={6} md={4} key={service.id}>
          <ServiceCard service={service} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ServiceList;

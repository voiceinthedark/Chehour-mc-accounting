// filepath: apps/web-display/src/pages/settings/ServiceSettings.jsx

import { Typography } from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font

const ServiceSettings = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Typography
        variant="h3"
        component="h1"
        style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
      >
        إعدادات الخدمات
      </Typography>
      <Typography
        variant="body1"
        style={{ fontFamily: "Almarai, sans-serif", fontSize: "1.2rem" }}
      >
        هنا يمكنك تعديل إعدادات الخدمات حسب احتياجاتك.
      </Typography>
    </div>
  );
};

export default ServiceSettings;

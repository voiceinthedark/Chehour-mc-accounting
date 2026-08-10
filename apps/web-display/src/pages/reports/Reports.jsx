// filepath: apps/web-display/src/pages/reports/Reports.jsx

import { Typography } from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font

const Reports = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Typography
        variant="h3"
        component="h1"
        style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
      >
        تقارير النظام
      </Typography>
      <Typography
        variant="body1"
        style={{ fontFamily: "Almarai, sans-serif", fontSize: "1.2rem" }}
      >
        هنا يمكنك عرض وتحليل تقارير النظام المختلفة.
      </Typography>
    </div>
  );
};

export default Reports;

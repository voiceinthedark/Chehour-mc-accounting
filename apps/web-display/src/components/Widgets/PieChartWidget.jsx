// filepath: apps/web-display/src/components/Widgets/PieChartWidget.jsx

import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";
import "@fontsource/almarai"; // Import Almarai font

const PieChartWidget = ({ data, title }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Almarai, sans-serif",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        {title}
      </Typography>
      <PieChart series={[{ data }]} width={400} height={400} title={title} />
    </Box>
  );
};

export default PieChartWidget;

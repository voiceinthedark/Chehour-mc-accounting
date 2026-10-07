// filepath: apps/web-display/src/components/Widgets/PieChartWidget.jsx

import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";
import "@fontsource/almarai"; // Import Almarai font
import { CATEGORIES } from "../../utils/constants/categories";

/**
 * PieChartWidget component renders a pie chart with the given data and title.
 * Can be rendered as a donut chart if the `donut` prop is true.
 *
 * @param {Array} data - The data to be displayed in the pie chart.
 * @param {string} title - The title of the pie chart.
 * @param {boolean} donut - Whether to render the pie chart as a donut chart.
 * @returns {JSX.Element} The rendered PieChartWidget component.
 ***/
const PieChartWidget = ({ data, title, donut }) => {
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
      {donut ? (
        <PieChart
          series={[{ data }]}
          width={400}
          height={400}
          title={title}
          innerRadius={0.5}
        />
      ) : (
        <PieChart series={[{ data }]} width={400} height={400} title={title} />
      )}
    </Box>
  );
};

export default PieChartWidget;

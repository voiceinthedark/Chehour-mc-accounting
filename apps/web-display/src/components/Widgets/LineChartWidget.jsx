// filepath: apps/web-display/src/components/Widgets/LineChartWidget.jsx

import { LineChart } from "@mui/x-charts/LineChart";

/**
 * LineChartWidget component to Render profit and expenses during the year, on a monthly basis.
 * @param {Array} data - The data to be displayed in the line chart.
 * @param {string} xAxisKey - The key for the x-axis data in the data array.
 * @param {string} yAxisKey - The key for the y-axis data in the data array.
 * @param {string} title - The title of the chart.
 * @returns {JSX.Element} - A React component that renders a line chart with the provided data and title.
 * **/
const LineChartWidget = ({ data, xAxisKey, yAxisKey, title }) => {
  return (
    <div style={{ width: "100%", height: "400px" }}>
      <h3>{title}</h3>
      <LineChart
        data={data}
        xAxisKey={xAxisKey}
        yAxisKey={yAxisKey}
        width={800}
        height={400}
      />
    </div>
  );
};

export default LineChartWidget;

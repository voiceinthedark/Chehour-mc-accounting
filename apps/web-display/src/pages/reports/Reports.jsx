// filepath: apps/web-display/src/pages/reports/Reports.jsx

import { useState } from "react";
import {
  Typography,
  Tabs,
  Tab,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import "@fontsource/almarai";
import DoctorPayoutsTab from "./DoctorPayoutsTab";
import MonthlySummaryTab from "./MonthlySummaryTab";

// ============================================================
// ROOT COMPONENT
// ============================================================
const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        تقارير النظام
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label={
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              مستحقات الأطباء
            </Typography>
          }
        />
        <Tab
          label={
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              الملخص المالي الشهري
            </Typography>
          }
        />
      </Tabs>

      {activeTab === 0 && <DoctorPayoutsTab />}
      {activeTab === 1 && <MonthlySummaryTab />}
    </div>
  );
};

export default Reports;

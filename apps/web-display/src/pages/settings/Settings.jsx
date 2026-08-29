import { useState } from "react";
import { Typography, Tabs, Tab, Box } from "@mui/material";
import "@fontsource/almarai";
import DoctorSettings from "./DoctorSettings";
import ServiceSettings from "./ServiceSettings";

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Almarai, sans-serif" }}
      >
        الإعدادات
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label={
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              إعدادات الخدمات
            </Typography>
          }
        />
        <Tab
          label={
            <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
              إعدادات الأطباء
            </Typography>
          }
        />
      </Tabs>

      <Box hidden={activeTab !== 0}>
        {activeTab === 0 && <ServiceSettings />}
      </Box>
      <Box hidden={activeTab !== 1}>
        {activeTab === 1 && <DoctorSettings />}
      </Box>
    </div>
  );
};

export default Settings;

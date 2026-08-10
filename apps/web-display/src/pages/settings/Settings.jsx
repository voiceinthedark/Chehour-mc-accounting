// filepath: apps/web-display/src/pages/settings/Settings.jsx

import { Outlet } from "react-router-dom";
import { Typography } from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font
import LargeLinkButton from "../../components/Links/LargeLinkButton";
import "./settings.scss";

const Settings = () => {
  return (
    <>
      <div className="settings-buttons">
        <LargeLinkButton to="/settings/services">
          <Typography
            variant="h5"
            component="h2"
            style={{ fontFamily: "Almarai, sans-serif" }}
          >
            إعدادات الخدمات
          </Typography>
        </LargeLinkButton>
        <LargeLinkButton to="/settings/doctors">
          <Typography
            variant="h5"
            component="h2"
            style={{ fontFamily: "Almarai, sans-serif" }}
          >
            إعدادات الأطباء
          </Typography>
        </LargeLinkButton>
      </div>
      <Outlet />
    </>
  );
};

export default Settings;

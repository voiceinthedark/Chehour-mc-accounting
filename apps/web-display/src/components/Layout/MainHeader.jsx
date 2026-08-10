// filepath: apps/web-display/src/components/Layout/MainHeader.jsx

import { AppBar, Toolbar, Typography } from "@mui/material";
import LinkButton from "../Links/LinkButton";
import "@fontsource/almarai"; // Import the Almarai font
import "./mainHeader.scss";

const MainHeader = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#277147" }}>
      <Toolbar className="toolbar">
        <Typography
          variant="h6"
          sx={{ fontFamily: "Almarai, sans-serif", fontSize: "2.5rem" }}
        >
          مركز شحور الصحي
        </Typography>
        <div className="toolbar-links">
          <LinkButton to="/" color="inherit">
            <Typography
              variant="h6"
              sx={{ fontFamily: "Almarai, sans-serif", fontSize: "1.5rem" }}
            >
              الرئيسية
            </Typography>
          </LinkButton>
          <LinkButton to="/billing" color="inherit">
            <Typography
              variant="h6"
              sx={{ fontFamily: "Almarai, sans-serif", fontSize: "1.5rem" }}
            >
              حسابات
            </Typography>
          </LinkButton>
          <LinkButton to="/reports" color="inherit">
            <Typography
              variant="h6"
              sx={{ fontFamily: "Almarai, sans-serif", fontSize: "1.5rem" }}
            >
              تقارير
            </Typography>
          </LinkButton>
          <LinkButton to="/settings" color="inherit">
            <Typography
              variant="h6"
              sx={{ fontFamily: "Almarai, sans-serif", fontSize: "1.5rem" }}
            >
              إعدادات
            </Typography>
          </LinkButton>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default MainHeader;

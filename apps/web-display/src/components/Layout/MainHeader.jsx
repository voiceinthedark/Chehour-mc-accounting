// filepath: apps/web-display/src/components/Layout/MainHeader.jsx

import { AppBar, Toolbar, Typography } from "@mui/material";
import LinkButton from "../Links/LinkButton";

const MainHeader = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Chehour Medical Center Accounting</Typography>
        <div style={{ marginLeft: "auto" }}>
          <LinkButton to="/" color="inherit">
            Home
          </LinkButton>
          <LinkButton to="/billing" color="inherit">
            Billing
          </LinkButton>
          <LinkButton to="/settings" color="inherit">
            Settings
          </LinkButton>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default MainHeader;

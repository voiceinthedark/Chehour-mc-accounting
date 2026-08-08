// filepath: apps/web-display/src/components/Layout/MainLayout.jsx

import { Box, AppBar, Toolbar, Typography, Container } from "@mui/material";
import MainHeader from "./MainHeader";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MainHeader />
      <Container sx={{ flex: 1, mt: 4 }}>{children}</Container>
      <Box
        component="footer"
        sx={{ py: 2, textAlign: "center", bgcolor: "#f5f5f5" }}
      >
        <Typography variant="body2" color="textSecondary">
          &copy; {new Date().getFullYear()} Chehour Medical Center. All rights
          reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;

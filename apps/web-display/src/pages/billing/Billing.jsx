// filepath: apps/web-display/src/pages/billing/Billing.jsx

import { Typography } from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font

const Billing = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Typography
        variant="h3"
        component="h1"
        style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
      >
        حسابات النظام
      </Typography>
      <Typography
        variant="body1"
        style={{ fontFamily: "Almarai, sans-serif", fontSize: "1.2rem" }}
      >
        هنا يمكنك إدارة الحسابات والفواتير الخاصة بالنظام.
      </Typography>
    </div>
  );
};

export default Billing;

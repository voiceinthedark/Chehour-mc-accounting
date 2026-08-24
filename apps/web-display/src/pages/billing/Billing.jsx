// filepath: apps/web-display/src/pages/billing/Billing.jsx

import { Typography } from "@mui/material";
import MonthlyEntry from "./MonthlyEntry";
import "@fontsource/almarai"; // Import the Almarai font

const Billing = () => {
  return (
    <>
      <div style={{ padding: "20px" }}></div>
      <MonthlyEntry />
    </>
  );
};

export default Billing;

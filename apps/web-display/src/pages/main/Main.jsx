// filepath: apps/web-display/src/pages/main/Main.jsx

// This is the main page of the web display application.
// It will serve as the entry point for the accounting system.
// The page will display with large fonts the IN/OUT FLOW of the accounting system for the current Month, and the total balance of the accounting system for the current Month.

import MoneyWidget from "../../components/Widgets/MoneyWidget";
import "./main.scss";
import "@fontsource/almarai"; // Import the Almarai font
import { Typography } from "@mui/material";

const Main = () => {
  // TODO: Fetch the data from the backend and display it in the widgets.
  return (
    <div className="main-container">
      <Typography
        variant="h3"
        component="h1"
        className="main-title"
        style={{ fontFamily: "Almarai, sans-serif", marginBottom: "20px" }}
      >
        نظام المحاسبة لمركز شحور الصحي
      </Typography>
      <div className="widgets-container">
        <MoneyWidget title="مدخول" amount={5000} color="green" />
        <MoneyWidget title="مصروفات" amount={3000} color="red" />
        <MoneyWidget title="رصيد عام" amount={2000} color="blue" />
      </div>
    </div>
  );
};

export default Main;

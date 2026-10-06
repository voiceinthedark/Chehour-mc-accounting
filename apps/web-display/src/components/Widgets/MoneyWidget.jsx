// filepath: apps/web-display/src/components/widgets/MoneyWidget.jsx

import { Card, CardContent, Typography } from "@mui/material";
import { TrendingDown, TrendingUp } from "@mui/icons-material";
import "@fontsource/almarai"; // Import the Almarai font

const MoneyWidget = ({ title, amount, color }) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        margin: 2,
        backgroundColor:
          color === "green"
            ? "rgb(0,133,0,0.3)"
            : color === "red"
              ? "rgb(255,0,0,0.3)"
              : "white",
        borderRadius: "15px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          style={{
            fontFamily: "Almarai, sans-serif",
            marginBottom: "22px",
            opacity: 1,
          }}
        >
          {title}
        </Typography>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          {color === "green" ? (
            <TrendingUp style={{ color: "green", marginRight: "8px" }} />
          ) : color === "red" ? (
            <TrendingDown style={{ color: "red", marginRight: "8px" }} />
          ) : null}
          <Typography
            variant="h4"
            color="text.secondary"
            style={{ fontFamily: "Almarai, sans-serif" }}
          >
            ${amount.toFixed(2)}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoneyWidget;

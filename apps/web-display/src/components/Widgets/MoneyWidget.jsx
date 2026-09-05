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
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          style={{ fontFamily: "Almarai, sans-serif", marginBottom: "22px" }}
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

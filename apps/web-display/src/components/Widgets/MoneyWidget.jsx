// filepath: apps/web-display/src/components/widgets/MoneyWidget.jsx

import { Card, CardContent, Typography } from "@mui/material";
import "@fontsource/almarai"; // Import the Almarai font

const MoneyWidget = ({ title, amount, color }) => {
  return (
    <Card sx={{ minWidth: 275, margin: 2 }}>
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          style={{ fontFamily: "Almarai, sans-serif", marginBottom: "22px" }}
        >
          {title}
        </Typography>
        <Typography variant="h4" color={color}>
          ${amount.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MoneyWidget;

// filepath: apps/web-display/src/components/Links/LargeLinkButton.jsx

import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./largeLinkButton.scss";

const LargeLinkButton = ({ to, children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      style={{ fontSize: "1.5rem", padding: "15px 30px", margin: "10px" }}
    >
      {children}
    </Button>
  );
};

export default LargeLinkButton;

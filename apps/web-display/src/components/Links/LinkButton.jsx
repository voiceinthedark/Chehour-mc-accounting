// filepath: apps/web-display/src/components/Links/LinkButton.jsx

import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import "./linkButton.scss";

const LinkButton = ({ to, children, ...props }) => {
  return (
    <Button component={Link} to={to} {...props}>
      {children}
    </Button>
  );
};

export default LinkButton;

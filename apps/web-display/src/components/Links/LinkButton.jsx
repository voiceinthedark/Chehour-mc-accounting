// filepath: apps/web-display/src/components/Links/LinkButton.jsx

import React from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

const LinkButton = ({ to, children, ...props }) => {
  return (
    <Button component={Link} to={to} {...props}>
      {children}
    </Button>
  );
};

export default LinkButton;

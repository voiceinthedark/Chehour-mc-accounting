// filepath: apps/web-display/src/components/Inputs/NumberField.jsx

import { TextField } from "@mui/material";

const NumberField = ({ label, value, onChange, ...props }) => {
  const handleChange = (event) => {
    const newValue = event.target.value;
    if (/^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const formatValueInLebaneseCurrency = (value) => {
    if (!value) return "";
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return "";
    return new Intl.NumberFormat("ar-LB", {
      style: "currency",
      currency: "LBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  return (
    <TextField
      label={label}
      value={formatValueInLebaneseCurrency(value)}
      onChange={handleChange}
      {...props}
    />
  );
};

export default NumberField;

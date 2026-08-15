// filepath: apps/web-display/src/components/Inputs/NumberField.jsx

const NumberField = ({ label, value, onChange, ...props }) => {
  const handleChange = (event) => {
    const raw = event.target.value.replace(/[^0-9.]/g, "");
    if (/^\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  };

  const formatValueInLebaneseCurrency = (value) => {
    if (!value) return "";
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return "";
    return new Intl.NumberFormat("en-LB", {
      style: "currency",
      currency: "LBP",
      currencyDisplay: "symbol",
      unitDisplay: "narrow",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencySign: "accounting",
    }).format(numberValue);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontFamily: "Almarai, sans-serif",
            fontWeight: "bold",
          }}
        >
          {label}
        </label>
      )}
      <input
        type="text"
        value={formatValueInLebaneseCurrency(value)}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
        {...props}
      />
    </div>
  );
};

export default NumberField;

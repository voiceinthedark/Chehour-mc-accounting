// filepath: apps/web-display/src/components/Pills/DollarPill.jsx

const DollarPill = ({ amountInDollars, position }) => {
  // TODO: Implement the pill component with the given amount and position
  const getPositionStyles = (position) => {
    let pos = {};
    switch (position) {
      case "top-left":
        pos = { top: "0.3rem", left: "-1rem" };
        break;
      case "top-right":
        pos = { top: "0.3rem", right: "-1rem" };
        break;
      case "bottom-left":
        pos = { bottom: "0.3rem", left: "-1rem" };
        break;
      case "bottom-right":
        pos = { bottom: "0.3rem", right: "-1rem" };
        break;
      default:
        pos = "";
        break;
    }
    return pos;
  };

  return (
    <div
      style={{
        display: "inline-block",
        padding: "0.2rem 0.5rem",
        borderRadius: "9999px",
        backgroundColor: "#4CAF50",
        color: "#fff",
        fontFamily: "Almarai, sans-serif",
        position: "absolute",
        top: getPositionStyles(position).top,
        left: getPositionStyles(position).left,
        right: getPositionStyles(position).right,
        bottom: getPositionStyles(position).bottom,
      }}
    >
      {amountInDollars}
    </div>
  );
};

export default DollarPill;

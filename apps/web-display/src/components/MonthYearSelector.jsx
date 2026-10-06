import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

const MONTH_NAMES = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

const MonthYearSelector = function ({
  month,
  year,
  onMonthChange,
  onYearChange,
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontFamily: "Almarai, sans-serif" }}>
            الشهر
          </InputLabel>
          <Select
            value={month}
            label="الشهر"
            onChange={(e) => onMonthChange(e.target.value)}
          >
            {MONTH_NAMES.map((name, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                  {name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={3}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontFamily: "Almarai, sans-serif" }}>
            السنة
          </InputLabel>
          <Select
            value={year}
            label="السنة"
            onChange={(e) => onYearChange(e.target.value)}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                <Typography sx={{ fontFamily: "Almarai, sans-serif" }}>
                  {y}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default MonthYearSelector;

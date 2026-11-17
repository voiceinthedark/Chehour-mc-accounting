// filepath: web-display/src/pages/xray/XRayEntry.jsx

import { useState, useEffect } from "react";

import {
  FormControl,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Select,
  MenuItem,
  Paper,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableCell,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_XRAY_URL } from "../../apiconfig";
import "@fontsource/almarai";
import "@fontsource-variable/roboto";
import { formatCurrencyToLebanese } from "../../utils/utilities";

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

export default function XRayEntry() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [CurrentMonthXRayData, setCurrentMonthXRayData] = useState(null);
  const [AllXRayData, setAllXRayData] = useState([]);
  const [monthlyPatientsCount, setMonthlyPatientsCount] = useState(0);
  const [monthlyXRayFee, setMonthlyXRayFee] = useState(0);

  let totalXRayRevenue = monthlyPatientsCount * monthlyXRayFee;

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_XRAY_URL}/orders`, {
        patientsCount: monthlyPatientsCount,
        pricePerPatient: monthlyXRayFee,
        date: new Date(year, selectedMonth - 1, 1).toISOString(),
      });
      toast.success("تم حفظ بيانات الأشعة بنجاح");
    } catch (error) {
      console.error("Error saving X-Ray data:", error);
      toast.error("حدث خطأ أثناء حفظ بيانات الأشعة");
    }
  };

  // Fetch existing X-Ray data for the selected month and year
  useEffect(() => {
    const fetchXrayData = async () => {
      try {
        const response = await axios.get(`${API_XRAY_URL}/orders`, {
          params: {
            startDate: new Date(year, selectedMonth - 1, 1).toISOString(),
            endDate: new Date(year, selectedMonth, 0).toISOString(),
          },
        });
        setCurrentMonthXRayData(response.data);
      } catch (error) {
        console.error("Error fetching X-Ray data:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الأشعة");
      }
    };
    fetchXrayData();
  }, [selectedMonth, year]);

  // Fetch all X-Ray data for the year
  useEffect(() => {
    const fetchAllXrayData = async () => {
      try {
        const response = await axios.get(`${API_XRAY_URL}/orders`, {
          params: {
            startDate: new Date(year, 0, 1).toISOString(),
            endDate: new Date(year, 11, 31).toISOString(),
          },
        });
        setAllXRayData(response.data);
      } catch (error) {
        console.error("Error fetching all X-Ray data:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الأشعة السنوية");
      }
    };
    fetchAllXrayData();
  }, [year]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h3" fontFamily={"Almarai"} gutterBottom>
        إدخال بيانات الأشعة
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MONTH_NAMES.map((month, index) => (
                <MenuItem key={index} value={index + 1}>
                  <Typography variant="body1" sx={{ fontFamily: "Almarai" }}>
                    {month}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(
              (yearOption) => (
                <MenuItem key={yearOption} value={yearOption}>
                  <Typography variant="body1" sx={{ fontFamily: "Roboto" }}>
                    {yearOption}
                  </Typography>
                </MenuItem>
              ),
            )}
          </Select>
        </Grid>
      </Grid>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "stretch",
          width: "100%",
          fontFamily: "Almarai",
        }}
      >
        <Box sx={{ mt: 2, fontFamily: "Almarai", flex: "1 0 auto" }}>
          <TextField
            label="عدد المرضى"
            type="number"
            value={monthlyPatientsCount}
            onChange={(e) => setMonthlyPatientsCount(Number(e.target.value))}
            fullWidth
            fontFamily="Almarai"
          />
        </Box>
        <Box sx={{ mt: 2, fontFamily: "Amlarai", flex: "1 0 auto" }}>
          <TextField
            label="رسوم الأشعة الشهرية"
            type="number"
            value={monthlyXRayFee}
            onChange={(e) => setMonthlyXRayFee(Number(e.target.value))}
            fullWidth
            fontFamily="Almarai"
          />
        </Box>
      </Box>
      <Divider variant="middle" sx={{ mt: 2, mb: 2 }} />
      <Typography
        variant="h6"
        sx={{ direction: "rtl", textAlign: "right", mt: 2 }}
        fontFamily={"Almarai"}
      >
        أو أدخل الرصيد الشهري مباشرة:
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          label="إجمالي الإيرادات الشهرية"
          type="number"
          value={totalXRayRevenue}
          onChange={(e) => {
            const newTotalRevenue = Number(e.target.value);
            if (monthlyPatientsCount > 0) {
              setMonthlyXRayFee(newTotalRevenue / monthlyPatientsCount);
            }
          }}
          fullWidth
          fontFamily="Almarai"
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" fontFamily={"Almarai"}>
          إجمالي إيرادات الأشعة: {formatCurrencyToLebanese(totalXRayRevenue.current)}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          <Typography variant="body1" sx={{ fontFamily: "Almarai" }}>
            حفظ البيانات
          </Typography>
        </Button>
      </Box>
      {/* Display the table of all X-Ray data for the year */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontFamily={"Almarai"} gutterBottom>
          بيانات الأشعة للعام {year}
        </Typography>
        {AllXRayData.length === 0 ? (
          <Typography variant="body1" fontFamily={"Almarai"}>
            لا توجد بيانات متاحة لهذا العام.
          </Typography>
        ) : (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الشهر</TableCell>
                  <TableCell>عدد المرضى</TableCell>
                  <TableCell>رسوم الأشعة لكل مريض</TableCell>
                  <TableCell>إجمالي الإيرادات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {AllXRayData.map((data) => {
                  const monthIndex = new Date(data.date).getMonth();
                  const monthName = MONTH_NAMES[monthIndex];
                  const totalRevenue = data.patientsCount * data.pricePerPatient;
                  return (
                    <TableRow key={data.date}>
                      <TableCell>{monthName}</TableCell>
                      <TableCell>{data.patientsCount}</TableCell>
                      <TableCell>{formatCurrencyToLebanese(data.pricePerPatient)}</TableCell>
                      <TableCell>{formatCurrencyToLebanese(totalRevenue)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="h6" fontFamily={"Almarai"}>
                      إجمالي الإيرادات السنوية:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" fontFamily={"Almarai"}>
                      {formatCurrencyToLebanese(
                        AllXRayData.reduce(
                          (acc, data) => acc + data.patientsCount * data.pricePerPatient,
                          0,
                        ),
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

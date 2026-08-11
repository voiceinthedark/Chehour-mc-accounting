// filepath: apps/web-display/src/components/Rows/DoctorRow.jsx

import { TextField, Box } from "@mui/material";
import NumberField from "../Inputs/NumberField";
import "./doctorRow.scss";

const DoctorRow = ({ doctor }) => {
  return (
    <Box className="doctor-row" key={doctor.id}>
      <TextField
        key={doctor.id}
        label={`اسم الطبيب:`}
        variant="outlined"
        fullWidth
        value={doctor.name}
      />
      <NumberField
        key={`${doctor.id}-fee`}
        label={`رسوم الطبيب:`}
        variant="outlined"
        fullWidth
        value={doctor.perPatientFee}
      />
      <TextField
        key={`${doctor.id}-visit-fee`}
        label={`نسبة الخدمة للطبيب:`}
        variant="outlined"
        fullWidth
        value={doctor.perVisitFee}
      />
    </Box>
  );
};

export default DoctorRow;

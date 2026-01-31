import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "../styles/Calendar.css";

interface DatePickerValueProps {
    onDateChange: (date: Dayjs | null) => void;
}

export default function DatePickerValue({ onDateChange }: DatePickerValueProps) {
  const date = new Date().toLocaleDateString("en-CA");
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(date));

    const handleDateChange = (newValue: Dayjs | null) => {
        setValue(newValue);
        onDateChange(newValue); // Notify form component of the date change
    }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="my-date-picker">
        <DemoContainer components={["DatePicker"]}>
          <DatePicker
            value={value}
            onChange={handleDateChange}
          />
        </DemoContainer>
      </div>
    </LocalizationProvider>
  );
}

import React, { useState, useEffect } from "react";
import { getAddressFromCoords } from "../utils/geocoding";
import "../styles/Form.css";
// import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import PinDropIcon from '@mui/icons-material/PinDrop';
import CircularProgress from '@mui/material/CircularProgress';
import {useAlert} from "./Alert";
import DatePickerValue from "./Calendar";
import { Dayjs } from "dayjs";

type location = {
  longitude: number;
  latitude: number;
};

type FormProps = {
  location: location;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
};

const Form = ({ location, onClose, onSubmit }: FormProps) => {
  //image
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const [address, setAddress] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // const date = new Date().toLocaleString();
  const {showAlert} = useAlert();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Reverse Geo
  useEffect(() => {
    async function fetchAddress() {
      // console.log("Fetching address for location:", location);
      const addr = await getAddressFromCoords(
        location.latitude,
        location.longitude
      );
      setAddress(addr);
      // console.log("Fetched address:", addr);
    }
    fetchAddress();
  }, [location]);

  // Submit
  const handleSubmit = async () => {
    if (!image) {
      showAlert("Please upload an image", "error");
      // alert("Please upload an image");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description || "");
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("createdAt", new Date().toISOString());
      formData.append("photo_date", selectedDate ? selectedDate.toISOString() : "");
      await onSubmit(formData); // Calls MapView's onSubmit function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-form">
      <h3 className="form-title">Upload Image</h3>

      {/* <input type="file" accept="image/*" onChange={handleImageChange} /> */}
      <label htmlFor="file-upload" className="file-upload-btn">
        Choose Image
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ width: "100%", marginTop: 10 }}
        />
      )}

      <textarea
        placeholder="Description (optional)"
        value={description || ""}
        onChange={(e) => setDescription(e.target.value)}
      />

      <p>
        {/* 📍  {address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`} */}
        <PinDropIcon style={{ verticalAlign: "middle",color: "#e74c3c", marginRight: 4 }} />
        {address}
      </p>

      {/* date photo taken */}
      {/* <p><AccessAlarmsIcon style={{ verticalAlign: "middle", color: "#63605dff",marginRight: 4 }} /> {date}</p> */}
      <DatePickerValue  onDateChange={setSelectedDate}/> {/* Capture selected date */}
      <button className="submit-button" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <>
            <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
            Posting...
          </>
        ) : (
          "Post"
        )}
      </button>
      <button  className="close-button" onClick={onClose} disabled={isLoading}>Close</button>
    </div>
  );
};

export default Form;

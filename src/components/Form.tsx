import React, { useState, useEffect } from "react";
import { getAddressFromCoords } from "../utils/geocoding";
import "../styles/Form.css";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { useAlert } from "./Alert";
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
      const addr = await getAddressFromCoords(
        location.latitude,
        location.longitude
      );
      setAddress(addr);
    }
    fetchAddress();
  }, [location]);

  // Submit
  const handleSubmit = async () => {
    if (!image) {
      showAlert("Please upload an image", "error");
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
      <div className="form-header">
        <div>
          <p className="form-eyebrow">New place</p>
          <h3 className="form-title">Create a post</h3>
          <p className="form-subtitle">
            Add a photo and a few details to this pin.
          </p>
        </div>
        <button
          type="button"
          className="form-icon-button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close post form"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <label htmlFor="file-upload" className="file-upload-btn">
        <AddPhotoAlternateOutlinedIcon />
        <span className="file-upload-copy">
          <strong>{image ? image.name : "Add a photo"}</strong>
          <small>{image ? "Choose a different image" : "JPG, PNG, or WebP"}</small>
        </span>
        <span className="file-upload-action">{image ? "Change" : "Browse"}</span>
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
          className="image-preview"
        />
      )}

      <label className="form-field">
        <span>Description <small>Optional</small></span>
        <textarea
          placeholder="What makes this place memorable?"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="location-summary">
        <PinDropOutlinedIcon fontSize="small" />
        <div>
          <span>Location</span>
          <p>{address || "Finding this address…"}</p>
        </div>
      </div>

      <DatePickerValue onDateChange={setSelectedDate} />

      <div className="form-actions">
        <button
          type="button"
          className="close-button"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <CircularProgress size={18} color="inherit" />
              Posting…
            </>
          ) : (
            "Publish post"
          )}
        </button>
      </div>
    </div>
  );
};

export default Form;

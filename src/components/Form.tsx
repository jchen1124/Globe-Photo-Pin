import React, { useState, useEffect } from "react";
import { getAddressFromCoords } from "../utils/geocoding";
import "../styles/Form.css";

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

  const date = new Date().toLocaleString();

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
      console.log("Fetched address:", addr);
    }
    fetchAddress();
  }, [location]);

  // Submit
  const handleSubmit = () => {
    if (!image) {
      alert("Please upload an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description || "");
    formData.append("latitude", location.latitude.toString());
    formData.append("longitude", location.longitude.toString());
    formData.append("createdAt", new Date().toISOString());

    onSubmit(formData);
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
        📍 {address}
      </p>

      <p>🕒 {date}</p>

      <button onClick={handleSubmit}>Submit</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Form;

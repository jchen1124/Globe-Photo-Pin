import { useState } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const libraries: "places"[] = ["places"];

type AddressData = {
  address: string;
  latitude: number;
  longitude: number;
};

interface AddressSearchProps {
  onSelectAddress: (data: AddressData) => void;
  className?: string;
}

const AddressSearch = ({
  onSelectAddress,
  className = "",
}: AddressSearchProps) => {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = (autocompleteObj: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteObj);
  };

  // When user selects a place
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";

        console.log("Selected place:", { lat, lng, address });

        // sends data to parent
        onSelectAddress({
          latitude: lat,
          longitude: lng,
          address: address,
        });
      }
    }
  };

  const clearSearch = () => {
    setInputValue("");
  };

  if (loadError) {
    return (
      <div
        style={{
          color: "#e74c3c",
          fontSize: "12px",
          padding: "10px",
          background: "rgba(231, 76, 60, 0.1)",
          borderRadius: "6px",
        }}
      >
        ⚠️ Error loading search
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          fontSize: "14px",
          color: "#666",
          padding: "12px",
          textAlign: "center",
        }}
      >
        Loading search...
      </div>
    );
  }

  return (
    <div className={`address-search-container ${className}`}>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          fields: ["formatted_address", "geometry", "name"],
        }}
      >
        <div className="search-input-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search any location on Earth..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="search-input"
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="clear-search-btn"
              type="button"
              aria-label="Clear search"
            >
              <CloseIcon style={{ fontSize: "18px" }} />
            </button>
          )}
        </div>
      </Autocomplete>
    </div>
  );
};

export default AddressSearch;

import { useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import Form from "./Form";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/MapView.css";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  [key: string]: any;
};

const MapView = () => {
  // Map View State
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });

  // Pin Marker State
  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  // Function to get and use the user's current location
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState((prevState) => ({
            ...prevState,
            latitude,
            longitude,
            zoom: 10,
          }));
          setSelectedLocation({
            latitude,
            longitude,
          });
        },
        (error) => {
          alert("Unable to retrieve your location");
          console.error(error);
        }
      );
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button className="use-location-btn" onClick={useCurrentLocation}>
        Use My Location
      </button>

      <Map
        {...viewState}
        onMove={(evt: { viewState: MapViewState }) =>
          setViewState(evt.viewState)
        }
        onClick={(evt) => {
          const { lng, lat } = evt.lngLat;

          setSelectedLocation({
            longitude: lng,
            latitude: lat,
          });

          // call show form

          console.log("Clicked location:", lng, lat);
        }}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      >
        {/* Place Marker */}
        {selectedLocation && (
          <Marker
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            anchor="bottom"
          >
            <div style={{ fontSize: "35px", cursor: "pointer" }}>📍</div>
          </Marker>
        )}

        {selectedLocation && (
          <button
            className="remove-marker-btn"
            onClick={() => setSelectedLocation(null)}
          >
            Remove Pin
          </button>
        )}
      </Map>

      {/* Show form overlay */}
      {selectedLocation && (
        <div className="form-overlay">
          <Form
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onSubmit={async (formData) => {
              try {
                await axios.post("http://localhost:3001/posts", formData);
                alert("Form submitted successfully!");
                setSelectedLocation(null);
              } catch (error) {
                console.error("Error submitting form:", error);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;

import { useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  [key: string]: any;
};

const MapView = () => {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });

  // Marker
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
      <button
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1,
          padding: "8px 12px",
          background: "white",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={useCurrentLocation}
      >
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

          console.log("Clicked location:", lng, lat);
        }}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {selectedLocation && (
          <Marker
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            anchor="bottom"
          >
            <div style={{ fontSize: "35px", cursor: "pointer" }}>📍</div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default MapView;

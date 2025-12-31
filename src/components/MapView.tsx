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

  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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

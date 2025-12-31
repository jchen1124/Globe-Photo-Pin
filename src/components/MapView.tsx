import { useState } from "react";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  [key: string]: any;
}

const MapView = () => {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        {...viewState}
        onMove={(evt: { viewState: MapViewState }) => setViewState(evt.viewState)}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      />
    </div>
  );
};

export default MapView;

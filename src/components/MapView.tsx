import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import Form from "./Form";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/MapView.css";
import { getAddressFromCoords } from "../utils/geocoding";
import RoomIcon from "@mui/icons-material/Room";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  [key: string]: any;
};

type Post = {
  id: number;
  latitude: number;
  longitude: number;
  image_url: string;
  description: string;
  created_at: string;
};

const MapView = () => {
  // Map View State
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 2.3,
  });

  // Pin Marker State
  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);

  // Selected Post State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Popup Address State
  const [popupAddress, setPopupAddress] = useState<string | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("http://localhost:3001/posts");
      const data = await response.json();
      // console.log("Fetched posts:", data);
      setPosts(data);
      // console.log("Posts state set:", posts);
    };
    fetchPosts();
  }, []);

  // Fetch address for selected post
  useEffect(() => {
    if (selectedPost) {
      async function fetchPopupAddress() {
        const addr = await getAddressFromCoords(
          selectedPost!.latitude,
          selectedPost!.longitude
        );
        setPopupAddress(addr);
        console.log("Fetched popup address:", addr);
      }
      fetchPopupAddress();
    } else {
      setPopupAddress(null);
    }
  }, [selectedPost]);

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
            zoom: 17,
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

  const ZoomtoPost = () => {
    if (selectedPost) {
      setViewState((prevState) => ({
        ...prevState,
        latitude: selectedPost.latitude,
        longitude: selectedPost.longitude,
        zoom: 15,
      }));
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

        {/* Show pins from database */}
        {posts.map((post) => (
          <Marker
            key={post.id}
            latitude={post.latitude}
            longitude={post.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPost(post);
            }}
          >
            <RoomIcon
              style={{ fontSize: 45, color: "#e74c3c", cursor: "pointer" }}
            />
          </Marker>
        ))}

        {/* Show selected post details */}
        {selectedPost && (
          <Popup
            latitude={selectedPost.latitude}
            longitude={selectedPost.longitude}
            onClose={() => setSelectedPost(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div className="selected-post">
              <button className="zoom-selected-post" onClick={ZoomtoPost}>
                Zoom to Location
              </button>
              <img
                src={`http://localhost:3001/uploads/${selectedPost.image_url}`}
                alt="Post"
                style={{ width: "100%", borderRadius: "6px" }}
              />
              <button
                className="view-image-button"
                onClick={() => setIsImageModalOpen(true)}
              >
                View Image
              </button>

              {/* show address  */}
              <p className="popup-address">📍 {popupAddress}</p>

              {/* show time and date */}
              <p className="popup-time">
                🕒{" "}
                {new Date(selectedPost.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>

              {/* show description  */}
              {selectedPost.description && (
                <p className="popup-description">{selectedPost.description}</p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Image Modal */}
      {isImageModalOpen && selectedPost && (
        <div className="image-modal" onClick={() => setIsImageModalOpen(false)}>
          <img
            src={`http://localhost:3001/uploads/${selectedPost.image_url}`}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Show form overlay */}
      {selectedLocation && (
        <div className="form-overlay">
          <Form
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onSubmit={async (formData) => {
              // calls form and submits to backend
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

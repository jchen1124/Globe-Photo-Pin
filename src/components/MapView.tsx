import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import Form from "./Form";
import AddressSearch from "./AddressSearch";
// import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/MapView.css";
import { getAddressFromCoords } from "../utils/geocoding";
import RoomIcon from "@mui/icons-material/Room";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "./Alert";

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
  const mapRef = useRef<MapRef>(null);
  const { showAlert } = useAlert();
  // Map View State
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 2.1,
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

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // myposts state
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);
  const { user } = useAuth();

  // Reusable function to fetch posts
  const fetchPosts = async () => {
    console.time('Supabase_Fetch'); // Start timer
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (showMyPostsOnly && user) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    console.timeEnd('Supabase_Fetch'); // End timer: "Supabase_Fetch: 245ms"
    if (error) {
      console.error("Error fetching posts from Supabase:", error);
      return;
    }

    if (data) {
      setPosts(data);
    }
  };

  // Fetch posts on mount and when filter changes
  useEffect(() => {
    fetchPosts();
  }, [showMyPostsOnly, user]); // dependency on showMyPostsOnly and user

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
          flyToLocation(latitude, longitude, 17);
          // setViewState((prevState) => ({
          //   ...prevState,
          //   latitude,
          //   longitude,
          //   zoom: 17,
          // }));
          setSelectedLocation({
            latitude,
            longitude,
          });
        },
        (error) => {
          // alert("Unable to retrieve your location");
          showAlert("Unable to retrieve your location", "error");
          console.error(error);
        }
      );
    }
  };

  const flyToLocation = (latitude: number, longitude: number, zoom: number) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: zoom,
      duration: 2000, // 2 seconds animation
      essential: true,
    });
  }

  const handleSearchSelect = ( data : { latitude: number; longitude: number; address: string}) => {
    console.log('Flying to selected address:', data);

    // Fly to the selected location
    flyToLocation(data.latitude, data.longitude, 15);

    // Set selected location marker
    setSelectedLocation({
      latitude: data.latitude,
      longitude: data.longitude,
    });
  }

  const ZoomtoPost = () => {
    // if (selectedPost) {
    //   setViewState((prevState) => ({
    //     ...prevState,
    //     latitude: selectedPost.latitude,
    //     longitude: selectedPost.longitude,
    //     zoom: 15,
    //   }));
    // }
    
    // New flyTo implementation
    if (selectedPost) {
      flyToLocation(selectedPost.latitude, selectedPost.longitude, 15);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

      {/*  Address Search Overlay */}
      <div className = "search-overlay">
        <AddressSearch onSelectAddress={handleSearchSelect} className="address-search" />
      </div>

      <button className="use-location-btn" onClick={useCurrentLocation}>
        Use My Location
      </button>

      <button
        className="toggle-myposts-btn"
        onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}
      >
        {showMyPostsOnly ? "Show All Posts" : "Show My Posts"}
      </button>

      <Map
      ref={mapRef}
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
                src={
                  supabase.storage
                    .from("post-images")
                    .getPublicUrl(selectedPost.image_url).data.publicUrl
                }
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
            // get image URL from supabase storage
            src={
              supabase.storage
                .from("post-images")
                .getPublicUrl(selectedPost.image_url).data.publicUrl
            }
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
              // Check if user is signed in
              if (!user) {
                // alert("Please sign in to create a post");
                showAlert("Please sign in to create a post", "error");
                return;
              }

              try {
                // Using Supabase Storage to upload image
                const imageFile = formData.get("image") as File; // Actual image file
                const fileExtension = imageFile.name.split(".").pop();
                const fileName = `${user.id}-${Date.now()}.${fileExtension}`; // Include user ID in filename

                const { error: uploadError } = await supabase.storage
                  .from("post-images")
                  .upload(fileName, imageFile);
                if (uploadError) {
                  showAlert("Error uploading image to Supabase Storage", "error");
                  console.error("Supabase Storage upload error:", uploadError);
                  return;
                }

                // Insert post with image URl
                const { error: insertError } = await supabase
                  .from("posts")
                  .insert({
                    user_id: user?.id,
                    image_url: fileName,
                    description: formData.get("description") as string,
                    latitude: parseFloat(formData.get("latitude") as string),
                    longitude: parseFloat(formData.get("longitude") as string),
                    created_at: new Date().toISOString(),
                  });
                if (insertError) {
                  showAlert("Error inserting post into database", "error");
                  console.error("Supabase insert error:", insertError);
                  return;
                }

                // Refresh posts to show new one
                await fetchPosts();

                showAlert("Form submitted successfully!", "success");
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

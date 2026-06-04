import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import Form from "./Form";
import AddressSearch from "./AddressSearch";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/MapView.css";
import { getAddressFromCoords } from "../utils/geocoding";
import RoomIcon from "@mui/icons-material/Room";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "./Alert";
import Menu from "./Menu";
import SavedPostsPanel from "./SavedPostsPanel";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  [key: string]: any;
};

type Post = {
  id: number;
  user_id: string;
  latitude: number;
  longitude: number;
  image_url: string;
  imageUrl: string | null;
  description: string;
  created_at: string;
  photo_date: string;
};

const MapView = () => {
  const mapRef = useRef<MapRef>(null);
  const { showAlert } = useAlert();
  // Map View State

  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -100,
    latitude: 45,
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

  // bookmarked posts option state
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Show if post is bookmarked by user state
  const [bookmarkedPostIds, setBookedMarkedPostIds] = useState<Set<number>>(
    new Set(),
  );

  const isSelectedPostBookmarked =
    selectedPost ? bookmarkedPostIds.has(selectedPost.id) : false;

  const { user } = useAuth();

  // Reusable function to fetch posts
  const fetchPosts = async () => {
    // console.time('Supabase_Fetch'); // Start timer
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/posts/`;
      if (showMyPostsOnly && user) {
        url += `?user_id=${user.id}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchBookmarkedPostIds = async () => {
    if (!user) {
      setBookedMarkedPostIds(new Set());
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookmarks?user_id=${user.id}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked posts");
      }

      const bookmarkedPosts = await response.json();
      setBookedMarkedPostIds(
        new Set(bookmarkedPosts.map((post: Post) => post.id)),
      );
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
    }
  };

  // Responsive map view based on screen size
  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const isMobile = mobileQuery.matches;

    // Set initial state based on media query
    setViewState({
      longitude: -100,
      latitude: isMobile ? 42 : 45,
      zoom: isMobile ? 2 : 2.1,
    });

    // Update when media query changes (screen resize)
    const handleChange = () => {
      setViewState((prev) => ({
        ...prev,
        longitude: -100,
        latitude: mobileQuery.matches ? 42 : 45,
        zoom: mobileQuery.matches ? 2 : 2.1,
      }));
    };

    mobileQuery.addEventListener("change", handleChange);
    return () => mobileQuery.removeEventListener("change", handleChange);
  }, []);

  // Fetch posts on mount and when filter changes
  useEffect(() => {
    fetchPosts();
  }, [showMyPostsOnly, user]); // dependency on showMyPostsOnly and user

  useEffect(() => {
    fetchBookmarkedPostIds();
  }, [user]);

  const handleDelete = async (postId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/${postId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        showAlert("Error deleting post", "error");
        return;
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setSelectedPost(null);
      showAlert("Post deleted successfully", "success");
    } catch (error) {
      showAlert("Error deleting post", "error");
      console.error(error);
    }
  };

  // Fetch address for selected post
  useEffect(() => {
    if (selectedPost) {
      async function fetchPopupAddress() {
        const addr = await getAddressFromCoords(
          selectedPost!.latitude,
          selectedPost!.longitude,
        );
        setPopupAddress(addr);
        // console.log("Fetched popup address:", addr);
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
        },
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
  };

  const handleSearchSelect = (data: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    // console.log("Flying to selected address:", data);

    // Fly to the selected location
    flyToLocation(data.latitude, data.longitude, 15);

    // Set selected location marker
    setSelectedLocation({
      latitude: data.latitude,
      longitude: data.longitude,
    });
  };

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

  const savedPosts = posts.filter((post) => bookmarkedPostIds.has(post.id));

  const handleSavedPostSelect = (post: Post) => {
    setSelectedLocation(null);
    setSelectedPost(post);
    flyToLocation(post.latitude, post.longitude, 15);
  };

  // TODO: Fetch bookmarked post IDs/posts from /api/bookmarks once the backend flow is wired in.
  // The panel currently reads from bookmarkedPostIds so the UI can be built separately first.
  if (showBookmarkedOnly) {
    console.log(
      "Bookmarked posts option selected - showing bookmarked posts only",
    );
  }

  // toggle bookmark status of selected post
  const handleToggleBookmark = async (post: Post) => {
    if (!user) {
      showAlert("Please sign in to bookmark posts", "error");
      return;
    }

    const isBookmarked = bookmarkedPostIds.has(post.id);

    try {
      if (isBookmarked) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/bookmarks/${post.id}?user_id=${user.id}`,
          { method: "DELETE" },
        );

        if (!response.ok) {
          throw new Error("Failed to remove bookmark");
        }

        setBookedMarkedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(post.id);
          return next;
        });
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/bookmarks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.id,
              post_id: post.id,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to save bookmark");
        }

        setBookedMarkedPostIds((prev) => {
          const next = new Set(prev);
          next.add(post.id);
          return next;
        });
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      showAlert("Error updating bookmark", "error");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/*  Address Search Overlay */}
      <div className="search-overlay">
        <AddressSearch
          onSelectAddress={handleSearchSelect}
          className="address-search"
        />
      </div>

      <div className="menu-overlay">
        <Menu
          showMyPostsOnly={showMyPostsOnly}
          setShowMyPostsOnly={setShowMyPostsOnly}
          showBookmarkedOnly={showBookmarkedOnly}
          setShowBookmarkedOnly={setShowBookmarkedOnly}
          onUseCurrentLocation={useCurrentLocation}
        />
      </div>

      {/* if bookedmarked is true then we open side menu */}
      <SavedPostsPanel
        isOpen={showBookmarkedOnly}
        posts={savedPosts}
        onClose={() => setShowBookmarkedOnly(false)}
        onSelectPost={handleSavedPostSelect}
      />

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: { viewState: MapViewState }) =>
          setViewState(evt.viewState)
        }
        onClick={(evt) => {
          setSelectedPost(null); // Deselect post on map click
          const { lng, lat } = evt.lngLat;

          setSelectedLocation({
            longitude: lng,
            latitude: lat,
          });

          // console.log("Clicked location:", lng, lat);
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
              setSelectedLocation(null); // Deselect any selected location
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
              <div className="selected-post-actions">
                <button
                  className="popup-icon-button"
                  onClick={ZoomtoPost}
                  aria-label="Zoom to location"
                  title="Zoom to location"
                >
                  <ZoomInIcon fontSize="small" />
                </button>

                {user && selectedPost.user_id === user.id && (
                  <button
                    className="popup-icon-button popup-icon-button-danger"
                    onClick={() => handleDelete(selectedPost.id)}
                    aria-label="Delete post"
                    title="Delete post"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                )}
              </div>

              {/* Show bookmark icon */}
              {user && selectedPost && (
                <button
                  className="bookmark-post-button"
                  onClick={() => handleToggleBookmark(selectedPost)}
                  aria-label={
                    isSelectedPostBookmarked ? "Remove bookmark" : "Save post"
                  }
                >
                  {isSelectedPostBookmarked ? (
                    <BookmarkIcon />
                  ) : (
                    <BookmarkBorderIcon />
                  )}
                </button>
              )}

              <img
                src={selectedPost.imageUrl ?? ""}
                alt="Post"
                onClick={() => setIsImageModalOpen(true)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              />

              {/* show address  */}
              <p className="popup-address">📍 {popupAddress}</p>

              {/* now showing photo date */}
              <p className="popup-time">
                📸 Photo Taken:{" "}
                {new Date(selectedPost.photo_date).toLocaleString(undefined, {
                  dateStyle: "medium",
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
            src={selectedPost.imageUrl ?? ""}
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
              // // Check if user is signed in
              if (!user) {
                // alert("Please sign in to create a post");
                showAlert("Please sign in to create a post", "error");
                return;
              }

              try {
                const imageFile = formData.get("image") as File; // Actual image file
                const data = new FormData();
                data.append("image", imageFile);
                data.append("user_id", user.id);
                data.append(
                  "description",
                  formData.get("description") as string,
                );
                data.append("latitude", formData.get("latitude") as string);
                data.append("longitude", formData.get("longitude") as string);
                data.append("photo_date", formData.get("photo_date") as string);
                const response = await fetch(
                  `${import.meta.env.VITE_API_URL}/api/posts/`,
                  {
                    method: "POST",
                    body: data,
                  },
                );

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  console.error("Server error:", errorData);
                  throw new Error(errorData.message || "Failed to create post");
                }
                await fetchPosts();

                showAlert("Posted successfully!", "success");
                setSelectedLocation(null);
              } catch (error) {
                console.error("Error posting:", error);
                showAlert(
                  `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                  "error",
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;

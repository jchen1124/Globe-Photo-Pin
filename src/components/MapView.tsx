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
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ConfirmationModal from "./ConfirmationModal";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  [key: string]: any;
};

type ThemeMode = "light" | "dark";

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
  const pendingComposerZoomRef = useRef<number | null>(null);
  const { showAlert } = useAlert();
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = window.localStorage.getItem("globe-pin-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  // Map View State

  const [viewState, setViewState] = useState<MapViewState>(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    return {
      longitude: -100,
      latitude: isMobile ? 42 : 45,
      zoom: isMobile ? 2 : 2.1,
    };
  });
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => window.matchMedia("(max-width: 768px)").matches,
  );

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

  const isSelectedPostBookmarked = selectedPost
    ? bookmarkedPostIds.has(selectedPost.id)
    : false;

  const [confirmatinOpen, setConfirmationOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    window.localStorage.setItem("globe-pin-theme", themeMode);
    document.documentElement.dataset.mapTheme = themeMode;

    return () => {
      delete document.documentElement.dataset.mapTheme;
    };
  }, [themeMode]);

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

    const handleChange = () => {
      setIsMobileLayout(mobileQuery.matches);
    };

    handleChange();
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

  useEffect(() => {
    if (!selectedLocation) {
      pendingComposerZoomRef.current = null;
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const mobileVerticalOffset = Math.min(window.innerHeight * 0.23, 190);
      const zoom = pendingComposerZoomRef.current;

      mapRef.current?.easeTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        ...(zoom !== null && { zoom }),
        offset: isMobileLayout ? [0, -mobileVerticalOffset] : [230, 0],
        duration: 700,
        essential: true,
      });

      pendingComposerZoomRef.current = null;
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isMobileLayout, selectedLocation]);

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
          pendingComposerZoomRef.current = 17;
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

  const closePostComposer = () => {
    const location = selectedLocation;
    pendingComposerZoomRef.current = null;
    setSelectedLocation(null);

    if (location) {
      window.requestAnimationFrame(() => {
        mapRef.current?.easeTo({
          center: [location.longitude, location.latitude],
          offset: [0, 0],
          duration: 500,
          essential: true,
        });
      });
    }
  };

  const handleSearchSelect = (data: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    pendingComposerZoomRef.current = 15;
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
    <div className="map-page" data-theme={themeMode}>
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
          themeMode={themeMode}
          onToggleTheme={() =>
            setThemeMode((currentTheme) =>
              currentTheme === "light" ? "dark" : "light",
            )
          }
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

          pendingComposerZoomRef.current = null;
          setSelectedLocation({
            longitude: lng,
            latitude: lat,
          });

          // console.log("Clicked location:", lng, lat);
        }}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        mapStyle={
          themeMode === "light"
            ? "mapbox://styles/mapbox/streets-v12"
            : "mapbox://styles/mapbox/satellite-streets-v12"
        }
      >
        {/* Place Marker */}
        {selectedLocation && (
          <Marker
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            anchor="bottom"
          >
            <div
              className="draft-location-marker"
              aria-label="New post location"
            >
              <RoomIcon />
            </div>
          </Marker>
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
            maxWidth="340px"
          >
            <div className="selected-post">
              <div className="selected-post-media">
                <img
                  src={selectedPost.imageUrl ?? ""}
                  alt={selectedPost.description || "Pinned place"}
                  onClick={() => setIsImageModalOpen(true)}
                />

                <div className="selected-post-actions">
                  <button
                    className="popup-icon-button"
                    onClick={ZoomtoPost}
                    aria-label="Zoom to location"
                    title="Zoom to location"
                  >
                    <ZoomInIcon fontSize="small" />
                  </button>

                  {user && (
                    <button
                      className={`popup-icon-button ${
                        isSelectedPostBookmarked
                          ? "popup-icon-button-active"
                          : ""
                      }`}
                      onClick={() => handleToggleBookmark(selectedPost)}
                      aria-label={
                        isSelectedPostBookmarked
                          ? "Remove bookmark"
                          : "Save post"
                      }
                      title={
                        isSelectedPostBookmarked
                          ? "Remove bookmark"
                          : "Save post"
                      }
                    >
                      {isSelectedPostBookmarked ? (
                        <BookmarkIcon fontSize="small" />
                      ) : (
                        <BookmarkBorderIcon fontSize="small" />
                      )}
                    </button>
                  )}

                  {user && selectedPost.user_id === user.id && (
                    <button
                      className="popup-icon-button popup-icon-button-danger"
                      onClick={() => {
                        setPostToDelete(selectedPost);
                        setConfirmationOpen(true);
                      }}
                      aria-label="Delete post"
                      title="Delete post"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </div>

              <div className="selected-post-content">
                <p className="selected-post-eyebrow">Pinned place</p>

                {selectedPost.description && (
                  <p className="popup-description">
                    {selectedPost.description}
                  </p>
                )}

                <div className="selected-post-meta">
                  <div className="selected-post-meta-row">
                    <PlaceOutlinedIcon fontSize="small" />
                    <div>
                      <span>Location</span>
                      <p>{popupAddress || "Finding this address…"}</p>
                    </div>
                  </div>

                  <div className="selected-post-meta-row">
                    <CalendarTodayOutlinedIcon fontSize="small" />
                    <div>
                      <span>Photo date</span>
                      <p>
                        {new Date(selectedPost.photo_date).toLocaleString(
                          undefined,
                          {
                            dateStyle: "medium",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
            onClose={closePostComposer}
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
                
                if (response.status === 429) {
                  showAlert(
                    "Too many uploads. Please try again later.",
                    "error",
                  );
                  return;
                }

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  console.error("Server error:", errorData);
                  throw new Error(errorData.message || "Failed to create post");
                }
                await fetchPosts();

                showAlert("Posted successfully!", "success");
                closePostComposer();
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
      {confirmatinOpen && postToDelete && (
        <ConfirmationModal
          isOpen={confirmatinOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={async (confirmed) => {
            if (confirmed && postToDelete) {
              await handleDelete(postToDelete.id);
            }
            setConfirmationOpen(false);
            setPostToDelete(null);
          }}
          title="Delete Post"
          message="Are you sure you want to delete this post?"
        />
      )}
    </div>
  );
};

export default MapView;

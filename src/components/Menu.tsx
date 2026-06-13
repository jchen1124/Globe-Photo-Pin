import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Menu.css";

type ThemeMode = "light" | "dark";

type MenuProps = {
  showMyPostsOnly: boolean;
  setShowMyPostsOnly: (value: boolean) => void;
  showBookmarkedOnly: boolean;
  setShowBookmarkedOnly: (value: boolean) => void;
  onUseCurrentLocation?: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
};

const Menu = ({
  showMyPostsOnly,
  setShowMyPostsOnly,
  showBookmarkedOnly,
  setShowBookmarkedOnly,
  onUseCurrentLocation,
  themeMode,
  onToggleTheme,
}: MenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const fullName = user?.user_metadata.full_name || "Guest";
  const firstName = fullName.split(" ")[0];
  const themeOption = (
    <button
      type="button"
      className={`menu-option ${themeMode === "dark" ? "menu-option-active" : ""}`}
      onClick={onToggleTheme}
      role="menuitem"
    >
      <span className="menu-option-icon">
        {themeMode === "dark" ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </span>
      <span className="menu-option-copy">
        <strong>{themeMode === "dark" ? "Light mode" : "Dark mode"}</strong>
        <small>
          Switch to the {themeMode === "dark" ? "light" : "dark"} map theme
        </small>
      </span>
      <span className="menu-option-status">
        {themeMode === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );

  return (
    <div className="menu-container">
      <div className="menu-identity">
        <span className="menu-identity-label">
          {user ? "Your map" : "Exploring as"}
        </span>
        <span className="welcome-text">{firstName}</span>
      </div>
      <button
        type="button"
        className="menu-trigger"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
      </button>

      {open && user && (
        <div className="menu-popover" role="menu">
          <div className="menu-popover-header">
            <span>Map controls</span>
            <p>Choose what you want to explore.</p>
          </div>

          <div className="menu-options">
            {onUseCurrentLocation && (
              <button
                type="button"
                className="menu-option"
                onClick={() => {
                  onUseCurrentLocation();
                  setOpen(false);
                }}
                role="menuitem"
              >
                <span className="menu-option-icon">
                  <MyLocationOutlinedIcon fontSize="small" />
                </span>
                <span className="menu-option-copy">
                  <strong>Use my location</strong>
                  <small>Move the map to where you are</small>
                </span>
              </button>
            )}

            <button
              type="button"
              className={`menu-option ${showMyPostsOnly ? "menu-option-active" : ""}`}
              onClick={() => {
                setShowMyPostsOnly(!showMyPostsOnly);
                setOpen(false);
              }}
              role="menuitem"
            >
              <span className="menu-option-icon">
                <PhotoLibraryOutlinedIcon fontSize="small" />
              </span>
              <span className="menu-option-copy">
                <strong>
                  {showMyPostsOnly ? "Show all posts" : "My posts"}
                </strong>
                <small>
                  {showMyPostsOnly
                    ? "Return to the community map"
                    : "Only show places you shared"}
                </small>
              </span>
              {showMyPostsOnly && <span className="menu-option-status">On</span>}
            </button>

            <button
              type="button"
              className={`menu-option ${showBookmarkedOnly ? "menu-option-active" : ""}`}
              onClick={() => {
                setShowBookmarkedOnly(!showBookmarkedOnly);
                setOpen(false);
              }}
              role="menuitem"
            >
              <span className="menu-option-icon">
                <BookmarkBorderOutlinedIcon fontSize="small" />
              </span>
              <span className="menu-option-copy">
                <strong>Saved posts</strong>
                <small>Open your bookmarked places</small>
              </span>
              {showBookmarkedOnly && (
                <span className="menu-option-status">Open</span>
              )}
            </button>

            {themeOption}
          </div>
        </div>
      )}

      {open && !user && (
        <div className="menu-popover menu-popover-guest" role="menu">
          <div className="menu-popover-header">
            <span>Save your journey</span>
            <p>Sign in to publish, bookmark, and revisit places.</p>
          </div>
          <div className="menu-options">
            <button
              type="button"
              className="menu-option menu-option-primary"
              onClick={() => navigate("/")}
              role="menuitem"
            >
              <span className="menu-option-icon">
                <LoginOutlinedIcon fontSize="small" />
              </span>
              <span className="menu-option-copy">
                <strong>Sign in</strong>
                <small>Continue with your account</small>
              </span>
            </button>
            {themeOption}
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;

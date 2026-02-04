import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Menu.css";

type MenuProps = {
  showMyPostsOnly: boolean;
  setShowMyPostsOnly: (value: boolean) => void;
  onUseCurrentLocation?: () => void;
};

const Menu = ({ showMyPostsOnly, setShowMyPostsOnly, onUseCurrentLocation }: MenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const fullName = user?.user_metadata.full_name || "Guest";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="menu-container">
      <span className="welcome-text">Welcome, {firstName}</span>
      <MenuIcon
        style={{ cursor: "pointer", fontSize: 25 }}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="menu-popover">
          {onUseCurrentLocation && (
            <button
              className="toggle-myposts-btn"
              onClick={() => {
                onUseCurrentLocation();
                setOpen(false);
              }}
            >
              Use My Location
            </button>
          )}
          <button
            className="toggle-myposts-btn"
            onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}
          >
            {showMyPostsOnly ? "Show All Posts" : "Show My Posts"}
          </button>
          {!user && (
            <button className="login-btn-menu" onClick={() => navigate("/")}>Login</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;

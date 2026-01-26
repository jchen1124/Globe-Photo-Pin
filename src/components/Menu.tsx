import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";
import "../styles/Menu.css";

const Menu = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const fullName = user?.user_metadata.full_name || "Guest";
  const firstName = fullName.split(" ")[0];

  return (
    <div
      className="menu-container"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <span className="welcome-text">
        Welcome, {firstName}
      </span>
      <MenuIcon
        style={{ cursor: "pointer", fontSize: 32 }}
        onClick={() => setOpen(!open)}
      />
    </div>
  );
};

export default Menu;

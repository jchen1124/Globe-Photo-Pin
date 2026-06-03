import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.jpg";

const HomePage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleExploreClick = () => {
    if (user) {
      navigate("/map");
    } else {
      signInWithGoogle();
    }
  };

  return (
    <main className="landing-container">
      <nav className="landing-nav">
        <div className="landing-brand">
          <img src={logo} alt="" />
          <span>GeoGallery</span>
        </div>

        {!user && (
          <button className="continue-guest" onClick={() => navigate("/map")}>
            Explore as Guest
          </button>
        )}
      </nav>

      <section className="landing-shell">
        <div className="landing-content">
          <p className="landing-kicker">Photo memories, mapped by place</p>
          <h1 className="landing-title">GeoGallery</h1>

          <p className="landing-subtitle">
            Build a personal travel map from the photos and places you want to
            remember.
          </p>

          <p className="landing-description">
            Upload a photo, pin it to the world, and revisit your saved moments
            through an interactive map designed around places, not folders.
          </p>

          <div className="landing-actions">
            <button className="explore-button" onClick={handleExploreClick}>
              {user ? "Open Map" : "Sign in with Google"}
            </button>

            {!user && (
              <button
                className="guest-link"
                onClick={() => navigate("/map")}
                type="button"
              >
                Preview the map
              </button>
            )}
          </div>
        </div>

      </section>
    </main>
  );
};

export default HomePage;

import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  return (
    <div className="landing-container">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: "#0a0e27",
          },
          particles: {
            color: { value: ["#ffffff", "#8a2be2", "#4169e1"] },
            links: {
              color: "#8a2be2",
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              outModes: {
                default: "out",
              },
            },
            number: {
              value: 100,
              density: {
                enable: true,
                area: 800,
              },
            },
            opacity: {
              value: { min: 0.3, max: 0.8 },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 4 },
            },
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: ["grab", "bubble"],
              },
            },
            modes: {
              grab: {
                distance: 200,
                links: {
                  opacity: 1,
                  color: "#ffffff",
                  width: 2,
                },
              },
              bubble: {
                distance: 200,
                size: 8,
                duration: 0.4,
                opacity: 1,
              },
            },
          },
        }}
      />

      <div className="landing-content">
        <h1 className="landing-title">Globe Pin 📍</h1>

        <p className="landing-subtitle">Share Your World, One Pin at a Time</p>

        <p className="landing-description">
          Upload photos, mark locations, and create your personal map of
          memories
        </p>

        <button className="explore-button" onClick={() => navigate("/map")}>
          Explore Map
        </button>
      </div>
    </div>
  );
};

export default HomePage;

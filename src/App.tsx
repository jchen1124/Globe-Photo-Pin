import MapView from "./components/MapView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import "./styles/Global.css";

function App() {
  // return (
  //   <div style={{ width: "100%", height: "100%" }}>
  //     <MapView />
  //   </div>
  // );

  return(
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </Router>
  )
}

export default App;

import MapView from "./components/MapView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./styles/Global.css";

const theme = createTheme();

function App() {
  // return (
  //   <div style={{ width: "100%", height: "100%" }}>
  //     <MapView />
  //   </div>
  // );

  return(
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App;

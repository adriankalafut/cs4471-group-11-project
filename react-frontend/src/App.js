import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeComponent from "./Landing/HomeComponent";
import LoginComponent from "./Auth/LoginComponent";
import NavbarComponent from "./NavBarComponent";
import DummyComponent from "./Dummy/DummyComponent";
import VisualizationComponent from "./Visualization/VisualizationComponent";
function App() {
  return (
    <Router >
      <NavbarComponent />
      <div>
        <Routes>
          <Route exact path="/login" element={<LoginComponent />} />
          <Route exact path="/visualization" element={<VisualizationComponent />} />
          <Route exact path="/" element={<HomeComponent />} />
          <Route exact path="/dummy" element={<DummyComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

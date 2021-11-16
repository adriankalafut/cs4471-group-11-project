import React from "react";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import HomeComponent from "./components/Landing/HomeComponent";
import LoginComponent from "./components/Auth/LoginComponent";
import NavbarComponent from "./components/NavBarComponent";
import VisualizationComponent from "./components/Visualization/VisualizationComponent";
import SearchAndBrowseComponent from './components/Search_and_Browse/SearchAndBrowseComponent'
import GetAuthTokenComponent from "./Dummy/GetAuthTokenComponent";

function Visualization() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  let { symbol } = useParams();

  return (
      <VisualizationComponent symbol={symbol} />
  );
}
function App() {
  return (
    <Router >
      <NavbarComponent />
      <div>
        <Routes>
          <Route exact path="/login" element={<LoginComponent />} />
          <Route path="/visualization/:symbol" element={<Visualization />} />
          <Route exact path="/search_and_browse" element={<SearchAndBrowseComponent />} />
          <Route exact path="/" element={<HomeComponent />} />
          <Route exact path="/dummy-auth" element={<GetAuthTokenComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

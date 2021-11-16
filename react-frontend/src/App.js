import React from "react";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import HomeComponent from "./Landing/HomeComponent";
import LoginComponent from "./Auth/LoginComponent";
import NavbarComponent from "./NavBarComponent";
import DummyComponent from "./Dummy/DummyComponent";
import VisualizationComponent from "./Visualization/VisualizationComponent";
import GetAuthTokenComponent from "./Dummy/GetAuthTokenComponent";
import SearchAndBrowseComponent from './Search_and_Browse/SearchAndBrowseComponent'

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
          <Route exact path="/dummy" element={<DummyComponent />} />
          <Route exact path="/dummy-auth" element={<GetAuthTokenComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

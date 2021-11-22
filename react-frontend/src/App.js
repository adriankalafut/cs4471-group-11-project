import React from "react";
import Amplify from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import HomeComponent from "./components/Landing/HomeComponent";
import LoginComponent from "./components/Auth/LoginComponent";
import NavbarComponent from "./components/NavBarComponent";
import ServiceBrowser from "./components/ServiceBrowser/ServiceBrowser";
import VisualizationComponent from "./components/Visualization/VisualizationComponent";
import SearchAndBrowseComponent from './components/Search_and_Browse/SearchAndBrowseComponent'
import GetAuthTokenComponent from "./Dummy/GetAuthTokenComponent";

// Apply plugin with configuration
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: 'ca-central-1',
  aws_pubsub_endpoint: 'wss://a3p8onx8y9a7q1-ats.iot.ca-central-1.amazonaws.com/mqtt',
}));

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
          <Route exact path="/service_browser" element={<ServiceBrowser />} />
          <Route exact path="/login" element={<LoginComponent />} />
          <Route path="/visualization/:symbol" element={<Visualization />} />
          <Route exact path="/visualization" element={<VisualizationComponent />}/>
          <Route exact path="/search_and_browse" element={<SearchAndBrowseComponent />} />
          <Route exact path="/" element={<HomeComponent />} />
          <Route exact path="/dummy-auth" element={<GetAuthTokenComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

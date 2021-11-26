import React, { useState, useEffect } from "react";
import styled from "styled-components";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ServiceRow from './ServiceRow';
import { Hub, Auth } from "aws-amplify";
import get_active_services from "../../api/get-active-services/get-active-services"
import get_subscribed_services from "../../api/get-subscribed-services/get-subscribed-services"
import resolveActiveServices from "../../helper/resolveActiveServices";
import resolveSubscribedServices from "../../helper/resolveSubscribedServices";

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centering y-axis */
  align-items :center;
`;


export default function ServiceBrowser() {

  // First get the username of the user in the ServiceBrowser
  let [user, setUser] = useState(null);
  let [activeServices, setActiveServices] = useState(undefined);
  let [subscribedServices, setSubscribedServices] = useState(undefined);
  useEffect(() => {
      let authUser = async () => {
        try {
          const user = await Auth.currentAuthenticatedUser();
          username = user["username"];
          setUser(user);
        } catch {
            setUser(null);
        }
      };
      let getActiveServices = async () => {
        try {

          //  Get the active services
          let services = await get_active_services();
          services = resolveActiveServices(services);

          // Get the services that the user is subscribed to
          let userSubscribedServices = null;
          if(username != null){
            userSubscribedServices = await get_subscribed_services(username);
            userSubscribedServices = resolveSubscribedServices(userSubscribedServices);
          }
          setActiveServices(services);
          setSubscribedServices(userSubscribedServices);
        } catch (e) {
          setActiveServices(null);
          setSubscribedServices(null);
        }
      };
      getActiveServices();
      Hub.listen("auth", authUser); // listen for login/signup events
      authUser(); // check manually the first time because we won't get a Hub event
      return () => Hub.remove("auth", authUser); // cleanup
    }, []);

  // Store the username
  let username = null;
  if(user != null){
    username = user["username"];
  }

  return(
    <CenteredDiv>
      <h1>{username}'s Subscription Dashboard</h1>
      <ServiceRow username={username} activeServices={activeServices} subscribedServices={subscribedServices}>

      </ServiceRow>
    </CenteredDiv>
  );
}

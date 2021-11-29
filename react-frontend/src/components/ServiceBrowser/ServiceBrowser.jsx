import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Hub, Auth } from "aws-amplify";
import get_active_services from "../../api/get-active-services/get-active-services"
import get_subscribed_services from "../../api/get-subscribed-services/get-subscribed-services"
import resolveActiveServices from "../../helper/resolveActiveServices";
import resolveSubscribedServices from "../../helper/resolveSubscribedServices";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centering y-axis */
  align-items :center;
`;

const style = {
  width: '100%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  elevation: 2000,
  padding: 4,

};

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
  let subscriptionItems=[];
  // Iterate through Active and Subscribed services to present correctly formatted
  // switches
  for(var key in subscribedServices){
    // If the service is active
    if(activeServices[key]){

      // If the user is subscribed to the service then flip switch
      subscriptionItems.push(<ListItem button>
        <ListItemText key={key + "_ListItemText"} primary={key} />
        <FormGroup>
          <FormControlLabel key={key + "_Switch"}  control={<Switch onChange={(event, status) => {subscribedServices[key] = status; console.log(status)}} checked={subscribedServices[key]} />} label="Subscribe" />
        </FormGroup>
      </ListItem>
      )

      // // Otherwise, unflip switch
      // else{
      //   subscriptionItems.push(<ListItem button>
      //     <ListItemText key={key + "_ListItemText"} primary={key} />
      //     <FormGroup>
      //       <FormControlLabel key={key + "_Switch"} control={<Switch default />} label="Subscribe" />
      //     </FormGroup>
      //   </ListItem>
      //   )
      // }
    }
  }

  return(
    <CenteredDiv>
      <h1>{username}'s Subscription Dashboard</h1>
      <List sx={style} component="nav">
        {subscriptionItems}
      </List>
      <Box sx={{ '& button': { m: 1 } }}>
        <div>
          <Button variant="contained" size="large">Update Subscriptions</Button>
        </div>
     </Box>
    </CenteredDiv>
  );
}

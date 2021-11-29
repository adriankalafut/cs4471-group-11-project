import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Hub, Auth } from "aws-amplify";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import get_active_services from "../../api/get-active-services/get-active-services"
import get_subscribed_services from "../../api/get-subscribed-services/get-subscribed-services"
import resolveActiveServices from "../../helper/resolveActiveServices";
import resolveSubscribedServices from "../../helper/resolveSubscribedServices";
import service_subscribe from "../../api/service-subscribe/service_subscribe";
import service_unsubscribe from "../../api/service-subscribe/service_unsubscribe";

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
  let [username, setUsername] = useState("");
  let [activeServices, setActiveServices] = useState(undefined);
  let [subscribedServices, setSubscribedServices] = useState(undefined);
  let [originalServices, setOriginalServices] = useState(undefined);
  let [updateResponse, setUpdateResponse] = useState("");

  const onClickSubUnSub = (service) => {
    const currentServices = { ...subscribedServices };
    currentServices[service] = !currentServices[service];
    setSubscribedServices(currentServices);
  }

  const prepareForPrefsUpdate = async () => {
    // Compare New Prefs to Old
    const responseArray = []

    if (originalServices['live_visualization_service'] !== subscribedServices['live_visualization_service']){
      if (subscribedServices['live_visualization_service']){
        responseArray.push(await service_subscribe(username, "live_visualization_service"));
      }else{
        responseArray.push(await service_unsubscribe(username, "live_visualization_service"));
      }
    }

    if (originalServices['search_and_browse_service'] !== subscribedServices['search_and_browse_service']){
      if (subscribedServices['search_and_browse_service']){
        responseArray.push(await service_subscribe(username, "search_and_browse_service"));
      }else{
        responseArray.push(await service_unsubscribe(username, "search_and_browse_service"));
      }
    }

    if (originalServices['login_service'] !== subscribedServices['login_service']){
      if (subscribedServices['login_service']){
        responseArray.push(await service_subscribe(username, "login_service"));
      }else{
        responseArray.push(await service_unsubscribe(username, "login_service"));
      }
    }

    if (originalServices['notification_service'] !== subscribedServices['notification_service']){
      if (subscribedServices['notification_service']){
        responseArray.push(await service_subscribe(username, "notification_service"));
      }else{
        responseArray.push(await service_unsubscribe(username, "notification_service"));
      }
    }
    responseArray.forEach(entry => {
      if (entry !== '{"Status":"True"}'){
        setUpdateResponse("Error!");
      }
    });
    setUpdateResponse("Updated !");
    setOriginalServices(subscribedServices);
  }

  useEffect(() => {
    let authUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUsername(user["username"]);
      } catch {
        setUsername("");
      }
    };
    let getActiveServices = async () => {
      try {
        //  Get the active services
        let services = await get_active_services();
        services = resolveActiveServices(services);

        // Get the services that the user is subscribed to
        let userSubscribedServices = null;
        if (username != null) {
          userSubscribedServices = await get_subscribed_services(username);
          userSubscribedServices = resolveSubscribedServices(userSubscribedServices);
        }
        setActiveServices(services);
        setSubscribedServices(userSubscribedServices);
        setOriginalServices(userSubscribedServices);
      } catch (e) {
        setActiveServices(null);
        setSubscribedServices(null);
        setOriginalServices(null);
      }
    };
    getActiveServices();
    Hub.listen("auth", authUser); // listen for login/signup events
    authUser(); // check manually the first time because we won't get a Hub event
    return () => Hub.remove("auth", authUser); // cleanup
  }, [username]);

  return (
    <CenteredDiv>
      <h1>{username}'s Subscription Dashboard</h1>
      <List sx={style} component="nav">
        {activeServices && subscribedServices !== undefined && activeServices["live_visualization_service"] && (
          <ListItem button>
            <ListItemText key={"Live_Visualization_Service_ListItemText"} primary={"Live Visualization Service"} />
            <FormGroup>
              <FormControlLabel key={"Live_Visualization_Service_Switch"} control={<Switch onChange={(event, status) => onClickSubUnSub("live_visualization_service")} checked={subscribedServices["live_visualization_service"]} />} label="Subscribe" />
            </FormGroup>
          </ListItem>
        )}
        {activeServices && subscribedServices !== undefined && activeServices["search_and_browse_service"] && (
          <ListItem button>
            <ListItemText key={"search_and_browse_service_ListItemText"} primary="Search & Browse Service" />
            <FormGroup>
              <FormControlLabel key={"search_and_browse_service_Switch"} control={<Switch onChange={(event, status) => onClickSubUnSub("search_and_browse_service")} checked={subscribedServices["search_and_browse_service"]} />} label="Subscribe" />
            </FormGroup>
          </ListItem>
        )}
        {activeServices && subscribedServices !== undefined  && activeServices["login_service"] && (
          <ListItem button>
            <ListItemText key={"login_service_ListItemText"} primary="User Preferences Service" />
            <FormGroup>
              <FormControlLabel key={"login_service_Switch"} control={<Switch onChange={(event, status) => onClickSubUnSub("login_service")} checked={subscribedServices["login_service"]} />} label="Subscribe" />
            </FormGroup>
          </ListItem>
        )}
        {activeServices && subscribedServices !== undefined && activeServices["notification_service"] && (
          <ListItem button>
            <ListItemText key={"notification_service_ListItemText"} primary="Notification Service" />
            <FormGroup>
              <FormControlLabel key={"notification_service_Switch"} control={<Switch onChange={(event, status) => onClickSubUnSub("notification_service")} checked={subscribedServices["notification_service"]} />} label="Subscribe" />
            </FormGroup>
          </ListItem>
        )}
      </List>
      <Box sx={{ '& button': { m: 1 } }}>
        <div>
          <Button variant="contained" size="large" onClick={() => prepareForPrefsUpdate()} >Update Subscriptions</Button>
        </div>
        <p>{updateResponse}</p>
      </Box>
    </CenteredDiv>
  );
}

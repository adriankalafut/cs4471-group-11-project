import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const style = {
  width: '100%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  elevation: 2000,
  padding: 4,
  elevation: 4,

};


export default function ServiceRow(props) {
  // Get the username, activeServices, and subscribedServices passed via props
  let username = props.username;
  let activeServices = props.activeServices;
  let subscribedServices = props.subscribedServices;

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
          <FormControlLabel key={key + "_Switch"}  control={<Switch onChange={(event, status) => {subscribedServices[key] = !status; console.log(status)}} checked={subscribedServices[key]} />} label="Subscribe" />
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
  return (
    <React.Fragment>
      <List sx={style} component="nav">
        {subscriptionItems}
      </List>
      <Box sx={{ '& button': { m: 1 } }}>
        <div>
          <Button variant="contained" size="large">Update Subscriptions</Button>
        </div>
     </Box>
   </React.Fragment>
  );
}

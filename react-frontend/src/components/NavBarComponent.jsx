import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Avatar,
} from "@mui/material/";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Hub, Auth } from "aws-amplify";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import get_active_services from "../api/get-active-services/get-active-services"
import get_subscribed_services from "../api/get-subscribed-services/get-subscribed-services"
import resolveActiveServices from "../helper/resolveActiveServices";
import resolveSubscribedServices from "../helper/resolveSubscribedServices";
import availableAndSubscribedServicesIntersection from "../helper/availableAndSubscribedServicesIntersection";

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: white;
  padding-left: 2%;
  padding-right: 2%;
`;
let username = null;
export default function NavbarComponent() {
  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");

  let [user, setUser] = useState(null);
  let [activeServices, setActiveServices] = useState({
    'live_visualization_service': false,
    'search_and_browse_service': false,
    'login_service': false,
    'notification_service': false,
  });

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
        let services = await get_active_services();
        services = resolveActiveServices(services);

        // get the services that the user is subscribed to
        let userSubscribedServices = null;
        if(username != null){
          userSubscribedServices = await get_subscribed_services(username);
          userSubscribedServices = resolveSubscribedServices(userSubscribedServices);
        }
        if(userSubscribedServices !=  null && services != null){
          services = availableAndSubscribedServicesIntersection(services,userSubscribedServices);
        }
        // Perform  the intersection here
        // Intersect services with subscribed services
        setActiveServices(services);
      } catch (e) {
        setActiveServices(null);
      }
    };
    getActiveServices();
    Hub.listen("auth", authUser); // listen for login/signup events
    authUser(); // check manually the first time because we won't get a Hub event
    return () => Hub.remove("auth", authUser); // cleanup
  }, []);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const SignOut = async () => {
    try {
      await Auth.signOut();
      handleMenuClose();
      goToHomePage();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={async () => await SignOut()}>Sign Out</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <StyledNavLink to="/">
            <Typography
              variant="h6"
              noWrap
              component="div"
              color="white"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              CS4471 - Crypto Tracker
            </Typography>
          </StyledNavLink>

          <Box sx={{ flexGrow: 1 }} />
          {user !== null && (
            <>
              <StyledNavLink to="/service_browser">Service Browser</StyledNavLink>
              {activeServices && activeServices['search_and_browse_service'] && (<StyledNavLink to="/search_and_browse">Search and Browse</StyledNavLink>)}
              {activeServices && activeServices['live_visualization_service'] && (<StyledNavLink to="/visualization">Visualization</StyledNavLink>)}
              {activeServices && activeServices['notification_service'] && (<StyledNavLink to="/notification">Notification</StyledNavLink>)}

              <StyledNavLink to="/dummy-auth">Auth Token</StyledNavLink>
            </>
          )}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {user === null ? (
              <NavLink
                style={{ textDecoration: "none", color: "white" }}
                to="/login"
              >
                Login
              </NavLink>
            ) : (
              <>
                <IconButton size="large" style={{ color: "white" }}>
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar>{user.username.substring(0, 1).toUpperCase()}</Avatar>
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
}

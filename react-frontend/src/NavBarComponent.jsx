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

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: white;
  padding-left: 2%;
  padding-right: 2%;
`;

export default function NavbarComponent() {
  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");

  let [user, setUser] = useState(null);
  useEffect(() => {
    let updateUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser();
        setUser(user);
        console.log(user);
      } catch {
        setUser(null);
      }
    };
    Hub.listen("auth", updateUser); // listen for login/signup events
    updateUser(); // check manually the first time because we won't get a Hub event
    return () => Hub.remove("auth", updateUser); // cleanup
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
      <AppBar position="static" style={{backgroundColor: '#1976d2'}}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            color="white"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            CS4471 - Crypto Tracker
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          {user !== null && (
            <>
              <StyledNavLink to="/search_and_browse">Search and Browse</StyledNavLink>
              <StyledNavLink to="/visualization">Visualization</StyledNavLink>
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

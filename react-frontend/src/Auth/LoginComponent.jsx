import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Amplify from "aws-amplify";
import { Hub, Auth } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "../aws-exports";
Amplify.configure(awsconfig);

function LoginComponent() {
  let [user, setUser] = useState(null);
  useEffect(() => {
    let updateUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser();
        setUser(user);
      } catch {
        setUser(null);
      }
    };
    Hub.listen("auth", updateUser); // listen for login/signup events
    updateUser(); // check manually the first time because we won't get a Hub event
    return () => Hub.remove("auth", updateUser); // cleanup
  }, []);

  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");
  return <>{user === undefined ? <></> : goToHomePage()}</>;
}

export default withAuthenticator(LoginComponent);

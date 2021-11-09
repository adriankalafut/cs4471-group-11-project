import Auth from "@aws-amplify/auth";

export default async function getAccessTokenIfUserSession() {
  // If the user does not have a session, it will throw an error
  const data = await Auth.currentSession();
  return data.accessToken.jwtToken;
}

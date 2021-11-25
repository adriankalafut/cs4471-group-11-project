import getAccessTokenIfUserSession from "../../helper/getAWSCreds";
import { GET_SUBSCRIBED_SERVICES} from "../../constants/constants";

export default async function get_subscribed_services(username) {
  const accessToken = await getAccessTokenIfUserSession();
  if (accessToken !== undefined) {
    const response = await fetch(GET_SUBSCRIBED_SERVICES + "?user="+username, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Credentials": true,
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });
    // Note: In most of our backend requests, we would instead use response.json()  !
    const data = await response.json();
    return data;
  }
}
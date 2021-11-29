import getAccessTokenIfUserSession from "../../helper/getAWSCreds";
import { SUBSCRIBE_SERVICE } from "../../constants/constants";

export default async function service_subscribe(user, service) {
  const accessToken = await getAccessTokenIfUserSession();
  if (accessToken !== undefined) {
    const response = await fetch(`${SUBSCRIBE_SERVICE}?user=${user}&service=${service}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Credentials": true,
        "Cache-Control": "no-cache",
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });
    // Note: In most of our backend requests, we would instead use response.json()  !
    const data = await response.json();
    return data;
  }
}

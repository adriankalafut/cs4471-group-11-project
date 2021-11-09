import getAccessTokenIfUserSession from "../../helper/getAWSCreds";
import { DUMMY_ROUTE } from "../../constants/constants";

export default async function example_dummy_route() {
  const accessToken = await getAccessTokenIfUserSession();
  if (accessToken !== undefined) {
    const response = await fetch(DUMMY_ROUTE, {
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
    const data = await response.text();
    return data;
  }
}

import getAccessTokenIfUserSession from "../../helper/getAWSCreds";
import { SEARCH_AND_BROWSE_ALL_COINS } from "../../constants/constants";

export default async function search_and_browse_get_all_coins() {
  const accessToken = await getAccessTokenIfUserSession();
  if (accessToken !== undefined) {
    const response = await fetch(SEARCH_AND_BROWSE_ALL_COINS, {
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

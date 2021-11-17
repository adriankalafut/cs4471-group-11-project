import getAccessTokenIfUserSession from "../../helper/getAWSCreds";
import { SEARCH_AND_BROWSE_SPECIFIC_COINS } from "../../constants/constants";

export default async function search_and_browse_get_specific_coin(symbol) {
  const accessToken = await getAccessTokenIfUserSession();
  if (accessToken !== undefined) {
    const response = await fetch(`${SEARCH_AND_BROWSE_SPECIFIC_COINS}?symbol=${symbol}`, {
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

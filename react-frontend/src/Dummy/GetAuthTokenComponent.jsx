import { Button } from "@mui/material";
import React, { useState } from "react";
import getAccessTokenIfUserSession from "../helper/getAWSCreds";
import styled from "styled-components";

const CenteredDiv = styled.div`
  text-align: center;
  vertical-align: middle;
`;

export default function GetAuthTokenComponent() {
  let [dummyRequest, setDummyRequest] = useState(null);
  const dummyRequestFetch = async () => {
    const tempDummyRequest = await getAccessTokenIfUserSession();
    setDummyRequest(tempDummyRequest);
  };

  return (
    <CenteredDiv>
      <p>GetAuthToken</p>
      <Button onClick={async () => await dummyRequestFetch()}>
        Get Auth Token
      </Button>
      <p style={{overflowWrap: 'anywhere', padding: '25%'}}>{dummyRequest}</p>
    </CenteredDiv>
  );
}

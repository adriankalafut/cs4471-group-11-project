import { Button } from "@mui/material";
import React, { useState } from "react";
import example_dummy_route from "../api/dummy-route/example-dummy-route";
import styled from "styled-components";

const CenteredDiv = styled.div`
  text-align: center;
  vertical-align: middle;
`;

export default function DummyComponent() {
  let [dummyRequest, setDummyRequest] = useState(null);
  const dummyRequestFetch = async () => {
    const tempDummyRequest = await example_dummy_route();
    setDummyRequest(tempDummyRequest);
  };

  return (
    <CenteredDiv>
      <p>Dummy Component</p>
      <Button onClick={async () => await dummyRequestFetch()}>
        Issue Request To Backend
      </Button>
      <span>{dummyRequest}</span>
    </CenteredDiv>
  );
}

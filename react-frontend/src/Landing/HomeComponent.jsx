import React from "react";
import styled from "styled-components";

const CenteredDiv = styled.div`
  text-align: center;
  vertical-align: middle;
`;

export default function HomeComponent() {
  return (
    <CenteredDiv>
      <h1>CS4471 - Stock Tracker Homepage</h1>
      <p>I'll clean this up later</p>
    </CenteredDiv>
  );
}

import React from "react";
import styled from "styled-components";

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centering y-axis */
  align-items :center;
`;

export default function ServiceBrowser({symbol}) {
  return (
    <CenteredDiv>
    <p>ServiceBrowser</p>
    </CenteredDiv>
  );
}

import React from "react";
import styled from "styled-components";
import landing_art from '../static/landing_art_long.png'

const CenteredDiv = styled.div`
  
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centering y-axis */
  align-items :center;
`;

const SizedImage = styled.img`
  width: 100vw;
`
const StyledTitle = styled.h1`
  padding-top: 10vh;
  margin-bottom: 0;
  font-size: 3em;
`

const StyledSubTitle = styled.h1`
  font-style: italic;
`

export default function HomeComponent() {
  return (
    <CenteredDiv>
      <StyledTitle>CS4471 - Cryptocurrency Tracker</StyledTitle>
      <StyledSubTitle>A Cryptocurrency Analysis Tool</StyledSubTitle>
      <p>Jingtian Chen, Teran Bukenberger, Adrian Kalafut, Ashley Shu, Kevin Cox</p>
      <SizedImage src={landing_art} alt="Landing Page Art"/>
    </CenteredDiv>
  );
}

import React, { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import styled from "styled-components";
import search_and_browse_get_specific_coin from "../../api/search-and-browse/search-and-browse-specific-coin"

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centering y-axis */
  align-items :center;
  max-width: '95%'
  padding-top': '10%
`;

export default function VisualizationComponent({symbol}) {
  let [coinData, setCoinData] = useState(null);
  useEffect(() => {
    let fetchCoinData = async () => {
      try {
        const fetchedCoinData = await search_and_browse_get_specific_coin(symbol);
        setCoinData(fetchedCoinData);
      } catch (e){
        console.log(e)
        setCoinData([]);
      }
    };
    fetchCoinData();
  }, [symbol]);

  return (
    <CenteredDiv>
    {coinData === null ? (<CircularProgress />)
    : (
      <p>{JSON.stringify(coinData)}</p>
    )}
    </CenteredDiv>
  );
}

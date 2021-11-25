import React, { useState, useEffect } from "react";
import { PubSub } from "aws-amplify";
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@material-ui/core/Paper'
import styled from "styled-components";
import search_and_browse_get_specific_coin from "../../api/search-and-browse/search-and-browse-specific-coin"

const CenteredPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items :center;
`;

const CenteredPaperVisualization = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items :center;
  padding: 5%;
  margin-top: 5%;
`;

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items :center;
  margin: 1%;
`;

const COIN_IMAGE_URL = "https://www.gemini.com/images/currencies/icons/default/"

export default function VisualizationComponent({symbol}) {
  let [isRootVisualizationURL, setIsRootVisualizationURL] = useState(false);
  let [coinSymbol, setCoinSymbol] = useState(undefined)
  let [coinData, setCoinData] = useState(null);  
  let [imageLoaded, setImageLoaded] = useState(false);
  let [imageError, setImageError] = useState(false);

  useEffect(() => {
    let fetchCoinData = async () => {
      try {
        const fetchedCoinData = await search_and_browse_get_specific_coin(coinSymbol);
        
        // Available Services Pub Sub Setup
        if (fetchedCoinData !== null){
          PubSub.subscribe(`Search_and_Browse_${fetchedCoinData.Symbol}`).subscribe({
            next: service_update_data => {
              const { Single_Coin_Data } = service_update_data.value;
              setCoinData(Single_Coin_Data);
            },
            error: error => console.error(error),
          });
          setCoinData(fetchedCoinData);
        }
        
      } catch (e){
        console.log(e)
        setCoinData([]);
      }
    };
    // Set Default Value to Bitcoin
    if (symbol === undefined){
      setCoinSymbol('BTC');
      setIsRootVisualizationURL(true);
      setCoinData({'Symbol': 'BTC'});
    }else{
      setCoinSymbol(symbol);
      fetchCoinData();
    }
  }, [symbol, coinSymbol]);

  return (
    <CenteredDiv>
    {(coinData === null && !imageLoaded) && (<CircularProgress />)}
    <CenteredPaper>
    {coinData !== null && !isRootVisualizationURL && (<img height="50%" width="50%" src={COIN_IMAGE_URL + coinData.Symbol + ".svg"} alt="Coin logo" hidden={imageError} onError={() => {setImageLoaded(true); setImageError(true)}} onLoad={() => setImageLoaded(true)}></img>)}
    {(coinData !== null && imageLoaded && !isRootVisualizationURL) && (
      <div style={{margin: "10%", textAlign: "center"}}>
        <p>Name - {coinData.Name}</p>
        <p>Symbol - {coinData.Symbol}</p>
        <p>Price - {coinData.Price}</p>
        <p>Market Cap - {coinData.MarketCap}</p>
        <p>Volume - {coinData.Volume}</p>
        <p>Time Last Updated - {coinData.Last_Updated}</p>
      </div>
    )}
    </CenteredPaper>
    {(coinData !== null && (imageLoaded || isRootVisualizationURL)) && (
      <CenteredPaperVisualization>
        {coinData !== null && isRootVisualizationURL && (<img height="50%" width="50%" src={COIN_IMAGE_URL + coinData.Symbol + ".svg"} alt="Coin logo" hidden={imageError} onError={() => {setImageLoaded(true); setImageError(true)}} onLoad={() => setImageLoaded(true)}></img>)}
        <p>Put Visualization Here</p>
      </CenteredPaperVisualization>
    )}
    </CenteredDiv>
  );
}

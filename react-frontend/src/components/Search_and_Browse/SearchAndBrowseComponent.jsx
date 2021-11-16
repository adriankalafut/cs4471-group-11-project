import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MaterialTable from '@material-table/core';
import CircularProgress from '@mui/material/CircularProgress';
import search_and_browse_get_all_coins from "../../api/search-and-browse/search-and-browse-all-coins"

const CenteredTitle = styled.h1`
  text-align: center;
`;

const CenteredDiv = styled.div`
  
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centering y-axis */
  align-items :center;
  width: '60%'
  padding-top': '10%
`;


export default function SearchAndBrowseComponent() {
  let navigate = useNavigate();
  function handleClick(rowData) {
    navigate(`/visualization/${rowData.Symbol}`);
  }

  let [coinData, setCoinData] = useState([]);
  useEffect(() => {
    let fetchCoinData = async () => {
      try {
        const fetchedCoinData = await search_and_browse_get_all_coins();
        setCoinData(fetchedCoinData);
      } catch (e){
        console.log(e)
        setCoinData([]);
      }
    };
    fetchCoinData();
  }, []);

  return (
    <CenteredDiv>
    <CenteredTitle>Search and Browse</CenteredTitle>
    {coinData.length === 0 ? (<CircularProgress />)
    : (
    <MaterialTable
      style={{width: "60%"}}
      columns={[
        { title: "Name", field: "Name" },
        { title: "Symbol", field: "Symbol" },
      ]}
      data={coinData}
      onRowClick={(event, rowData) => handleClick(rowData)}
      title=""
      options={{
        paging:true,
        pageSize: 10,       // make initial page size
        emptyRowsWhenPaging: false,   // To avoid of having empty rows
        pageSizeOptions:[10, ],    // rows selection options
      }}
    />)}
    </CenteredDiv>
  );
}

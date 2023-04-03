import React from "react";
import styled from 'styled-components'

const StyledButton = styled.button`
  height:40px;
  width:80px;
  margin:10px;
  border-radius:10px;
`

const SongCard = ({ title, play, pause }) => {
  return (
    <div style={{border: '3px solid black', margin: '5px', borderRadius: '15px'}}>
      <p>{title}</p>
      <div>
        <StyledButton onClick={play}>Play</StyledButton>
        <StyledButton onClick={pause}>Pause</StyledButton>
      </div>
    </div>
  );
};

export default SongCard;

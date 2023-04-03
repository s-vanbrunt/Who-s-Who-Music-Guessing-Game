import React from "react";
import styled from 'styled-components'

const StyledImage = styled.img`
  width:200px;
  max-width:90%;
`

const StyledP = styled.p`
  width:200px;
  max-width:90%;
`

const ArtistCard = ({ artistPic, artistName, onClick }) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}} onClick={onClick}>
      <StyledImage src={artistPic} alt="Artist Pic" />
      <StyledP>{artistName}</StyledP>
    </div>
  );
};

export default ArtistCard;

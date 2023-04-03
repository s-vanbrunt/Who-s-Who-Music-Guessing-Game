import React, { useEffect, useState } from "react";
import fetchFromSpotify, { request } from "../services/api";
import { Link } from "react-router-dom";

const AUTH_ENDPOINT = "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

const Home = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedSongNumber, setSelectedSongNumber] = useState(null);
  const [selectedArtistNumber, setSelectedArtistNumber] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [token, setToken] = useState("");

  // useEffect hooks for setting and retrieving genre/songs/artists in localStorage
  useEffect(() => {
    const genreNotSelected = selectedGenre === null;
    if (genreNotSelected) {
      const savedGenre = JSON.parse(localStorage.getItem("genre"));
      setSelectedGenre(savedGenre || "");
    }
    localStorage.setItem("genre", JSON.stringify(selectedGenre));
  }, [selectedGenre]);

  useEffect(() => {
    const songNumberNotSelected = selectedSongNumber === null;
    if (songNumberNotSelected) {
      const savedSongs = JSON.parse(localStorage.getItem("songs"));
      setSelectedSongNumber(savedSongs || 1);
    }
    localStorage.setItem("songs", JSON.stringify(selectedSongNumber));
  }, [selectedSongNumber]);

  useEffect(() => {
    const artistNumberNotSelected = selectedArtistNumber === null;
    if (artistNumberNotSelected) {
      const savedArtists = JSON.parse(localStorage.getItem("artists"));
      setSelectedArtistNumber(savedArtists || 2);
    }
    localStorage.setItem("artists", JSON.stringify(selectedArtistNumber));
  }, [selectedArtistNumber]);

  const fetchGenres = async (t) => {
    setConfigLoading(true);
    const response = await fetchFromSpotify({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    });
    setGenres(response.genres);
    setConfigLoading(false);
  };

  // Handle functions for genre, song, and artist
  const handleGenre = (e) => {
    setSelectedGenre(e.target.value);
  };
  const handleSong = (e) => {
    setSelectedSongNumber(e.target.value);
  };
  const handleArtist = (e) => {
    setSelectedArtistNumber(e.target.value);
  };

  useEffect(() => {
    setAuthLoading(true);

    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        setAuthLoading(false);
        setToken(storedToken.value);
        fetchGenres(storedToken.value);
        return;
      }
    }
    console.log("Sending request to AWS endpoint");
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      setAuthLoading(false);
      setToken(newToken.value);
      fetchGenres(newToken.value);
    });
  }, []);

  if (authLoading || configLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '600px', margin: 'auto', maxWidth: '95%', border: '3px solid black', borderRadius: '15px'}}>
      <h1>Ready to play a music guessing game?</h1>
      <h3>Select the options for the game and then click the 'Go!' button</h3>
      <div style={{padding: '20px'}}>
        <label style={{display: 'inline-block', height: '40px', width: '150px'}}>Genre:</label>
        <select style={{height: '40px', width: '150px', textAlign: 'center', borderRadius: '10px'}} value={selectedGenre || ""} onChange={handleGenre}>
          <option value="" />
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>
      <div style={{padding: '20px'}}>
        <label style={{display: 'inline-block', height: '40px', width: '150px'}}>Number of songs:</label>
        <select style={{height: '40px', width: '150px', textAlign: 'center', borderRadius: '10px'}} defaultValue={selectedSongNumber} onChange={handleSong}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
      <div style={{padding: '20px'}}>
        <label style={{display: 'inline-block', height: '40px', width: '150px'}}>Number of artists:</label>
        <select style={{height: '40px', width: '150px', textAlign: 'center', borderRadius: '10px'}} defaultValue={selectedArtistNumber} onChange={handleArtist}>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      <div style={{padding: '20px'}}>
        <Link to={"/game"}>
          <button style={{height: '50px', width: '75px', borderRadius: '15px'}} type="submit" disabled={selectedGenre === null || selectedGenre === ""}>
            Go!
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;

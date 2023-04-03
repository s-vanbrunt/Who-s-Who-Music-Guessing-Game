import React, { useEffect, useState } from "react";
import fetchFromSpotify from "../services/api";
import ArtistsCard from "./ArtistsCard";
import SongCard from "./SongCard";
import { Howl, Howler } from "howler";
import { wrap } from "lodash";
import Modal from "./Modal";

const TOKEN_KEY = "whos-who-access-token";
const GENRE = "genre";
const SONGS = "songs";
const ARTISTS = "artists";

const getShuffledChoices = (arr, count) => {
  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

const Game = () => {
  const [redirectOverride, setRedirectOverride] = useState();
  const [token, setToken] = useState("");
  const [initialSong, setInitialSong] = useState();
  const [songs, setSongs] = useState();
  const [artists, setArtists] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const [config, updateConfig] = useState({
    retrievedGenre: JSON.parse(localStorage.getItem(GENRE)),
    retrievedSongs: Number.parseInt(JSON.parse(localStorage.getItem(SONGS))),
    retrievedArtists: Number.parseInt(JSON.parse(localStorage.getItem(ARTISTS))),
  });

  const closeModal = () => {
    setShowModal(false);
  };

  const handleArtistSelection = (artist, correct) => () => {
    if (correct) {
      setModalContent(`YOU WIN! You chose the right artist, ${artist.name}.`);
    } else {
      setModalContent(`YOU LOSE! The correct artist is ${initialSong.artists[0].name}.`);
    }
    setShowModal(true);
  };

  let randomOffset = Math.floor(Math.random() * 100);

  const playSong = (audio) => (e) => {
    songs.forEach(({ audio }) => audio.pause());
    audio.play();
  };

  const pauseSong = (audio) => (e) => {
    audio.pause();
  };

  const fetchRandomSong = async (genre) => {
    try {
      const response = await fetchFromSpotify({
        token,
        endpoint: "search",
        params: { q: `genre:${genre}`, type: "track", offset: `${randomOffset}`, limit: "50" },
      });

      const randomIndex = Math.floor(Math.random() * response.tracks.items.length);
      const randomSong = response.tracks.items[randomIndex];

      if (!randomSong) {
        throw new Error("No songs found for this genre");
      }

      setInitialSong(randomSong);
      setArtists(null);
      setSongs(null);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArtists = async () => {
    try {
      const [primaryArtist, relatedArtistsResponse] = await Promise.all([
        fetchFromSpotify({
          token,
          endpoint: `artists/${initialSong.artists[0].id}`,
        }),
        fetchFromSpotify({
          token,
          endpoint: `artists/${initialSong.artists[0].id}/related-artists`,
        }),
      ]);

      let selectedArtists = getShuffledChoices(relatedArtistsResponse.artists, config.retrievedArtists - 1);

      if (selectedArtists.length < config.retrievedArtists - 1) {
        throw new Error("Insufficient related artists found");
      }

      selectedArtists = selectedArtists.map((artist) => ({ correct: false, artist }));
      selectedArtists.push({ correct: true, artist: primaryArtist });
      selectedArtists.sort(() => Math.random() - 0.5);

      setArtists(selectedArtists);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSongs = async () => {
    try {
      const songData = await fetchFromSpotify({
        token,
        endpoint: `search`,
        params: {
          q: `artist:${initialSong.artists[0].name}`,
          type: "track",
        },
      });

      const createAudio = (songSource) =>
        new Howl({
          src: songSource,
          html5: true,
          volume: 0.3,
        });

      const shuffledSongChoices = getShuffledChoices(
        songData.tracks.items.filter((song) => song.preview_url !== null),
        config.retrievedSongs
      );

      if (shuffledSongChoices.length < config.retrievedSongs) {
        setInitialSong(undefined);
      } else {
        setSongs(
          shuffledSongChoices.map((song) => ({
            song,
            audio: createAudio(song.preview_url),
          }))
        );
      }
    } catch (error) {
      console.error("Error retrieving songs:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      const storedTokenString = localStorage.getItem(TOKEN_KEY);
      if (storedTokenString) {
        const storedToken = JSON.parse(storedTokenString);
        if (storedToken.expiration > Date.now()) {
          setToken(storedToken.value);
        } else {
          return setRedirectOverride(<Redirect to="/" />);
        }
      } else {
        return setRedirectOverride(<Redirect to="/" />);
      }
    }

    if (token && !initialSong) {
      fetchRandomSong(config.retrievedGenre);
    } else {
      if (token && initialSong && artists === null) {
        fetchArtists();
      }
      if (token && initialSong && songs === null) {
        fetchSongs();
      }
    }
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '800px', margin: 'auto', maxWidth: '95%', border: '3px solid black', borderRadius: '15px'}}>
      <h3>Play the song snippets below, then click on the artist image you think performed them</h3>
      <div style={{display: "flex"}}>
        {Array.isArray(artists) &&
          artists.map(({ artist, correct }, i) => (
            <ArtistsCard key={i} artistPic={artist.images[0].url} artistName={artist.name} onClick={handleArtistSelection(artist, correct)}></ArtistsCard>
          ))}
      </div>
      <div>
        {songs
          ? songs.map(({ song, audio }, i) => <SongCard key={i} title={song.name} play={playSong(audio)} pause={pauseSong(audio)} />)
          : Array(config.retrievedSongs)
              .fill(null)
              .map((_, i) => <SongCard key={i} />)}
      </div>
      <Modal show={showModal} onClose={closeModal}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Game;

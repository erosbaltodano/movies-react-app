import { useState } from "react";
import axios from "axios";
import "./App.scss";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const searchMovies = async () => {
    setLoading(true);
    setError(null);
    setSelectedMovie(null);
    try {
      const res = await axios.get(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
      if (res.data.Response === "True") {
        setMovies(res.data.Search);
      } else {
        setMovies([]);
        setError(res.data.Error);
      }
    } catch {
      setError("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetail = async (imdbID) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}&plot=full`);
      if (res.data.Response === "True") {
        setSelectedMovie(res.data);
      } else {
        setError(res.data.Error);
        setSelectedMovie(null);
      }
    } catch {
      setError("Failed to fetch movie details");
      setSelectedMovie(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="app-container full-screen">
      <aside className="movie-list-container">
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && query.trim() !== "") {
                searchMovies();
              }
            }}
            placeholder="Type a movie name"
          />
          <button onClick={searchMovies} disabled={!query || loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="movies-list-scroll">
          {movies.map(movie => (
            <div
              key={movie.imdbID}
              className={`movie-card list-item ${selectedMovie?.imdbID === movie.imdbID ? "selected" : ""}`}
              onClick={() => fetchMovieDetail(movie.imdbID)}
              title="Click for details"
            >
              <img
                className="movie-poster-small"
                src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/100x150?text=No+Image"}
                alt={movie.Title}
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.Title}</h3>
                <p className="movie-year">({movie.Year})</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="movie-detail-container">
        {loadingDetail && <p>Loading details...</p>}

        {selectedMovie && !loadingDetail && (
          <div className="movie-detail">
            <img
              src={selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}
              alt={selectedMovie.Title}
              className="movie-poster-large"
            />
            <div className="movie-detail-info">
              <h2>
                {selectedMovie.Title} ({selectedMovie.Year}){" "}
                {selectedMovie.imdbRating && selectedMovie.imdbRating !== "N/A" && (
                  <span className="imdb-rating">⭐ {selectedMovie.imdbRating}</span>
                )}
              </h2>
              <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
              <p><strong>Runtime:</strong> {selectedMovie.Runtime}</p>
              <p><strong>Director:</strong> {selectedMovie.Director}</p>
              <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
              <p><strong>Plot:</strong> {selectedMovie.Plot}</p>
              <p><strong>Language:</strong> {selectedMovie.Language}</p>
              <p><strong>IMDB Rating:</strong> {selectedMovie.imdbRating}</p>
              <p><strong>Awards:</strong> {selectedMovie.Awards}</p>
              <p><strong>Released:</strong> {selectedMovie.Released}</p>
            </div>
          </div>
        )}

        {!selectedMovie && !loadingDetail && (
          <p style={{ textAlign: "center", marginTop: "2rem", color: "#aaa" }}>
            Search and select a movie to see details here.
          </p>
        )}
      </main>
    </div>
  );
}

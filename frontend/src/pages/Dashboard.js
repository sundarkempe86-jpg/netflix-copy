import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [heroMovie, setHeroMovie] = useState(null);
  const [categories, setCategories] = useState({});
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeFilter, setActiveFilter] = useState('home');
  const [showHistory, setShowHistory] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadMovies();
    loadHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => searchMovies(), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadMovies = async () => {
    const cats = ['trending', 'action', 'scifi', 'comedy', 'drama'];
    const results = {};
    
    for (const cat of cats) {
      try {
        const res = await axios.get(`${API_URL}/movies/category/${cat}`);
        results[cat] = res.data.Search || [];
      } catch (error) {
        results[cat] = [];
      }
    }
    
    setCategories(results);
    if (results.trending?.[0]) {
      const hero = await axios.get(`${API_URL}/movies/${results.trending[0].imdbID}`);
      setHeroMovie(hero.data);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.Search || []);
    } catch (error) {
      console.error('Failed to load history');
    }
  };

  const searchMovies = async () => {
    try {
      const res = await axios.get(`${API_URL}/movies/search?query=${searchQuery}`);
      setSearchResults(res.data.Search || []);
    } catch (error) {
      setSearchResults([]);
    }
  };

  const handleMovieClick = async (movieId) => {
    try {
      await axios.post(`${API_URL}/user/history`, { movieId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${API_URL}/movies/${movieId}`);
      setSelectedMovie(res.data);
      loadHistory();
    } catch (error) {
      console.error('Failed to add to history');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const filterCategories = (filter) => {
    setActiveFilter(filter);
    setSearchQuery('');
    setSearchResults([]);
    setShowHistory(false);
  };

  const openHistory = () => {
    setShowHistory(true);
    setActiveFilter('history');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-red-600 text-3xl font-bold cursor-pointer" onClick={() => filterCategories('home')}>NETFLIX</h1>
            <div className="flex gap-6 text-sm">
              <button onClick={() => filterCategories('home')} className={`hover:text-gray-300 ${activeFilter === 'home' ? 'font-bold' : ''}`}>Home</button>
              <button onClick={() => filterCategories('trending')} className={`hover:text-gray-300 ${activeFilter === 'trending' ? 'font-bold' : ''}`}>Trending</button>
              <button onClick={() => filterCategories('action')} className={`hover:text-gray-300 ${activeFilter === 'action' ? 'font-bold' : ''}`}>Action</button>
              <button onClick={() => filterCategories('scifi')} className={`hover:text-gray-300 ${activeFilter === 'scifi' ? 'font-bold' : ''}`}>Sci-Fi</button>
              <button onClick={() => filterCategories('comedy')} className={`hover:text-gray-300 ${activeFilter === 'comedy' ? 'font-bold' : ''}`}>Comedy</button>
              <button onClick={() => filterCategories('drama')} className={`hover:text-gray-300 ${activeFilter === 'drama' ? 'font-bold' : ''}`}>Drama</button>
              <button onClick={openHistory} className={`hover:text-gray-300 ${activeFilter === 'history' ? 'font-bold' : ''}`}>My History</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 px-4 py-2 rounded text-white w-64 focus:outline-none focus:border-white"
            />
            <button onClick={logout} className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 font-semibold">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="pt-24 px-8">
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          <div className="grid grid-cols-6 gap-4">
            {searchResults.map(movie => (
              <MovieCard key={movie.imdbID} movie={movie} onClick={handleMovieClick} />
            ))}
          </div>
        </div>
      )}

      {/* History Page */}
      {showHistory && !searchQuery && (
        <div className="pt-24 px-8 pb-16">
          <h1 className="text-4xl font-bold mb-8">My Watch History</h1>
          {history.length > 0 ? (
            <div className="grid grid-cols-6 gap-4">
              {history.map(movie => (
                <MovieCard key={movie.imdbID} movie={movie} onClick={handleMovieClick} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-xl">No watch history yet. Start watching movies!</p>
          )}
        </div>
      )}

      {/* Hero Banner */}
      {!searchQuery && !showHistory && activeFilter === 'home' && heroMovie && (
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={heroMovie.Poster !== 'N/A' ? heroMovie.Poster : 'https://via.placeholder.com/1920x1080'}
              alt={heroMovie.Title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
          <div className="relative pt-64 px-8 max-w-2xl">
            <h1 className="text-6xl font-bold mb-4">{heroMovie.Title}</h1>
            <p className="text-lg mb-6">{heroMovie.Plot}</p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-300">
                ▶ Play
              </button>
              <button onClick={() => handleMovieClick(heroMovie.imdbID)} className="bg-gray-600/80 px-8 py-3 rounded font-bold hover:bg-gray-600">
                More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Category View */}
      {!searchQuery && !showHistory && activeFilter !== 'home' && (
        <div className="pt-24 px-8 pb-16">
          <h1 className="text-4xl font-bold mb-8 capitalize">{activeFilter} Movies</h1>
          <div className="grid grid-cols-6 gap-4">
            {(categories[activeFilter] || []).map(movie => (
              <MovieCard key={movie.imdbID} movie={movie} onClick={handleMovieClick} />
            ))}
          </div>
        </div>
      )}

      {/* Movie Rows - Home View */}
      {!searchQuery && !showHistory && activeFilter === 'home' && (
        <div className="relative -mt-32 z-10 space-y-8 pb-16">
          {history.length > 0 && (
            <MovieRow title="Recently Watched" movies={history} onMovieClick={handleMovieClick} />
          )}
          <MovieRow title="Trending Now" movies={categories.trending || []} onMovieClick={handleMovieClick} />
          <MovieRow title="Action" movies={categories.action || []} onMovieClick={handleMovieClick} />
          <MovieRow title="Sci-Fi" movies={categories.scifi || []} onMovieClick={handleMovieClick} />
          <MovieRow title="Comedy" movies={categories.comedy || []} onMovieClick={handleMovieClick} />
          <MovieRow title="Drama" movies={categories.drama || []} onMovieClick={handleMovieClick} />
        </div>
      )}

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8" onClick={() => setSelectedMovie(null)}>
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMovie(null)} className="float-right text-2xl">&times;</button>
            <h2 className="text-4xl font-bold mb-4">{selectedMovie.Title}</h2>
            <div className="flex gap-8">
              <img src={selectedMovie.Poster} alt={selectedMovie.Title} className="w-64 rounded" />
              <div>
                <p className="mb-4">{selectedMovie.Plot}</p>
                <p><strong>Year:</strong> {selectedMovie.Year}</p>
                <p><strong>Rating:</strong> {selectedMovie.imdbRating}/10</p>
                <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
                <p><strong>Director:</strong> {selectedMovie.Director}</p>
                <p><strong>Cast:</strong> {selectedMovie.Actors}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MovieRow = ({ title, movies, onMovieClick }) => (
  <div className="px-8">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="flex gap-4 overflow-x-scroll scrollbar-hide">
      {movies.map(movie => (
        <MovieCard key={movie.imdbID} movie={movie} onClick={onMovieClick} />
      ))}
    </div>
  </div>
);

const MovieCard = ({ movie, onClick }) => (
  <div
    onClick={() => onClick(movie.imdbID)}
    className="min-w-[200px] cursor-pointer transform hover:scale-110 transition duration-300"
  >
    <img
      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300'}
      alt={movie.Title}
      className="rounded"
    />
  </div>
);

export default Dashboard;

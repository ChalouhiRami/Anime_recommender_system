import { useState, useEffect, useRef } from "react";
import AnimeCard from "./components/AnimeCard";
import AnimeDetailModal from "./components/AnimeDetailModal";
import "./App.css";

const PRESET_QUERIES = [
  { label: "Death Note", icon: "📓", genre: "Psychological" },
  { label: "Attack on Titan", icon: "⚔️", genre: "Dark Fantasy" },
  { label: "Steins;Gate", icon: "⏳", genre: "Sci-Fi / Time" },
  { label: "Cowboy Bebop", icon: "🚀", genre: "Space Noir" },
  { label: "Monster", icon: "🧠", genre: "Thriller" },
  { label: "Jujutsu Kaisen", icon: "🔥", genre: "Supernatural" },
  { label: "Vinland Saga", icon: "🛡️", genre: "Historical" },
  { label: "Cyberpunk: Edgerunners", icon: "⚡", genre: "Cyberpunk" },
];

function App() {
  const [query, setQuery] = useState("Death Note");
  const [activeSearchedTitle, setActiveSearchedTitle] = useState("Death Note");
  const [minScore, setMinScore] = useState(6.5);
  const [limit, setLimit] = useState(8);
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null); // { anime, poster }

  const searchBoxRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial load recommendations on mount
  useEffect(() => {
    fetchRecommendations("Death Note");
  }, []);

  const handleSurpriseMe = () => {
    const randomPreset = PRESET_QUERIES[Math.floor(Math.random() * PRESET_QUERIES.length)];
    setQuery(randomPreset.label);
    fetchRecommendations(randomPreset.label);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
  };

  const fetchSuggestions = async (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/anime/search?title=${encodeURIComponent(text.trim())}`
      );
      if (!response.ok) {
        setSuggestions([]);
        return;
      }
      const data = await response.json();
      setSuggestions(data.slice(0, 6));
    } catch {
      setSuggestions([]);
    }
  };

  const fetchRecommendations = async (titleOverride) => {
    const searchTitle = typeof titleOverride === "string" ? titleOverride : query;
    if (!searchTitle.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setActiveSearchedTitle(searchTitle.trim());

    try {
      const response = await fetch(
        `http://localhost:8080/api/anime/recommend?title=${encodeURIComponent(
          searchTitle.trim()
        )}&limit=${limit}&minScore=${minScore}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`"${searchTitle}" was not found in the vector database. Try another title or check spelling.`);
        }
        throw new Error(`Failed to retrieve recommendations (Status ${response.status}).`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred while communicating with the recommender.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetTitle) => {
    setQuery(presetTitle);
    fetchRecommendations(presetTitle);
  };

  const getScoreTheme = (score) => {
    if (score >= 8.0) return { color: "#34d399", bg: "rgba(16, 185, 129, 0.15)", text: "Masterpiece" };
    if (score >= 7.0) return { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)", text: "Great" };
    return { color: "#818cf8", bg: "rgba(99, 102, 241, 0.15)", text: "Good" };
  };

  const sliderTheme = getScoreTheme(minScore);

  return (
    <>
      {/* ── Background Auroras ─────────────────────────────────── */}
      <div className="bg-ambient" aria-hidden="true">
        <div className="aurora-1" />
        <div className="aurora-2" />
        <div className="aurora-3" />
      </div>

      {/* ── Top Navigation Bar ─────────────────────────────────── */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-wrapper" onClick={() => handlePresetSelect("Death Note")}>
            <div className="brand-icon-box">⛩️</div>
            <div className="brand-title-group">
              <span className="brand-title">OTAKUVECTOR</span>
              <span className="brand-subtitle">AI Neural Recommendation</span>
            </div>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            <span>pgvector + Spring Boot Active</span>
          </div>
        </div>
      </header>

      {/* ── Main Application Content ───────────────────────────── */}
      <main className="main-wrapper">
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-tagline">
            <span>✨</span> Next-Gen Semantic Discovery
          </div>
          <h1 className="hero-heading">
            Find Your Next Anime with <br />
            <span className="hero-gradient-text">Neural Vector Intelligence</span>
          </h1>
          <p className="hero-description">
            Discover shows connected by deep thematic nuance, character dynamics, and psychological tone—far beyond basic tags.
          </p>

          {/* Preset Quick Discovery Chips */}
          <div className="preset-chips-container">
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset.label}
                className="preset-chip"
                onClick={() => handlePresetSelect(preset.label)}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Search & Control Center */}
        <section className="control-hub" ref={searchBoxRef}>
          
          {/* Search Bar Row */}
          <div className="search-input-row">
            <div className="search-input-wrapper">
              <span className="search-icon-prefix">🔍</span>
              <input
                type="text"
                className="search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchRecommendations();
                  }
                }}
                placeholder="Search any anime title (e.g. Steins;Gate, Monster, Jujutsu Kaisen)..."
              />

              {query && (
                <button
                  className="clear-search-btn"
                  onClick={handleClear}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((anime) => (
                    <div
                      key={anime.id}
                      className="suggestion-item"
                      onClick={() => {
                        setQuery(anime.title);
                        setSuggestions([]);
                        fetchRecommendations(anime.title);
                      }}
                    >
                      <div className="suggestion-info">
                        <span className="suggestion-title">{anime.title}</span>
                        {anime.englishTitle && anime.englishTitle !== anime.title && (
                          <span className="suggestion-subtitle">{anime.englishTitle}</span>
                        )}
                      </div>
                      <span className="suggestion-badge">
                        ⭐ {anime.score ? anime.score.toFixed(1) : "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              className="btn-primary"
              onClick={() => fetchRecommendations()}
              disabled={loading || !query.trim()}
            >
              <span>{loading ? "Searching Vectors..." : "Recommend Anime"}</span>
              <span>⚡</span>
            </button>

            <button
              className="btn-surprise"
              onClick={handleSurpriseMe}
              title="Pick a random curated anime"
            >
              <span>🎲 Surprise Me</span>
            </button>
          </div>

          {/* Filter & Controls Bar */}
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="score-range" className="filter-label">
                Minimum MAL Score:
              </label>
              <input
                id="score-range"
                type="range"
                min="5.0"
                max="9.0"
                step="0.1"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="score-slider"
              />
              <span
                className="score-display-chip"
                style={{
                  color: sliderTheme.color,
                  backgroundColor: sliderTheme.bg,
                }}
              >
                ⭐ {minScore.toFixed(1)}+ ({sliderTheme.text})
              </span>
            </div>

            <div className="filter-group">
              <span className="filter-label">Results Count:</span>
              <div className="limit-segmented">
                {[4, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    className={`limit-option ${limit === num ? "active" : ""}`}
                    onClick={() => {
                      setLimit(num);
                      if (activeSearchedTitle) {
                        // Immediately re-trigger with new limit if active search exists
                        setTimeout(() => fetchRecommendations(activeSearchedTitle), 0);
                      }
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <div className="error-banner animate-fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchRecommendations()}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Results Display ─────────────────────────────────── */}
        <section>
          {recommendations.length > 0 && (
            <div className="results-header-bar">
              <div>
                <h2 className="results-heading">
                  Recommendations for <span className="results-query-highlight">"{activeSearchedTitle}"</span>
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                  Showing {recommendations.length} matching anime sorted by pgvector cosine similarity
                </div>
              </div>
              <div className="results-badge-meta">
                <span>🎯 Embeddings: 384-dim all-MiniLM-L6-v2</span>
              </div>
            </div>
          )}

          {/* Skeleton Loaders during network request */}
          {loading && (
            <div className="anime-grid">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img skeleton-shimmer" />
                  <div className="skeleton-content">
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "80%" }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: "12px" }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: "45px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Anime Grid */}
          {!loading && recommendations.length > 0 && (
            <div className="anime-grid">
              {recommendations.map((anime, idx) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  rank={idx}
                  onInspect={(a, p) => setModalData({ anime: a, poster: p })}
                  onSelectSimilar={(title) => {
                    setQuery(title);
                    fetchRecommendations(title);
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && recommendations.length === 0 && !error && (
            <div className="empty-state-card animate-fade-in">
              <span className="empty-state-icon">🌌</span>
              <h3 className="empty-state-title">Ready to Venture into the Multiverse</h3>
              <p className="empty-state-subtitle">
                Search your favorite anime above or pick any of our curated badges to unleash the neural vector similarity engine.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ── Detail Modal ─────────────────────────────────────── */}
      {modalData && (
        <AnimeDetailModal
          anime={modalData.anime}
          poster={modalData.poster}
          onClose={() => setModalData(null)}
          onSelectAnime={(title) => {
            setQuery(title);
            fetchRecommendations(title);
          }}
        />
      )}
    </>
  );
}

export default App;
import { useState, useEffect } from "react";
import { getAnimeMedia } from "../services/imageService";

function AnimeCard({ anime, rank, onInspect, onSelectSimilar }) {
  const [poster, setPoster] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAnimeMedia(anime)
      .then((media) => {
        if (isMounted) {
          if (media?.poster) {
            setPoster(media.poster);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [anime.title, anime.englishTitle]);

  const getScoreTheme = (score) => {
    if (!score) return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.3)" };
    if (score >= 8.0) return { color: "#34d399", bg: "rgba(16, 185, 129, 0.2)", border: "rgba(16, 185, 129, 0.45)" };
    if (score >= 7.0) return { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.2)", border: "rgba(245, 158, 11, 0.45)" };
    return { color: "#818cf8", bg: "rgba(99, 102, 241, 0.2)", border: "rgba(99, 102, 241, 0.45)" };
  };

  const scoreTheme = getScoreTheme(anime.score);
  const genres = anime.genres ? anime.genres.split(",").map((g) => g.trim()) : [];
  const displayGenres = genres.slice(0, 3);
  const extraGenresCount = genres.length - displayGenres.length;

  return (
    <article
      className="anime-card animate-fade-in"
      onClick={() => onInspect && onInspect(anime, poster)}
    >
      {/* ── Poster Visual Container ───────────────────────── */}
      <div className="card-poster-wrapper">
        {loading && (
          <div className="skeleton-shimmer" style={{ position: "absolute", inset: 0 }} />
        )}

        {poster ? (
          <img
            src={poster}
            alt={anime.title}
            className="card-poster-img"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        ) : !loading ? (
          <div className="fallback-poster">
            <span className="fallback-japanese-glyph">名作</span>
            <span className="fallback-icon">🎬</span>
            <span className="fallback-title">{anime.title}</span>
          </div>
        ) : null}

        <div className="card-poster-gradient" />

        {/* Vector Match Rank Tag */}
        {rank !== undefined && (
          <div className="card-rank-chip">
            #{rank + 1} Match
          </div>
        )}

        {/* Score Floating Pill */}
        <div
          className="card-score-chip"
          style={{
            color: scoreTheme.color,
            background: scoreTheme.bg,
            border: `1px solid ${scoreTheme.border}`,
          }}
        >
          <span>⭐</span>
          <span>{anime.score ? anime.score.toFixed(1) : "N/A"}</span>
        </div>
      </div>

      {/* ── Card Content ─────────────────────────────────── */}
      <div className="card-body">
        <h3 className="card-title" title={anime.title}>
          {anime.title}
        </h3>

        {anime.englishTitle && anime.englishTitle !== anime.title && (
          <div className="card-english-title" title={anime.englishTitle}>
            {anime.englishTitle}
          </div>
        )}

        {/* Genre Badges */}
        <div className="card-genres">
          {displayGenres.map((g, idx) => (
            <span key={idx} className="genre-tag">
              {g}
            </span>
          ))}
          {extraGenresCount > 0 && (
            <span className="genre-tag" style={{ opacity: 0.7 }}>
              +{extraGenresCount}
            </span>
          )}
        </div>

        {/* Synopsis Snippet */}
        <p className="card-synopsis">
          {anime.synopsis || "No synopsis recorded for this title."}
        </p>

        {/* Card Footer Actions */}
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="card-inspect-btn"
            onClick={() => onInspect && onInspect(anime, poster)}
          >
            <span>Overview</span>
            <span>→</span>
          </button>

          <button
            className="card-find-similar-btn"
            title="Explore recommendations based on this anime"
            onClick={() => onSelectSimilar && onSelectSimilar(anime.title)}
          >
            ⚡ Similar
          </button>
        </div>
      </div>
    </article>
  );
}

export default AnimeCard;
import React, { useEffect } from "react";

function AnimeDetailModal({ anime, poster, onClose, onSelectAnime }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!anime) return null;

  const score = anime.score ? anime.score.toFixed(1) : "N/A";
  const genres = anime.genres ? anime.genres.split(",").map((g) => g.trim()) : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-content-grid">
          <div>
            {poster ? (
              <img src={poster} alt={anime.title} className="modal-poster" />
            ) : (
              <div className="fallback-poster" style={{ aspectRatio: "3 / 4", borderRadius: "14px" }}>
                <span className="fallback-japanese-glyph">アニメ</span>
                <span className="fallback-icon">🎬</span>
                <span className="fallback-title">{anime.title}</span>
              </div>
            )}
          </div>

          <div className="modal-details">
            <h2 className="modal-title">{anime.title}</h2>
            {anime.englishTitle && anime.englishTitle !== anime.title && (
              <div className="modal-eng-title">{anime.englishTitle}</div>
            )}

            <div className="modal-meta-row">
              <span
                style={{
                  background:
                    anime.score >= 8
                      ? "rgba(16, 185, 129, 0.2)"
                      : anime.score >= 7
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(99, 102, 241, 0.2)",
                  color:
                    anime.score >= 8
                      ? "#34d399"
                      : anime.score >= 7
                      ? "#fbbf24"
                      : "#818cf8",
                  border:
                    anime.score >= 8
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : anime.score >= 7
                      ? "1px solid rgba(245, 158, 11, 0.4)"
                      : "1px solid rgba(99, 102, 241, 0.4)",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ⭐ MAL Score: {score}
              </span>

              <span
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#94a3b8",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                ID #{anime.id}
              </span>
            </div>

            <div className="card-genres" style={{ marginBottom: "20px" }}>
              {genres.map((g, idx) => (
                <span key={idx} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>

            <div className="modal-synopsis-label">Overview / Synopsis</div>
            <p className="modal-synopsis-text">
              {anime.synopsis || "No detailed synopsis available for this anime."}
            </p>

            <button
              className="modal-find-similar-btn"
              onClick={() => {
                onClose();
                onSelectAnime(anime.title);
              }}
            >
              <span>⚡ Find Anime Similar to "{anime.title}"</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeDetailModal;

package com.anime.recommender.repository;

import com.anime.recommender.model.Anime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimeRepository extends JpaRepository<Anime, Long> {

    List<Anime> findByTitleContainingIgnoreCase(String title);

    // Checks both Japanese and English titles (pass the same search term for both parameters)
    Optional<Anime> findByTitleIgnoreCaseOrEnglishTitleIgnoreCase(String title, String englishTitle);

    // Native Vector Similarity Search
    @Query(value = "SELECT id, title, english_title, genres, synopsis, score FROM anime " +
            "WHERE LOWER(title) != LOWER(:title) " +
            "  AND (english_title IS NULL OR LOWER(english_title) != LOWER(:title)) " +
            "ORDER BY embedding <=> ( " +
            "    SELECT embedding FROM anime " +
            "    WHERE LOWER(title) = LOWER(:title) OR LOWER(english_title) = LOWER(:title) " +
            "    LIMIT 1 " +
            ") " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Anime> findSimilarAnime(@Param("title") String title, @Param("limit") int limit);
}
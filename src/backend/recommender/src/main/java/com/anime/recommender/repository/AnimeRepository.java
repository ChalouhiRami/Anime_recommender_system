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

    Optional<Anime> findByTitle(String title);


    @Query(value = "SELECT id, title, genres, synopsis, score FROM anime " +
            "WHERE title != :title " +
            "ORDER BY embedding <=> (SELECT embedding FROM anime WHERE title = :title) " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Anime> findSimilarAnime(@Param("title") String title, @Param("limit") int limit);
}
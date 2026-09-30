package com.anime.recommender.repository;

import com.anime.recommender.model.Anime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimeRepository extends JpaRepository<Anime, Long> {


    List<Anime> findByTitleContainingIgnoreCase(String title);

    Optional<Anime> findByTitle(String title);
}
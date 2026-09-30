package com.anime.recommender.controller;

import com.anime.recommender.model.Anime;
import com.anime.recommender.repository.AnimeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnimeController {


    private final AnimeRepository animeRepository;


    public AnimeController(AnimeRepository animeRepository) {
        this.animeRepository = animeRepository;
    }

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        return Map.of(
                "status", "UP",
                "message", "Anime Recommender Backend is running smoothly!"
        );
    }

    // 3. Our new DB search endpoint: http://localhost:8080/api/anime/search?title=Death
    @GetMapping("/anime/search")
    public List<Anime> searchAnime(@RequestParam String title) {
        return animeRepository.findByTitleContainingIgnoreCase(title);
    }
}
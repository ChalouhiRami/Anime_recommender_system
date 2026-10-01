package com.anime.recommender.controller;

import com.anime.recommender.model.Anime;
import com.anime.recommender.service.AnimeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnimeController {

    // inject the service instead of repository
    private final AnimeService animeService;

    public AnimeController(AnimeService animeService) {
        this.animeService = animeService;
    }

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        return Map.of(
                "status", "UP",
                "message", "Anime Recommender Backend is running smoothly!"
        );
    }


    @GetMapping("/anime/recommend")
    public List<Anime> getRecommendations(
            @RequestParam String title,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "6.5") Double minScore) {

        return animeService.getRecommendations(title, limit, minScore);
    }
}
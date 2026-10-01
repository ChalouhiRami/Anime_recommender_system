package com.anime.recommender.service;

import com.anime.recommender.model.Anime;
import com.anime.recommender.repository.AnimeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AnimeService {

    private final AnimeRepository animeRepository;

    public AnimeService(AnimeRepository animeRepository) {
        this.animeRepository = animeRepository;
    }

    private boolean isFranchise(String queryTitle, String candidateTitle) {
        String q = queryTitle.toLowerCase().trim();
        String c = candidateTitle.toLowerCase().trim();

        if (q.equals(c)) {
            return true;
        }

        if (c.startsWith(q) && (c.length() == q.length() || !Character.isLetterOrDigit(c.charAt(q.length())))) {
            return true;
        }

        return false;
    }

    public List<Anime> getRecommendations(String title, int limit, Double minScore) {
        // 1. USE OPTIONAL: Check if the anime actually exists in our DB first!
        Optional<Anime> sourceAnime = animeRepository.findByTitle(title);

        if (sourceAnime.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Anime '" + title + "' was not found in the database!"
            );
        }

        // 2. If it exists, fetch candidates and run our filters
        List<Anime> rawCandidates = animeRepository.findSimilarAnime(title, 30);
        List<Anime> filtered = new ArrayList<>();

        for (Anime anime : rawCandidates) {
            if (isFranchise(title, anime.getTitle())) {
                continue;
            }

            if (anime.getScore() == null || anime.getScore() < minScore) {
                continue;
            }

            filtered.add(anime);

            if (filtered.size() == limit) {
                break;
            }
        }

        return filtered;
    }
}
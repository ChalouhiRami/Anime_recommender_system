package com.anime.recommender.service;

import com.anime.recommender.model.Anime;
import com.anime.recommender.repository.AnimeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnimeService {

    private final AnimeRepository animeRepository;

    //DI
    public AnimeService(AnimeRepository animeRepository) {
        this.animeRepository = animeRepository;
    }


    private boolean isFranchise(String queryTitle, String candidateTitle) {
        String q = queryTitle.toLowerCase().trim();
        String c = candidateTitle.toLowerCase().trim();

        if (q.equals(c)) {
            return true;
        }

        // Checks if candidate starts with query title followed by space or punctuation
        if (c.startsWith(q) && (c.length() == q.length() || !Character.isLetterOrDigit(c.charAt(q.length())))) {
            return true;
        }

        return false;
    }

    public List<Anime> getRecommendations(String title, int limit, Double minScore) {
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
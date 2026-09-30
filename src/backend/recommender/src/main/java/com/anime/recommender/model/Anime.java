package com.anime.recommender.model;

import jakarta.persistence.*;

@Entity
@Table(name = "anime")
public class Anime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "genres")
    private String genres;

    @Column(name = "synopsis", columnDefinition = "TEXT")
    private String synopsis;

    //scores can be null we use the Double wrapper
    @Column(name = "score")
    private Double score;


    public Anime() {
    }

    public Anime(Long id, String title, String genres, String synopsis, Double score) {
        this.id = id;
        this.title = title;
        this.genres = genres;
        this.synopsis = synopsis;
        this.score = score;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGenres() {
        return genres;
    }

    public void setGenres(String genres) {
        this.genres = genres;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}
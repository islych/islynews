package com.example.NewsAI.entities;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ArticleAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String urlHash;

    @Column(nullable = false, length = 2048)
    private String sourceUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(columnDefinition = "TEXT")
    private List<String> keyPoints = new ArrayList<>();

    @Column(nullable = false, length = 50)
    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> entities = new ArrayList<>();

    @Column(nullable = false, length = 20)
    private String sentiment;

    private double confidence;
    private String language;
    private String model;
    private long processingTimeMs;
    private LocalDateTime analyzedAt;
}

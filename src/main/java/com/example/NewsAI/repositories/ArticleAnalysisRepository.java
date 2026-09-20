package com.example.NewsAI.repositories;

import com.example.NewsAI.entities.ArticleAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArticleAnalysisRepository extends JpaRepository<ArticleAnalysis, Long> {
    Optional<ArticleAnalysis> findByUrlHash(String urlHash);
}

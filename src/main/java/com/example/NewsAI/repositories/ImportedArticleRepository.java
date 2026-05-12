package com.example.NewsAI.repositories;

import com.example.NewsAI.entities.ImportedArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportedArticleRepository extends JpaRepository<ImportedArticle, Long> {

    List<ImportedArticle> findByUserId(Long userId);

    boolean existsByUserIdAndUrl(Long userId, String url);

    void deleteByUserIdAndUrl(Long userId, String url);
}

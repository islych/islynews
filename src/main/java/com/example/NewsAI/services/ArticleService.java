package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArticleService {

    Article createArticle(Article article, String authorEmail);

    Article updateArticle(Long id, Article article, String requesterEmail, boolean isAdmin);

    void deleteArticle(Long id, String requesterEmail, boolean isAdmin);

    Article getArticleById(Long id);

    List<Article> getAllArticles();

    List<Article> getArticlesByAuthor(Long authorId);

    List<Article> getArticlesByAuthorEmail(String authorEmail);

    Page<Article> searchArticles(String query, Pageable pageable);
}

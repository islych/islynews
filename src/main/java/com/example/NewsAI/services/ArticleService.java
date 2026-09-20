package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArticleService {

    Article createArticle(Article article, String authorEmail);

    Article updateArticle(Long id, Article article, String requesterEmail, boolean isAdmin);

    Article submitForReview(Long id, String requesterEmail);

    Article approveArticle(Long id);

    Article rejectArticle(Long id, String reason);

    void deleteArticle(Long id, String requesterEmail, boolean isAdmin);

    Article getArticleById(Long id);

    List<Article> getAllArticles();

    List<Article> getAllArticlesForAdmin();

    List<Article> getReviewQueue();

    Article getArticleForViewer(Long id, String requesterEmail, boolean isAdmin);

    List<Article> getArticlesByAuthor(Long authorId);

    List<Article> getArticlesByAuthorEmail(String authorEmail);

    Page<Article> searchArticles(String query, Pageable pageable);
}

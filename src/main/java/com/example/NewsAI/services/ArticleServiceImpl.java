package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.ArticleStatus;
import com.example.NewsAI.repositories.ArticleRepository;
import com.example.NewsAI.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@AllArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private static final List<ArticleStatus> PUBLIC_STATUSES = List.of(ArticleStatus.PUBLISHED, ArticleStatus.ACTIVE);

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Override
    public Article createArticle(Article article, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        article.setAuthor(author);
        article.setCreatedAt(LocalDateTime.now());
        article.setStatus(ArticleStatus.DRAFT);
        article.setReviewedAt(null);
        article.setRejectionReason(null);
        return articleRepository.save(article);
    }

    @Override
    public Article updateArticle(Long id, Article updated, String requesterEmail, boolean isAdmin) {
        Article existing = getArticleById(id);
        if (!isAdmin && !existing.getAuthor().getEmail().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own articles");
        }
        if (!isAdmin && existing.getStatus() != ArticleStatus.DRAFT && existing.getStatus() != ArticleStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only draft or rejected articles can be edited");
        }
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setImageUrl(updated.getImageUrl());
        if (!isAdmin) {
            existing.setStatus(ArticleStatus.DRAFT);
            existing.setReviewedAt(null);
            existing.setRejectionReason(null);
        }
        return articleRepository.save(existing);
    }

    @Override
    public Article submitForReview(Long id, String requesterEmail) {
        Article article = getArticleById(id);
        if (!article.getAuthor().getEmail().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only submit your own articles");
        }
        if (article.getStatus() != ArticleStatus.DRAFT && article.getStatus() != ArticleStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This article cannot be submitted in its current state");
        }
        article.setStatus(ArticleStatus.PENDING_REVIEW);
        article.setReviewedAt(null);
        article.setRejectionReason(null);
        return articleRepository.save(article);
    }

    @Override
    public Article approveArticle(Long id) {
        Article article = requirePendingReview(id);
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setReviewedAt(LocalDateTime.now());
        article.setRejectionReason(null);
        return articleRepository.save(article);
    }

    @Override
    public Article rejectArticle(Long id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A rejection reason is required");
        }
        Article article = requirePendingReview(id);
        article.setStatus(ArticleStatus.REJECTED);
        article.setReviewedAt(LocalDateTime.now());
        article.setRejectionReason(reason.strip());
        return articleRepository.save(article);
    }

    private Article requirePendingReview(Long id) {
        Article article = getArticleById(id);
        if (article.getStatus() != ArticleStatus.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending articles can be reviewed");
        }
        return article;
    }

    @Override
    public void deleteArticle(Long id, String requesterEmail, boolean isAdmin) {
        Article existing = getArticleById(id);
        if (!isAdmin && !existing.getAuthor().getEmail().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own articles");
        }
        articleRepository.deleteById(id);
    }

    @Override
    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));
    }

    @Override
    public List<Article> getAllArticles() {
        return articleRepository.findByStatusInOrderByCreatedAtDesc(PUBLIC_STATUSES);
    }

    @Override
    public List<Article> getAllArticlesForAdmin() {
        return articleRepository.findAll();
    }

    @Override
    public List<Article> getReviewQueue() {
        return articleRepository.findByStatusOrderByCreatedAtAsc(ArticleStatus.PENDING_REVIEW);
    }

    @Override
    public Article getArticleForViewer(Long id, String requesterEmail, boolean isAdmin) {
        Article article = getArticleById(id);
        boolean publicArticle = PUBLIC_STATUSES.contains(article.getStatus());
        boolean owner = requesterEmail != null && article.getAuthor().getEmail().equals(requesterEmail);
        if (!publicArticle && !owner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }
        return article;
    }

    @Override
    public List<Article> getArticlesByAuthor(Long authorId) {
        return articleRepository.findByAuthorId(authorId).stream()
                .filter(article -> PUBLIC_STATUSES.contains(article.getStatus()))
                .toList();
    }

    @Override
    public List<Article> getArticlesByAuthorEmail(String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return articleRepository.findByAuthorId(author.getId());
    }

    @Override
    public Page<Article> searchArticles(String query, Pageable pageable) {
        String safeQuery = query == null ? "" : query.trim();
        return articleRepository.searchPublished(safeQuery, PUBLIC_STATUSES, pageable);
    }
}

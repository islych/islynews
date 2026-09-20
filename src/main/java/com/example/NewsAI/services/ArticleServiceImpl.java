package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.entities.User;
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

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Override
    public Article createArticle(Article article, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        article.setAuthor(author);
        article.setCreatedAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    @Override
    public Article updateArticle(Long id, Article updated, String requesterEmail, boolean isAdmin) {
        Article existing = getArticleById(id);
        if (!isAdmin && !existing.getAuthor().getEmail().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own articles");
        }
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setImageUrl(updated.getImageUrl());
        existing.setStatus(updated.getStatus());
        return articleRepository.save(existing);
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
        return articleRepository.findAll();
    }

    @Override
    public List<Article> getArticlesByAuthor(Long authorId) {
        return articleRepository.findByAuthorId(authorId);
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
        return articleRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                safeQuery, safeQuery, pageable);
    }
}

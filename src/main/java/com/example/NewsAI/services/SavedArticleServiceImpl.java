package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.entities.SavedArticle;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.repositories.SavedArticleRepository;
import com.example.NewsAI.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class SavedArticleServiceImpl implements SavedArticleService {

    private final SavedArticleRepository savedArticleRepository;
    private final UserRepository userRepository;

    @Override
    public SavedArticle saveArticle(SavedArticle savedArticle, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        savedArticle.setUser(user);

        boolean exists = savedArticleRepository.existsByUserIdAndArticleId(
                user.getId(),
                savedArticle.getArticle().getId());

        if (exists) {
            throw new RuntimeException("Article already saved");
        }

        return savedArticleRepository.save(savedArticle);
    }

    @Override
    public List<SavedArticle> getSavedByUser(Long userId) {
        return savedArticleRepository.findByUserId(userId);
    }

    @Override
    public List<SavedArticle> getSavedByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return savedArticleRepository.findByUserId(user.getId());
    }

    @Override
    public void removeSaved(Long id, String userEmail) {
        SavedArticle saved = savedArticleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved article not found"));
        if (!saved.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only remove your own saved articles");
        }
        savedArticleRepository.delete(saved);
    }

    @Override
    public boolean checkIfSaved(String userEmail, Long articleId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return savedArticleRepository.existsByUserIdAndArticleId(user.getId(), articleId);
    }

    @Override
    public Map<String, Object> toggleSave(Long articleId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var existing = savedArticleRepository.findByUserIdAndArticleId(user.getId(), articleId);

        Map<String, Object> response = new HashMap<>();
        if (existing.isPresent()) {
            savedArticleRepository.delete(existing.get());
            response.put("saved", false);
            response.put("message", "Article unsaved");
        } else {
            SavedArticle savedArticle = new SavedArticle();
            savedArticle.setUser(user);
            Article article = new Article();
            article.setId(articleId);
            savedArticle.setArticle(article);
            savedArticleRepository.save(savedArticle);
            response.put("saved", true);
            response.put("message", "Article saved");
        }
        return response;
    }
}

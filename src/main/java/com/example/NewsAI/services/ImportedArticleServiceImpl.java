package com.example.NewsAI.services;

import com.example.NewsAI.entities.ImportedArticle;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.repositories.ImportedArticleRepository;
import com.example.NewsAI.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class ImportedArticleServiceImpl implements ImportedArticleService {

    private final ImportedArticleRepository importedArticleRepository;
    private final UserRepository userRepository;

    @Override
    public ImportedArticle saveImportedArticle(ImportedArticle importedArticle, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        importedArticle.setUser(user);
        importedArticle.setImportedAt(LocalDateTime.now());

        boolean exists = importedArticleRepository.existsByUserIdAndUrl(user.getId(), importedArticle.getUrl());
        if (exists) {
            throw new RuntimeException("Article already saved");
        }

        return importedArticleRepository.save(importedArticle);
    }

    @Override
    public List<ImportedArticle> getSavedByUser(Long userId) {
        return importedArticleRepository.findByUserId(userId);
    }

    @Override
    public List<ImportedArticle> getSavedByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return importedArticleRepository.findByUserId(user.getId());
    }

    @Override
    public void removeImported(Long id, String userEmail) {
        ImportedArticle imported = importedArticleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imported article not found"));
        if (!imported.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only remove your own imported articles");
        }
        importedArticleRepository.delete(imported);
    }

    @Override
    public boolean checkIfSaved(String userEmail, String url) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return importedArticleRepository.existsByUserIdAndUrl(user.getId(), url);
    }

    @Override
    public Map<String, Object> toggleSaveImported(String url, String userEmail, ImportedArticle importedArticle) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean exists = importedArticleRepository.existsByUserIdAndUrl(user.getId(), url);

        Map<String, Object> response = new HashMap<>();
        if (exists) {
            importedArticleRepository.deleteByUserIdAndUrl(user.getId(), url);
            response.put("saved", false);
            response.put("message", "Article unsaved");
        } else {
            importedArticle.setUser(user);
            importedArticle.setImportedAt(LocalDateTime.now());
            importedArticleRepository.save(importedArticle);
            response.put("saved", true);
            response.put("message", "Article saved");
        }
        return response;
    }
}

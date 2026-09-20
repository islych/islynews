package com.example.NewsAI.controllers;

import com.example.NewsAI.entities.SavedArticle;
import com.example.NewsAI.services.SavedArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/saved-articles")
@RequiredArgsConstructor
public class SavedArticleController {

    private final SavedArticleService savedArticleService;

    @PostMapping
    public SavedArticle saveArticle(@RequestBody SavedArticle savedArticle, Authentication auth) {
        return savedArticleService.saveArticle(savedArticle, auth.getName());
    }

    @GetMapping("/me")
    public List<SavedArticle> getMySaved(Authentication auth) {
        return savedArticleService.getSavedByUserEmail(auth.getName());
    }

    @GetMapping("/user/{userId}")
    public List<SavedArticle> getByUser(@PathVariable Long userId) {
        return savedArticleService.getSavedByUser(userId);
    }

    @DeleteMapping("/{id}")
    public void removeSaved(@PathVariable Long id, Authentication auth) {
        savedArticleService.removeSaved(id, auth.getName());
    }

    @GetMapping("/check/{articleId}")
    public ResponseEntity<Boolean> checkIfSaved(@PathVariable Long articleId, Authentication auth) {
        boolean isSaved = savedArticleService.checkIfSaved(auth.getName(), articleId);
        return ResponseEntity.ok(isSaved);
    }

    @PostMapping("/toggle/{articleId}")
    public ResponseEntity<Map<String, Object>> toggleSave(@PathVariable Long articleId, Authentication auth) {
        Map<String, Object> result = savedArticleService.toggleSave(articleId, auth.getName());
        return ResponseEntity.ok(result);
    }
}

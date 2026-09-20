package com.example.NewsAI.services;

import com.example.NewsAI.entities.SavedArticle;

import java.util.List;
import java.util.Map;

public interface SavedArticleService {

    SavedArticle saveArticle(SavedArticle savedArticle, String userEmail);

    List<SavedArticle> getSavedByUser(Long userId);

    List<SavedArticle> getSavedByUserEmail(String userEmail);

    void removeSaved(Long id, String userEmail);

    boolean checkIfSaved(String userEmail, Long articleId);

    Map<String, Object> toggleSave(Long articleId, String userEmail);
}

package com.example.NewsAI.services;

import com.example.NewsAI.entities.ImportedArticle;

import java.util.List;
import java.util.Map;

public interface ImportedArticleService {

    ImportedArticle saveImportedArticle(ImportedArticle importedArticle, String userEmail);

    List<ImportedArticle> getSavedByUser(Long userId);

    List<ImportedArticle> getSavedByUserEmail(String userEmail);

    void removeImported(Long id, String userEmail);

    boolean checkIfSaved(String userEmail, String url);

    Map<String, Object> toggleSaveImported(String url, String userEmail, ImportedArticle importedArticle);
}

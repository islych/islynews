package com.example.NewsAI.controllers;

import com.example.NewsAI.entities.ImportedArticle;
import com.example.NewsAI.services.ImportedArticleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/imported-articles")
@RequiredArgsConstructor
public class ImportedArticleController {

    private final ImportedArticleService importedArticleService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ImportedArticle saveImportedArticle(@RequestBody ImportedArticle importedArticle, Authentication auth) {
        log.info("Saving imported article for user: {}", auth.getName());
        return importedArticleService.saveImportedArticle(importedArticle, auth.getName());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<ImportedArticle> getMySaved(Authentication auth) {
        return importedArticleService.getSavedByUserEmail(auth.getName());
    }

    @GetMapping("/user/{userId}")
    public List<ImportedArticle> getByUser(@PathVariable Long userId) {
        return importedArticleService.getSavedByUser(userId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public void removeImported(@PathVariable Long id) {
        importedArticleService.removeImported(id);
    }

    @GetMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> checkIfSaved(@RequestParam String url, Authentication auth) {
        boolean isSaved = importedArticleService.checkIfSaved(auth.getName(), url);
        return ResponseEntity.ok(isSaved);
    }

    @PostMapping("/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> toggleSaveImported(
            @RequestParam String url,
            @RequestBody ImportedArticle importedArticle,
            Authentication auth) {
        Map<String, Object> result = importedArticleService.toggleSaveImported(url, auth.getName(), importedArticle);
        return ResponseEntity.ok(result);
    }
}

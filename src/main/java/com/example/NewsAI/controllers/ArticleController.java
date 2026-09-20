package com.example.NewsAI.controllers;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.services.ArticleService;
import com.example.NewsAI.services.AiSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final AiSummaryService aiSummaryService;

    // UC9 - Journaliste publie un article
    @PostMapping
    public Article createArticle(@RequestBody Article article, Authentication auth) {
        return articleService.createArticle(article, auth.getName());
    }

    // UC10 - Journaliste modifie SES articles / UC13 - Admin modifie n'importe quel
    // article
    @PutMapping("/{id}")
    public Article updateArticle(@PathVariable Long id, @RequestBody Article article, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return articleService.updateArticle(id, article, auth.getName(), isAdmin);
    }

    // UC11 - Journaliste supprime SES articles / UC13 - Admin supprime n'importe
    // quel article
    @DeleteMapping("/{id}")
    public void deleteArticle(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        articleService.deleteArticle(id, auth.getName(), isAdmin);
    }

    // UC1 - Consulter les actualités (public)
    @GetMapping
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    @GetMapping("/search")
    public Page<Article> searchArticles(
            @RequestParam(defaultValue = "") String q,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return articleService.searchArticles(q, pageable);
    }

    // Récupérer les articles de l'utilisateur connecté
    @GetMapping("/my-articles")
    public List<Article> getMyArticles(Authentication auth) {
        return articleService.getArticlesByAuthorEmail(auth.getName());
    }

    // UC2 - Voir le détail d'un article (public)
    @GetMapping("/{id}")
    public Article getArticle(@PathVariable Long id) {
        return articleService.getArticleById(id);
    }

    // UC3 - Résumer un article via IA (public)
    @GetMapping("/{id}/summary")
    public String summarizeArticle(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        return aiSummaryService.summarize(article.getContent());
    }

    @GetMapping("/author/{authorId}")
    public List<Article> getByAuthor(@PathVariable Long authorId) {
        return articleService.getArticlesByAuthor(authorId);
    }
}

package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.ArticleStatus;
import com.example.NewsAI.repositories.ArticleRepository;
import com.example.NewsAI.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ArticleWorkflowServiceTests {
    private ArticleRepository articleRepository;
    private UserRepository userRepository;
    private ArticleServiceImpl service;
    private User journalist;

    @BeforeEach
    void setUp() {
        articleRepository = mock(ArticleRepository.class);
        userRepository = mock(UserRepository.class);
        service = new ArticleServiceImpl(articleRepository, userRepository);
        journalist = new User();
        journalist.setId(7L);
        journalist.setEmail("journalist@example.com");
        when(articleRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void journalistCreatesDraftThenSubmitsForReview() {
        when(userRepository.findByEmail(journalist.getEmail())).thenReturn(Optional.of(journalist));
        Article created = service.createArticle(article("Editorial workflow"), journalist.getEmail());
        assertThat(created.getStatus()).isEqualTo(ArticleStatus.DRAFT);

        created.setId(12L);
        when(articleRepository.findById(12L)).thenReturn(Optional.of(created));
        Article submitted = service.submitForReview(12L, journalist.getEmail());
        assertThat(submitted.getStatus()).isEqualTo(ArticleStatus.PENDING_REVIEW);
    }

    @Test
    void adminCanApprovePendingArticle() {
        Article pending = article("Ready for review");
        pending.setStatus(ArticleStatus.PENDING_REVIEW);
        pending.setAuthor(journalist);
        when(articleRepository.findById(13L)).thenReturn(Optional.of(pending));

        Article approved = service.approveArticle(13L);
        assertThat(approved.getStatus()).isEqualTo(ArticleStatus.PUBLISHED);
        assertThat(approved.getReviewedAt()).isNotNull();
    }

    @Test
    void rejectionStoresEditorialFeedback() {
        Article pending = article("Needs corrections");
        pending.setStatus(ArticleStatus.PENDING_REVIEW);
        pending.setAuthor(journalist);
        when(articleRepository.findById(14L)).thenReturn(Optional.of(pending));

        Article rejected = service.rejectArticle(14L, "Add reliable sources");
        assertThat(rejected.getStatus()).isEqualTo(ArticleStatus.REJECTED);
        assertThat(rejected.getRejectionReason()).isEqualTo("Add reliable sources");
    }

    private Article article(String title) {
        Article article = new Article();
        article.setTitle(title);
        article.setContent("A sufficiently detailed article body.");
        return article;
    }
}

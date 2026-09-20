package com.example.NewsAI.services;

import com.example.NewsAI.entities.ImportedArticle;
import com.example.NewsAI.entities.Like;
import com.example.NewsAI.entities.SavedArticle;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.repositories.ImportedArticleRepository;
import com.example.NewsAI.repositories.LikeRepository;
import com.example.NewsAI.repositories.SavedArticleRepository;
import com.example.NewsAI.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OwnershipAuthorizationTests {

    @Mock SavedArticleRepository savedArticleRepository;
    @Mock ImportedArticleRepository importedArticleRepository;
    @Mock LikeRepository likeRepository;
    @Mock UserRepository userRepository;

    private SavedArticleServiceImpl savedArticleService;
    private ImportedArticleServiceImpl importedArticleService;
    private LikeServiceImpl likeService;

    @BeforeEach
    void setUp() {
        savedArticleService = new SavedArticleServiceImpl(savedArticleRepository, userRepository);
        importedArticleService = new ImportedArticleServiceImpl(importedArticleRepository, userRepository);
        likeService = new LikeServiceImpl(likeRepository, userRepository);
    }

    @Test
    void ownerCanRemoveSavedArticle() {
        SavedArticle saved = new SavedArticle();
        saved.setUser(user("owner@example.com"));
        when(savedArticleRepository.findById(1L)).thenReturn(Optional.of(saved));

        savedArticleService.removeSaved(1L, "owner@example.com");

        verify(savedArticleRepository).delete(saved);
    }

    @Test
    void anotherUserCannotRemoveSavedArticle() {
        SavedArticle saved = new SavedArticle();
        saved.setUser(user("owner@example.com"));
        when(savedArticleRepository.findById(1L)).thenReturn(Optional.of(saved));

        assertThrows(ResponseStatusException.class,
                () -> savedArticleService.removeSaved(1L, "attacker@example.com"));
        verify(savedArticleRepository, never()).delete(any());
    }

    @Test
    void anotherUserCannotRemoveImportedArticle() {
        ImportedArticle imported = new ImportedArticle();
        imported.setUser(user("owner@example.com"));
        when(importedArticleRepository.findById(2L)).thenReturn(Optional.of(imported));

        assertThrows(ResponseStatusException.class,
                () -> importedArticleService.removeImported(2L, "attacker@example.com"));
        verify(importedArticleRepository, never()).delete(any());
    }

    @Test
    void anotherUserCannotRemoveLike() {
        Like like = new Like();
        like.setUser(user("owner@example.com"));
        when(likeRepository.findById(3L)).thenReturn(Optional.of(like));

        assertThrows(ResponseStatusException.class,
                () -> likeService.unlike(3L, "attacker@example.com"));
        verify(likeRepository, never()).delete(any());
    }

    private User user(String email) {
        User user = new User();
        user.setEmail(email);
        return user;
    }
}

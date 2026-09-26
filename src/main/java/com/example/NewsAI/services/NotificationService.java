package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.entities.Notification;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.Role;
import com.example.NewsAI.repositories.NotificationRepository;
import com.example.NewsAI.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyAdminsAboutSubmission(Article article) {
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                create(admin, "ARTICLE_SUBMITTED",
                        article.getAuthor().getUsername() + " submitted “" + article.getTitle() + "” for review.", article.getId()));
    }

    public void notifyJournalist(Article article, boolean approved, String reason) {
        String message = approved
                ? "Your article “" + article.getTitle() + "” was approved and published."
                : "Your article “" + article.getTitle() + "” was rejected. Corrections requested: " + reason
                    + ". Edit it and submit it again for review.";
        create(article.getAuthor(), approved ? "ARTICLE_APPROVED" : "ARTICLE_REJECTED", message, article.getId());
    }

    public List<Notification> getFor(String email) {
        return notificationRepository.findTop30ByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public long unreadCount(String email) {
        return notificationRepository.countByRecipientEmailAndReadFlagFalse(email);
    }

    @Transactional
    public void markAllRead(String email) {
        List<Notification> notifications = notificationRepository.findByRecipientEmailAndReadFlagFalse(email);
        notifications.forEach(notification -> notification.setReadFlag(true));
        notificationRepository.saveAll(notifications);
    }

    private void create(User recipient, String type, String message, Long articleId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setArticleId(articleId);
        notification.setReadFlag(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
}

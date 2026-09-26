package com.example.NewsAI.repositories;

import com.example.NewsAI.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop30ByRecipientEmailOrderByCreatedAtDesc(String email);
    long countByRecipientEmailAndReadFlagFalse(String email);
    List<Notification> findByRecipientEmailAndReadFlagFalse(String email);
}

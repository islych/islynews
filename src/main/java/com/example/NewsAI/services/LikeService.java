package com.example.NewsAI.services;

import com.example.NewsAI.entities.Like;

import java.util.Map;

public interface LikeService {

    Like likeArticle(Like like, String userEmail);

    void unlike(Long id, String userEmail);

    boolean checkIfLiked(String userEmail, Long articleId);

    long getLikeCount(Long articleId);

    Map<String, Object> toggleLike(Long articleId, String userEmail);
}

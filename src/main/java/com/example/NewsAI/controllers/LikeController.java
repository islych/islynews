package com.example.NewsAI.controllers;

import com.example.NewsAI.entities.Like;
import com.example.NewsAI.services.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public Like likeArticle(@RequestBody Like like, Authentication auth) {
        return likeService.likeArticle(like, auth.getName());
    }

    @DeleteMapping("/{id}")
    public void unlike(@PathVariable Long id, Authentication auth) {
        likeService.unlike(id, auth.getName());
    }

    @GetMapping("/check/{articleId}")
    public ResponseEntity<Boolean> checkIfLiked(@PathVariable Long articleId, Authentication auth) {
        boolean isLiked = likeService.checkIfLiked(auth.getName(), articleId);
        return ResponseEntity.ok(isLiked);
    }

    @PostMapping("/toggle/{articleId}")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long articleId, Authentication auth) {
        Map<String, Object> result = likeService.toggleLike(articleId, auth.getName());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/count/{articleId}")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long articleId) {
        long count = likeService.getLikeCount(articleId);
        return ResponseEntity.ok(count);
    }
}

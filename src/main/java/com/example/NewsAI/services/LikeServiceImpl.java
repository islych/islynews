package com.example.NewsAI.services;

import com.example.NewsAI.entities.Article;
import com.example.NewsAI.entities.Like;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.repositories.LikeRepository;
import com.example.NewsAI.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
@AllArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;

    @Override
    public Like likeArticle(Like like, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        like.setUser(user);
        
        boolean exists = likeRepository.existsByUserIdAndArticleId(
                user.getId(),
                like.getArticle().getId());

        if (exists) {
            throw new RuntimeException("Already liked");
        }

        return likeRepository.save(like);
    }

    @Override
    public void unlike(Long id, String userEmail) {
        Like like = likeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Like not found"));
        if (!like.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only remove your own likes");
        }
        likeRepository.delete(like);
    }

    @Override
    public boolean checkIfLiked(String userEmail, Long articleId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return likeRepository.existsByUserIdAndArticleId(user.getId(), articleId);
    }

    @Override
    public long getLikeCount(Long articleId) {
        return likeRepository.countByArticleId(articleId);
    }

    @Override
    public Map<String, Object> toggleLike(Long articleId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var existing = likeRepository.findByUserIdAndArticleId(user.getId(), articleId);

        Map<String, Object> response = new HashMap<>();
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            response.put("liked", false);
            response.put("message", "Article unliked");
        } else {
            Like like = new Like();
            like.setUser(user);
            Article article = new Article();
            article.setId(articleId);
            like.setArticle(article);
            likeRepository.save(like);
            response.put("liked", true);
            response.put("message", "Article liked");
        }
        return response;
    }
}

package com.example.NewsAI.entities;

import com.example.NewsAI.enums.ArticleStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String imageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    @Column(length = 1000)
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(32)")
    private ArticleStatus status;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @JsonIgnore
    @OneToMany(mappedBy = "article")
    private List<Comment> comments;

    @JsonIgnore
    @OneToMany(mappedBy = "article")
    private List<Like> likes;
}

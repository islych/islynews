package com.example.NewsAI.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImportedArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String imageUrl;

    private String source;

    private String url;

    private LocalDateTime publishedAt;

    private LocalDateTime importedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
}

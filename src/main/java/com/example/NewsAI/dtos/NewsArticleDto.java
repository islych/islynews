package com.example.NewsAI.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String title;
    private String description;
    private String url;
    private String urlToImage;
    private String publishedAt;
    private String content;
    private SourceDto source;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private String id;
        private String name;
    }
}

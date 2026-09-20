package com.example.NewsAI.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ArticleAnalysisRequest(
        @NotBlank @Size(max = 500) String title,
        @Size(max = 5000) String description,
        @Size(max = 15000) String content,
        @NotBlank @Size(max = 2048) String url,
        @Size(max = 255) String source,
        @Size(max = 10) String language) {
}

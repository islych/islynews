package com.example.NewsAI.dtos;

public record ExtractedArticleDto(
        String text,
        int wordCount,
        String sourceUrl
) {}

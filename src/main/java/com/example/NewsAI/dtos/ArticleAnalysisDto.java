package com.example.NewsAI.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

public record ArticleAnalysisDto(
        String summary,
        List<String> keyPoints,
        String category,
        List<String> entities,
        List<String> tags,
        String sentiment,
        double confidence,
        String language,
        String model,
        long processingTimeMs,
        LocalDateTime analyzedAt,
        String sourceUrl) implements Serializable {
    private static final long serialVersionUID = 1L;
}

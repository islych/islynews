package com.example.NewsAI.services;

public interface AiAnalysisProvider {
    String summarize(String content);

    String modelName();
}

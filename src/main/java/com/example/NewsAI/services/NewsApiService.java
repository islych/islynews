package com.example.NewsAI.services;

import com.example.NewsAI.dtos.NewsApiResponse;

public interface NewsApiService {
    NewsApiResponse getTopHeadlines(String country, String category, String language, int page, int pageSize);

    NewsApiResponse searchNews(String query, String language, int page, int pageSize);
}

package com.example.NewsAI.controllers;

import com.example.NewsAI.dtos.NewsApiResponse;
import com.example.NewsAI.services.NewsApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/external-news")
@RequiredArgsConstructor
public class NewsApiController {

    private final NewsApiService newsApiService;

    @GetMapping("/top-headlines")
    public NewsApiResponse getTopHeadlines(
            @RequestParam(defaultValue = "") String country,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "en") String language,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int pageSize) {
        return newsApiService.getTopHeadlines(country, category, language, page, pageSize);
    }

    @GetMapping("/search")
    public NewsApiResponse searchNews(
            @RequestParam String q,
            @RequestParam(defaultValue = "en") String language,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int pageSize) {
        return newsApiService.searchNews(q, language, page, pageSize);
    }
}

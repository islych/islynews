package com.example.NewsAI.controllers;

import com.example.NewsAI.dtos.ArticleAnalysisDto;
import com.example.NewsAI.dtos.ArticleAnalysisRequest;
import com.example.NewsAI.services.ArticleAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ArticleAnalysisController {
    private final ArticleAnalysisService analysisService;

    @PostMapping("/analyze")
    public ArticleAnalysisDto analyze(@Valid @RequestBody ArticleAnalysisRequest request) {
        return analysisService.analyze(request);
    }
}

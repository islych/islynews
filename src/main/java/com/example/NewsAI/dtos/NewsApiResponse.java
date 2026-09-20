package com.example.NewsAI.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsApiResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String status;
    private int totalResults;
    private List<NewsArticleDto> articles;
}

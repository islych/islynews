package com.example.NewsAI.services;

import com.example.NewsAI.dtos.ArticleAnalysisDto;
import com.example.NewsAI.dtos.ArticleAnalysisRequest;
import com.example.NewsAI.repositories.ArticleAnalysisRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ArticleAnalysisServiceTests {

    @Test
    void createsStructuredAnalysisAndPersistsIt() {
        ArticleAnalysisRepository repository = mock(ArticleAnalysisRepository.class);
        AiAnalysisProvider provider = mock(AiAnalysisProvider.class);
        when(repository.findByUrlHash(anyString())).thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(provider.summarize(anyString())).thenReturn(
                "OpenAI announced strong growth. The company introduced a new AI platform.");
        when(provider.modelName()).thenReturn("test-model");

        ArticleAnalysisService service = new ArticleAnalysisService(repository, provider);
        ArticleAnalysisDto result = service.analyze(new ArticleAnalysisRequest(
                "OpenAI introduces a new technology platform",
                "The company reported growth after the announcement.",
                "The software platform will be available worldwide.",
                "https://example.com/openai-platform",
                "Example News",
                "en"));

        assertThat(result.summary()).contains("OpenAI");
        assertThat(result.keyPoints()).isNotEmpty();
        assertThat(result.category()).isEqualTo("technology");
        assertThat(result.entities()).contains("Example News", "OpenAI");
        assertThat(result.sentiment()).isEqualTo("positive");
        assertThat(result.confidence()).isEqualTo(0.86);
        assertThat(result.model()).isEqualTo("test-model");
        assertThat(result.sourceUrl()).isEqualTo("https://example.com/openai-platform");
        verify(repository).save(any());
    }
}

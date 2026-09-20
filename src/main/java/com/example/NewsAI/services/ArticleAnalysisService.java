package com.example.NewsAI.services;

import com.example.NewsAI.dtos.ArticleAnalysisDto;
import com.example.NewsAI.dtos.ArticleAnalysisRequest;
import com.example.NewsAI.entities.ArticleAnalysis;
import com.example.NewsAI.repositories.ArticleAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ArticleAnalysisService {
    private static final Pattern ENTITY_PATTERN = Pattern.compile("\\b[A-Z][\\p{L}0-9.-]+(?:\\s+[A-Z][\\p{L}0-9.-]+){0,2}\\b");
    private static final Set<String> POSITIVE = Set.of("gain", "growth", "success", "win", "improve", "record", "hope", "succès", "victoire", "progrès");
    private static final Set<String> NEGATIVE = Set.of("death", "dead", "war", "crisis", "attack", "loss", "fail", "mort", "guerre", "crise", "attaque");

    private final ArticleAnalysisRepository repository;
    private final AiAnalysisProvider aiProvider;

    @Cacheable(cacheNames = "articleAnalysis", key = "'v2:' + #request.url()", sync = true)
    public ArticleAnalysisDto analyze(ArticleAnalysisRequest request) {
        String urlHash = sha256(request.url());
        String input = analysisText(request);
        String language = normalizeLanguage(request.language(), input);
        return repository.findByUrlHash(urlHash)
                .filter(saved -> isSummaryAcceptable(saved.getSummary(), input, language))
                .map(this::toDto)
                .orElseGet(() -> create(request, urlHash, input, language));
    }

    private ArticleAnalysisDto create(ArticleAnalysisRequest request, String urlHash, String input, String language) {
        long startedAt = System.nanoTime();
        String generatedSummary = aiProvider.summarize(input);
        boolean aiSucceeded = generatedSummary != null
                && !generatedSummary.startsWith("AI ")
                && !generatedSummary.equals("Summary unavailable.")
                && !generatedSummary.equals("No content to summarize.")
                && isSummaryAcceptable(generatedSummary, input, language);
        String summary = aiSucceeded ? generatedSummary : extractiveSummary(input);

        ArticleAnalysis analysis = repository.findByUrlHash(urlHash).orElseGet(ArticleAnalysis::new);
        analysis.setUrlHash(urlHash);
        analysis.setSourceUrl(request.url());
        analysis.setSummary(summary);
        analysis.setKeyPoints(keyPoints(summary, input));
        analysis.setCategory(category(input));
        analysis.setEntities(entities(request.title(), request.source()));
        analysis.setSentiment(sentiment(input));
        analysis.setConfidence(aiSucceeded ? 0.86 : 0.62);
        analysis.setLanguage(language);
        analysis.setModel(aiSucceeded ? aiProvider.modelName() : "extractive-fallback-v1");
        analysis.setProcessingTimeMs((System.nanoTime() - startedAt) / 1_000_000);
        analysis.setAnalyzedAt(LocalDateTime.now());
        return toDto(repository.save(analysis));
    }

    private boolean isSummaryAcceptable(String summary, String input, String language) {
        if (summary == null || summary.isBlank() || summary.length() < 30) return false;
        if ("ar".equals(language) && arabicRatio(summary) < 0.25) return false;

        Set<String> inputWords = significantWords(input);
        Set<String> summaryWords = significantWords(summary);
        if (inputWords.isEmpty() || summaryWords.isEmpty()) return false;
        long shared = summaryWords.stream().filter(inputWords::contains).count();
        return shared >= Math.min(3, summaryWords.size()) || (double) shared / summaryWords.size() >= 0.18;
    }

    private double arabicRatio(String text) {
        long letters = text.codePoints().filter(Character::isLetter).count();
        if (letters == 0) return 0;
        long arabic = text.codePoints().filter(code -> code >= 0x0600 && code <= 0x06FF).count();
        return (double) arabic / letters;
    }

    private Set<String> significantWords(String text) {
        Set<String> words = new LinkedHashSet<>();
        Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+"))
                .filter(word -> word.length() >= 4)
                .limit(250)
                .forEach(words::add);
        return words;
    }

    private String analysisText(ArticleAnalysisRequest request) {
        return String.join(". ", List.of(nullToEmpty(request.title()), nullToEmpty(request.description()), nullToEmpty(request.content())))
                .replaceAll("\\s+", " ").strip();
    }

    private String extractiveSummary(String text) {
        return Arrays.stream(text.split("(?<=[.!?؟])\\s+"))
                .filter(sentence -> !sentence.isBlank())
                .limit(3)
                .reduce((left, right) -> left + " " + right)
                .orElse(text.length() > 500 ? text.substring(0, 500) + "…" : text);
    }

    private List<String> keyPoints(String summary, String input) {
        List<String> points = new ArrayList<>(Arrays.stream(summary.split("(?<=[.!?؟])\\s+"))
                .filter(point -> point.length() > 20)
                .limit(3)
                .toList());
        if (points.size() < 2) {
            Arrays.stream(input.split("(?<=[.!?؟])\\s+"))
                    .filter(point -> point.length() > 20 && !points.contains(point))
                    .limit(3 - points.size())
                    .forEach(points::add);
        }
        return points;
    }

    private String category(String text) {
        String value = text.toLowerCase(Locale.ROOT);
        if (containsAny(value, "technology", "software", "ai", "digital", "tech", "ذكاء", "تكنولوجيا")) return "technology";
        if (containsAny(value, "business", "market", "economy", "finance", "économie", "marché", "اقتصاد")) return "business";
        if (containsAny(value, "health", "medical", "disease", "santé", "médecin", "صحة")) return "health";
        if (containsAny(value, "sport", "football", "match", "soccer", "رياضة")) return "sports";
        if (containsAny(value, "science", "research", "space", "étude", "recherche", "علوم")) return "science";
        if (containsAny(value, "movie", "music", "culture", "film", "cinéma", "موسيقى")) return "entertainment";
        return "general";
    }

    private String sentiment(String text) {
        String value = text.toLowerCase(Locale.ROOT);
        long positive = POSITIVE.stream().filter(value::contains).count();
        long negative = NEGATIVE.stream().filter(value::contains).count();
        return positive == negative ? "neutral" : positive > negative ? "positive" : "negative";
    }

    private List<String> entities(String title, String source) {
        LinkedHashSet<String> result = new LinkedHashSet<>();
        if (source != null && !source.isBlank()) result.add(source.strip());
        Matcher matcher = ENTITY_PATTERN.matcher(nullToEmpty(title));
        while (matcher.find() && result.size() < 8) result.add(matcher.group());
        return result.stream().toList();
    }

    private String normalizeLanguage(String requested, String text) {
        if (requested != null && Set.of("ar", "en", "fr").contains(requested.toLowerCase(Locale.ROOT))) {
            return requested.toLowerCase(Locale.ROOT);
        }
        if (text.codePoints().anyMatch(code -> code >= 0x0600 && code <= 0x06FF)) return "ar";
        return "en";
    }

    private boolean containsAny(String text, String... words) {
        return Arrays.stream(words).anyMatch(text::contains);
    }

    private String sha256(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private ArticleAnalysisDto toDto(ArticleAnalysis analysis) {
        return new ArticleAnalysisDto(analysis.getSummary(), List.copyOf(analysis.getKeyPoints()), analysis.getCategory(),
                List.copyOf(analysis.getEntities()), analysis.getSentiment(), analysis.getConfidence(), analysis.getLanguage(),
                analysis.getModel(), analysis.getProcessingTimeMs(), analysis.getAnalyzedAt(), analysis.getSourceUrl());
    }
}

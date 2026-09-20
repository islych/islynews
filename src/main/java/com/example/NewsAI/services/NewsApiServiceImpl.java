package com.example.NewsAI.services;

import com.example.NewsAI.dtos.NewsApiResponse;
import com.example.NewsAI.dtos.NewsArticleDto;
import com.example.NewsAI.dtos.GNewsResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NewsApiServiceImpl implements NewsApiService {

    private static final Logger log = LoggerFactory.getLogger(NewsApiServiceImpl.class);
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_COUNTRIES_PER_REQUEST = 6;
    private static final Set<String> SUPPORTED_COUNTRIES = Set.of(
            "ae", "ar", "at", "au", "be", "bg", "br", "ca", "ch", "cn", "co", "cu", "cz", "de",
            "eg", "fr", "gb", "gr", "hk", "hu", "id", "ie", "il", "in", "it", "jp", "kr", "lt",
            "lv", "ma", "mx", "my", "ng", "nl", "no", "nz", "ph", "pl", "pt", "ro", "rs", "ru",
            "sa", "se", "sg", "si", "sk", "th", "tr", "tw", "ua", "us", "ve", "za");
    private static final Map<String, String> COUNTRY_NAMES = Map.ofEntries(
            Map.entry("ma", "Morocco"), Map.entry("za", "South Africa"), Map.entry("eg", "Egypt"),
            Map.entry("ng", "Nigeria"), Map.entry("in", "India"), Map.entry("jp", "Japan"),
            Map.entry("cn", "China"), Map.entry("sg", "Singapore"), Map.entry("fr", "France"),
            Map.entry("gb", "United Kingdom"), Map.entry("de", "Germany"), Map.entry("it", "Italy"),
            Map.entry("nl", "Netherlands"), Map.entry("us", "United States"), Map.entry("ca", "Canada"),
            Map.entry("mx", "Mexico"), Map.entry("br", "Brazil"), Map.entry("ar", "Argentina"),
            Map.entry("co", "Colombia"), Map.entry("au", "Australia"), Map.entry("nz", "New Zealand"));

    private final RestTemplate restTemplate;

    @Value("${newsapi.api.key}")
    private String apiKey;

    @Value("${newsapi.api.base-url}")
    private String apiBaseUrl;

    @Value("${gnews.api.key}")
    private String gNewsApiKey;

    @Value("${gnews.api.base-url}")
    private String gNewsBaseUrl;

    @Override
    @Cacheable(cacheNames = "externalNews",
            key = "'headlines:' + (#country ?: 'us') + ':' + (#category ?: 'general') + ':' + #page + ':' + #pageSize",
            sync = true)
    public NewsApiResponse getTopHeadlines(String country, String category, int page, int pageSize) {
        int safePageSize = normalizePageSize(pageSize);
        List<String> countries = parseCountryCodes(country);
        if (countries.size() > 1 || "ma".equals(countries.getFirst())) {
            return getNewsAboutGeography(countries, page, safePageSize);
        }
        int resultsPerCountry = Math.max(10, (int) Math.ceil((double) safePageSize / countries.size()));
        List<NewsArticleDto> articles = new ArrayList<>();
        int totalResults = 0;

        for (String countryCode : countries) {
            try {
                NewsApiResponse response = fetchNewsApiHeadlines(
                        countryCode, category, page, resultsPerCountry);
                if (response != null) {
                    totalResults += response.getTotalResults();
                    addAll(articles, response.getArticles());
                }
            } catch (RuntimeException exception) {
                log.warn("NewsAPI headlines request failed for {}; continuing with other feeds ({})",
                        countryCode, exception.getClass().getSimpleName());
            }

            // GNews free accounts are rate-limited. One fresh GNews feed is combined
            // with all NewsAPI country feeds to avoid bursts when filtering a continent.
            if (countryCode.equals(countries.getFirst())) {
                try {
                    GNewsResponse response = fetchGNewsHeadlines(
                            countryCode, category, page, safePageSize);
                    if (response != null) {
                        totalResults += response.getTotalArticles();
                        addAll(articles, mapGNewsArticles(response.getArticles()));
                    }
                } catch (RuntimeException exception) {
                    log.warn("GNews headlines request failed for {}; continuing with other feeds ({})",
                            countryCode, exception.getClass().getSimpleName());
                }
            }
        }

        return aggregatedResponse(articles, totalResults, safePageSize);
    }

    private NewsApiResponse getNewsAboutGeography(List<String> countries, int page, int pageSize) {
        String query = geographicQuery(countries);
        List<NewsArticleDto> articles = new ArrayList<>();
        int totalResults = 0;

        try {
            String newsApiUrl = UriComponentsBuilder.fromUriString(apiBaseUrl + "/everything")
                    .queryParam("apiKey", apiKey)
                    .queryParam("q", query)
                    .queryParam("sortBy", "publishedAt")
                    .queryParam("page", page)
                    .queryParam("pageSize", pageSize)
                    .toUriString();
            NewsApiResponse response = restTemplate.getForObject(newsApiUrl, NewsApiResponse.class);
            if (response != null) {
                totalResults += response.getTotalResults();
                addAll(articles, response.getArticles());
            }
        } catch (RuntimeException exception) {
            log.warn("NewsAPI geographic search failed ({})", exception.getClass().getSimpleName());
        }

        try {
            String gNewsUrl = UriComponentsBuilder.fromUriString(gNewsBaseUrl + "/search")
                    .queryParam("apikey", gNewsApiKey)
                    .queryParam("q", query)
                    .queryParam("lang", "en")
                    .queryParam("max", Math.min(pageSize, 10))
                    .queryParam("page", page)
                    .queryParam("sortby", "publishedAt")
                    .toUriString();
            GNewsResponse response = restTemplate.getForObject(gNewsUrl, GNewsResponse.class);
            if (response != null) {
                totalResults += response.getTotalArticles();
                addAll(articles, mapGNewsArticles(response.getArticles()));
            }
        } catch (RuntimeException exception) {
            log.warn("GNews geographic search failed ({})", exception.getClass().getSimpleName());
        }

        return aggregatedResponse(articles, totalResults, pageSize);
    }

    private String geographicQuery(List<String> countries) {
        Set<String> selected = Set.copyOf(countries);
        if (selected.equals(Set.of("ma", "za", "eg", "ng"))) return "Africa";
        if (selected.equals(Set.of("in", "jp", "cn", "sg"))) return "Asia";
        if (selected.equals(Set.of("fr", "gb", "de", "it", "nl"))) return "Europe";
        if (selected.equals(Set.of("us", "ca", "mx"))) return "North America";
        if (selected.equals(Set.of("br", "ar", "co"))) return "South America";
        if (selected.equals(Set.of("au", "nz"))) return "Oceania";
        return countries.stream()
                .map(code -> COUNTRY_NAMES.getOrDefault(code, code))
                .reduce((left, right) -> left + " OR " + right)
                .orElse("world");
    }

    @Override
    @Cacheable(cacheNames = "externalNews",
            key = "'search:' + #query.toLowerCase() + ':' + #page + ':' + #pageSize",
            sync = true)
    public NewsApiResponse searchNews(String query, int page, int pageSize) {
        int safePageSize = normalizePageSize(pageSize);
        List<NewsArticleDto> articles = new ArrayList<>();
        int totalResults = 0;

        try {
            String newsApiUrl = UriComponentsBuilder.fromUriString(apiBaseUrl + "/everything")
                .queryParam("apiKey", apiKey)
                .queryParam("q", query)
                .queryParam("sortBy", "publishedAt")
                .queryParam("page", page)
                .queryParam("pageSize", safePageSize)
                .toUriString();
            NewsApiResponse response = restTemplate.getForObject(newsApiUrl, NewsApiResponse.class);
            if (response != null) {
                totalResults += response.getTotalResults();
                addAll(articles, response.getArticles());
            }
        } catch (RuntimeException exception) {
            log.warn("NewsAPI search request failed; continuing with GNews ({})",
                    exception.getClass().getSimpleName());
        }

        try {
            String gNewsUrl = UriComponentsBuilder.fromUriString(gNewsBaseUrl + "/search")
                    .queryParam("apikey", gNewsApiKey)
                    .queryParam("q", query)
                    .queryParam("lang", "en")
                    .queryParam("max", safePageSize)
                    .queryParam("page", page)
                    .queryParam("sortby", "publishedAt")
                    .toUriString();
            GNewsResponse response = restTemplate.getForObject(gNewsUrl, GNewsResponse.class);
            if (response != null) {
                totalResults += response.getTotalArticles();
                addAll(articles, mapGNewsArticles(response.getArticles()));
            }
        } catch (RuntimeException exception) {
            log.warn("GNews search request failed; continuing with NewsAPI ({})",
                    exception.getClass().getSimpleName());
        }

        return aggregatedResponse(articles, totalResults, safePageSize);
    }

    private NewsApiResponse fetchNewsApiHeadlines(String country, String category, int page, int pageSize) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiBaseUrl + "/top-headlines")
                .queryParam("apiKey", apiKey)
                .queryParam("country", country)
                .queryParam("page", page)
                .queryParam("pageSize", pageSize);
        if (category != null && !category.isBlank() && !"general".equalsIgnoreCase(category)) {
            builder.queryParam("category", category);
        }
        return restTemplate.getForObject(builder.toUriString(), NewsApiResponse.class);
    }

    private GNewsResponse fetchGNewsHeadlines(String country, String category, int page, int pageSize) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(gNewsBaseUrl + "/top-headlines")
                .queryParam("apikey", gNewsApiKey)
                .queryParam("lang", "en")
                .queryParam("country", country)
                .queryParam("max", pageSize)
                .queryParam("page", page);
        if (category != null && !category.isBlank()) {
            builder.queryParam("category", category);
        }
        return restTemplate.getForObject(builder.toUriString(), GNewsResponse.class);
    }

    private List<NewsArticleDto> mapGNewsArticles(List<GNewsResponse.GNewsArticle> articles) {
        if (articles == null) {
            return List.of();
        }
        return articles.stream().map(article -> new NewsArticleDto(
                article.getTitle(),
                article.getDescription(),
                article.getUrl(),
                article.getImage(),
                article.getPublishedAt(),
                article.getContent(),
                new NewsArticleDto.SourceDto(null,
                        article.getSource() == null ? "GNews" : article.getSource().getName())
        )).toList();
    }

    private NewsApiResponse aggregatedResponse(List<NewsArticleDto> articles, int reportedTotal, int pageSize) {
        Map<String, NewsArticleDto> uniqueArticles = new LinkedHashMap<>();
        articles.stream()
                .filter(article -> article != null && article.getUrl() != null && !article.getUrl().isBlank())
                .filter(article -> article.getTitle() != null && !"[Removed]".equals(article.getTitle()))
                .sorted(Comparator.comparing(this::publishedAt).reversed())
                .forEach(article -> uniqueArticles.putIfAbsent(normalizeUrl(article.getUrl()), article));

        List<NewsArticleDto> result = uniqueArticles.values().stream().limit(pageSize).toList();
        int totalResults = Math.max(result.size(), reportedTotal);
        return new NewsApiResponse("ok", totalResults, result);
    }

    private Instant publishedAt(NewsArticleDto article) {
        try {
            return article.getPublishedAt() == null ? Instant.EPOCH : Instant.parse(article.getPublishedAt());
        } catch (DateTimeParseException exception) {
            return Instant.EPOCH;
        }
    }

    private String normalizeUrl(String url) {
        return url.strip().replaceFirst("[?#].*$", "").replaceFirst("/$", "").toLowerCase();
    }

    private int normalizePageSize(int pageSize) {
        return Math.max(1, Math.min(pageSize, MAX_PAGE_SIZE));
    }

    private List<String> parseCountryCodes(String country) {
        if (country == null || country.isBlank()) {
            return List.of("us");
        }
        List<String> countries = java.util.Arrays.stream(country.split(","))
                .map(String::strip)
                .map(String::toLowerCase)
                .filter(SUPPORTED_COUNTRIES::contains)
                .distinct()
                .limit(MAX_COUNTRIES_PER_REQUEST)
                .toList();
        return countries.isEmpty() ? List.of("us") : countries;
    }

    private void addAll(List<NewsArticleDto> destination, List<NewsArticleDto> source) {
        if (source != null) {
            destination.addAll(source);
        }
    }
}

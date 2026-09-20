package com.example.NewsAI.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AiSummaryService implements AiAnalysisProvider {

    @Value("${huggingface.api.key}")
    private String apiKey;

    private static final String HF_API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Override
    public String summarize(String content) {
        if (content == null || content.isBlank()) {
            return "No content to summarize.";
        }

        String truncated = content.length() > 1000 ? content.substring(0, 1000) : content;
        // Escape quotes in content for JSON
        String escaped = truncated.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");

        String jsonBody = "{\"inputs\":\"" + escaped + "\","
                + "\"parameters\":{\"max_length\":150,\"min_length\":40,\"do_sample\":false}}";

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(HF_API_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 503) {
                return "AI model is loading, please try again in a few seconds.";
            }
            if (response.statusCode() != 200) {
                return "AI summary unavailable (HTTP " + response.statusCode() + ").";
            }

            // Parse: [{"summary_text":"..."}]
            String body = response.body();
            int idx = body.indexOf("\"summary_text\"");
            if (idx != -1) {
                int start = body.indexOf("\"", idx + 14) + 1;
                int end = body.lastIndexOf("\"");
                if (start > 0 && end > start) {
                    return body.substring(start, end);
                }
            }

            return "Summary unavailable.";

        } catch (Exception e) {
            return "AI summary error: " + e.getMessage();
        }
    }

    @Override
    public String modelName() {
        return "facebook/bart-large-cnn";
    }
}

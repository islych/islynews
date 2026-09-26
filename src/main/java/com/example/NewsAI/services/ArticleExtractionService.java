package com.example.NewsAI.services;

import com.example.NewsAI.dtos.ExtractedArticleDto;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class ArticleExtractionService {

    private static final int MAX_BODY_BYTES = 2_000_000;
    private static final int MAX_TEXT_CHARS = 30_000;
    private static final int MAX_REDIRECTS = 4;

    @Value("${app.dev.article-extraction-enabled:false}")
    private boolean enabled;

    public ExtractedArticleDto extract(String rawUrl) {
        if (!enabled) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        try {
            URI current = validatePublicUrl(rawUrl);
            Connection.Response response = null;

            for (int redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
                response = Jsoup.connect(current.toString())
                        .userAgent("Mozilla/5.0 (compatible; IslyNewsStudentDemo/1.0)")
                        .referrer("https://www.google.com/")
                        .timeout(10_000)
                        .maxBodySize(MAX_BODY_BYTES)
                        .followRedirects(false)
                        .ignoreHttpErrors(true)
                        .execute();

                int status = response.statusCode();
                if (status >= 300 && status < 400) {
                    String location = response.header("Location");
                    if (location == null || redirect == MAX_REDIRECTS) {
                        throw unavailable("The publisher returned an invalid redirect.");
                    }
                    current = validatePublicUrl(current.resolve(location).toString());
                    continue;
                }
                if (status < 200 || status >= 300) {
                    throw unavailable("The publisher did not allow this preview.");
                }
                break;
            }

            if (response == null || !response.contentType().toLowerCase(Locale.ROOT).contains("text/html")) {
                throw unavailable("The source is not an HTML article.");
            }

            Document document = response.parse();
            Elements paragraphs = selectArticleParagraphs(document);
            Set<String> uniqueParagraphs = new LinkedHashSet<>();
            int totalLength = 0;
            for (Element paragraph : paragraphs) {
                String text = paragraph.text().replaceAll("\\s+", " ").trim();
                if (text.length() < 40 || isBoilerplate(text)) continue;
                if (totalLength + text.length() > MAX_TEXT_CHARS) break;
                if (uniqueParagraphs.add(text)) totalLength += text.length() + 2;
            }

            String articleText = String.join("\n\n", uniqueParagraphs);
            if (articleText.length() < 250) {
                throw unavailable("This publisher only exposes a short preview.");
            }

            int words = articleText.split("\\s+").length;
            return new ExtractedArticleDto(articleText, words, current.toString());
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IOException | URISyntaxException exception) {
            throw unavailable("The article could not be read from its publisher.");
        }
    }

    private Elements selectArticleParagraphs(Document document) {
        String[] selectors = {
                "article p", "[itemprop=articleBody] p", ".article-body p",
                ".story-body p", ".entry-content p", ".post-content p", "main p"
        };
        for (String selector : selectors) {
            Elements elements = document.select(selector);
            if (elements.stream().mapToInt(element -> element.text().length()).sum() >= 250) {
                return elements;
            }
        }
        return new Elements();
    }

    private URI validatePublicUrl(String rawUrl) throws URISyntaxException, IOException {
        URI uri = new URI(rawUrl);
        String scheme = uri.getScheme();
        if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https")) || uri.getHost() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only public HTTP(S) article URLs are accepted.");
        }
        for (InetAddress address : InetAddress.getAllByName(uri.getHost())) {
            if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
                    || address.isSiteLocalAddress() || address.isMulticastAddress()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Private network addresses are not accepted.");
            }
        }
        return uri;
    }

    private boolean isBoilerplate(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        return lower.contains("accept cookies") || lower.contains("all rights reserved")
                || lower.contains("subscribe to our") || lower.contains("sign up for our newsletter");
    }

    private ResponseStatusException unavailable(String reason) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, reason);
    }
}

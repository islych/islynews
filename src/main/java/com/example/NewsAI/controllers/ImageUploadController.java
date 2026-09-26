package com.example.NewsAI.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/uploads/images")
public class ImageUploadController {
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final Path uploadDirectory;

    public ImageUploadController(@Value("${app.upload.directory:uploads}") String uploadDirectory) throws IOException {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDirectory);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@RequestPart("file") MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (file.isEmpty() || contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(BAD_REQUEST, "Choose a JPG, PNG, WebP or GIF image");
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported image type");
        };
        String filename = UUID.randomUUID() + extension;
        Path destination = uploadDirectory.resolve(filename).normalize();
        if (!destination.getParent().equals(uploadDirectory)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid filename");
        }
        file.transferTo(destination);
        return Map.of("url", "/uploads/images/" + filename);
    }

    @GetMapping("/{filename:[a-f0-9-]+\\.(?:jpg|png|webp|gif)}")
    public ResponseEntity<Resource> get(@PathVariable String filename) throws IOException {
        Path image = uploadDirectory.resolve(filename).normalize();
        if (!image.getParent().equals(uploadDirectory) || !Files.isRegularFile(image)) {
            throw new ResponseStatusException(NOT_FOUND, "Image not found");
        }
        String contentType = Files.probeContentType(image);
        return ResponseEntity.ok()
                .contentType(contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType))
                .body(new UrlResource(image.toUri()));
    }
}

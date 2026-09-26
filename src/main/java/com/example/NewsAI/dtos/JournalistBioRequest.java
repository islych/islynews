package com.example.NewsAI.dtos;

import jakarta.validation.constraints.Size;

public record JournalistBioRequest(
        @Size(max = 500, message = "Bio must be 500 characters or fewer")
        String bio
) {
}

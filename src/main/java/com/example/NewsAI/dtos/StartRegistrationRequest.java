package com.example.NewsAI.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StartRegistrationRequest(
        @NotBlank @Size(min = 2, max = 50) String username,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 6, max = 100) String password) {
}

package com.example.NewsAI.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyRegistrationRequest(
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\d{4}", message = "Code must contain exactly 4 digits") String code) {
}

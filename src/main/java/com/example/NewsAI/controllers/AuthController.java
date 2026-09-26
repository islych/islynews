package com.example.NewsAI.controllers;

import com.example.NewsAI.dtos.EmailRequest;
import com.example.NewsAI.dtos.RegistrationStartedResponse;
import com.example.NewsAI.dtos.StartRegistrationRequest;
import com.example.NewsAI.dtos.VerifyRegistrationRequest;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.services.AuthService;
import com.example.NewsAI.services.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RegistrationService registrationService;

    @PostMapping("/register/start")
    public RegistrationStartedResponse startRegistration(@Valid @RequestBody StartRegistrationRequest request) {
        return registrationService.start(request);
    }

    @PostMapping("/register/verify")
    public User verifyRegistration(@Valid @RequestBody VerifyRegistrationRequest request) {
        return registrationService.verify(request.email(), request.code());
    }

    @PostMapping("/register/resend")
    public RegistrationStartedResponse resendCode(@Valid @RequestBody EmailRequest request) {
        return registrationService.resend(request.email());
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        return authService.login(user.getEmail(), user.getPassword());
    }

    @GetMapping("/me")
    public User me(Authentication auth) {
        return authService.getCurrentUser(auth.getName());
    }
}

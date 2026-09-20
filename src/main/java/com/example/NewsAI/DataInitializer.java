package com.example.NewsAI;

import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.Role;
import com.example.NewsAI.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Value("${app.bootstrap-admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail(adminEmail);
            admin.setPassword(encoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin account created for " + adminEmail);
        }
    }
}

package com.example.NewsAI.services;

import com.example.NewsAI.dtos.RegistrationStartedResponse;
import com.example.NewsAI.dtos.StartRegistrationRequest;
import com.example.NewsAI.entities.PendingRegistration;
import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.Role;
import com.example.NewsAI.repositories.PendingRegistrationRepository;
import com.example.NewsAI.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private static final Duration CODE_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESEND_DELAY = Duration.ofSeconds(60);
    private static final int MAX_ATTEMPTS = 5;
    private static final int MAX_RESENDS = 5;

    private final PendingRegistrationRepository pendingRepository;
    private final UserRepository userRepository;
    private final VerificationEmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public RegistrationStartedResponse start(StartRegistrationRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already uses this email");
        }

        String code = generateCode();
        LocalDateTime now = LocalDateTime.now();
        PendingRegistration pending = pendingRepository.findByEmailIgnoreCase(email)
                .orElseGet(PendingRegistration::new);
        pending.setEmail(email);
        pending.setUsername(request.username().strip());
        pending.setPasswordHash(encoder.encode(request.password()));
        pending.setVerificationCodeHash(encoder.encode(code));
        pending.setExpiresAt(now.plus(CODE_LIFETIME));
        pending.setLastSentAt(now);
        pending.setAttemptCount(0);
        pending.setResendCount(0);

        emailService.sendVerificationCode(email, pending.getUsername(), code);
        pendingRepository.save(pending);
        return response(email);
    }

    @Transactional
    public User verify(String rawEmail, String code) {
        String email = normalizeEmail(rawEmail);
        PendingRegistration pending = requirePending(email);
        LocalDateTime now = LocalDateTime.now();
        if (pending.getExpiresAt().isBefore(now)) {
            pendingRepository.delete(pending);
            throw new ResponseStatusException(HttpStatus.GONE, "Verification code expired");
        }
        if (pending.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many attempts. Request a new code");
        }
        if (!encoder.matches(code, pending.getVerificationCodeHash())) {
            pending.setAttemptCount(pending.getAttemptCount() + 1);
            pendingRepository.save(pending);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            pendingRepository.delete(pending);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already uses this email");
        }

        User user = new User();
        user.setUsername(pending.getUsername());
        user.setEmail(email);
        user.setPassword(pending.getPasswordHash());
        user.setRole(Role.USER);
        User saved = userRepository.save(user);
        pendingRepository.delete(pending);
        return saved;
    }

    @Transactional
    public RegistrationStartedResponse resend(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        PendingRegistration pending = requirePending(email);
        LocalDateTime now = LocalDateTime.now();
        if (pending.getLastSentAt().plus(RESEND_DELAY).isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait before requesting another code");
        }
        if (pending.getResendCount() >= MAX_RESENDS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many code requests. Start registration again later");
        }

        String code = generateCode();
        emailService.sendVerificationCode(email, pending.getUsername(), code);
        pending.setVerificationCodeHash(encoder.encode(code));
        pending.setExpiresAt(now.plus(CODE_LIFETIME));
        pending.setLastSentAt(now);
        pending.setAttemptCount(0);
        pending.setResendCount(pending.getResendCount() + 1);
        pendingRepository.save(pending);
        return response(email);
    }

    private PendingRegistration requirePending(String email) {
        return pendingRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No pending registration found"));
    }

    private String generateCode() {
        return String.format("%04d", secureRandom.nextInt(10_000));
    }

    private String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private RegistrationStartedResponse response(String email) {
        return new RegistrationStartedResponse(
                "Verification code sent", maskEmail(email), (int) CODE_LIFETIME.toSeconds());
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String maskedLocal = local.length() <= 1 ? "*" : local.charAt(0) + "***";
        return maskedLocal + email.substring(at);
    }
}

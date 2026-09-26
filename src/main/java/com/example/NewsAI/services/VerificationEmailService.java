package com.example.NewsAI.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class VerificationEmailService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:no-reply@islynews.local}")
    private String from;

    public void sendVerificationCode(String recipient, String username, String code) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (!enabled || sender == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email verification is not configured yet");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("Your Isly News verification code");
        message.setText("Hello " + username + ",\n\n"
                + "Your Isly News verification code is: " + code + "\n\n"
                + "This code expires in 10 minutes. If you did not request it, ignore this email.\n\n"
                + "Isly News");
        sender.send(message);
    }

    public void sendArticleDecision(String recipient, String username, String title, boolean approved, String reason) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (!enabled || sender == null) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(approved ? "Your Isly News article was approved" : "Corrections requested for your Isly News article");
        String decision = approved
                ? "Your article “" + title + "” has been approved and published."
                : "Your article “" + title + "” was rejected.\n\nRequested corrections: " + reason
                  + "\n\nPlease edit it and submit it again for review.";
        message.setText("Hello " + username + ",\n\n" + decision + "\n\nIsly News");
        sender.send(message);
    }
}

package com.example.NewsAI.services;

import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.Role;
import com.example.NewsAI.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public User createUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getUsername() != null) {
            existingUser.setUsername(user.getUsername());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(encoder.encode(user.getPassword()));
        }
        if (user.getBio() != null) {
            existingUser.setBio(normalizeBio(user.getBio()));
        }
        
        return userRepository.save(existingUser);
    }

    @Override
    public User updateJournalistBio(String email, String bio) {
        User journalist = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (journalist.getRole() != Role.JOURNALIST) {
            throw new RuntimeException("Only journalists can have an author bio");
        }
        journalist.setBio(normalizeBio(bio));
        return userRepository.save(journalist);
    }

    private String normalizeBio(String bio) {
        if (bio == null) return null;
        String normalized = bio.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete an admin user");
        }
        
        userRepository.deleteById(id);
    }
}

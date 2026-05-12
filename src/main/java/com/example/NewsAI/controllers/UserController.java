package com.example.NewsAI.controllers;

import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.Role;
import com.example.NewsAI.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Créer un utilisateur avec un rôle spécifique (ADMIN uniquement)
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Raccourci pour créer un journaliste (ADMIN uniquement)
    @PostMapping("/journalist")
    public User createJournalist(@RequestBody User user) {
        user.setRole(Role.JOURNALIST);
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}

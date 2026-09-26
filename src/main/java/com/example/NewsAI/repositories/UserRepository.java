package com.example.NewsAI.repositories;

import com.example.NewsAI.entities.User;
import com.example.NewsAI.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
}

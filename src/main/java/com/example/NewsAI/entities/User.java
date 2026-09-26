package com.example.NewsAI.entities;

import com.example.NewsAI.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String email;

    // Write-only: accepted on input (register), never sent in responses
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(length = 500)
    private String bio;

    @JsonIgnore
    @OneToMany(mappedBy = "author")
    private List<Article> articles;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Comment> comments;
}

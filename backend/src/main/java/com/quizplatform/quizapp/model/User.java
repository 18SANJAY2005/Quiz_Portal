package com.quizplatform.quizapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String password;
    
    @Indexed
    private String role; // e.g., "ADMIN" or "STUDENT"
    
    @Indexed
    private String email; // Added for password reset
}
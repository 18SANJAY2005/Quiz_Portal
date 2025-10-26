package com.quizplatform.quizapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "profiles")
public class Profile {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String userId;
    
    private String fullName;
    private String email;
    private String phone;
    private String institution;
}


package com.quizplatform.quizapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "results")
public class Result {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String quizId;
    
    private int score;
}
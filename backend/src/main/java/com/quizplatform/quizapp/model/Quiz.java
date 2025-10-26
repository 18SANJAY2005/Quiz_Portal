package com.quizplatform.quizapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;
    
    @Indexed
    private String title;
    
    private List<Question> questions;
    private Integer durationSeconds; // optional total duration in seconds
}
package com.quizplatform.quizapp.model;

import lombok.Data;
import java.util.List;

@Data
public class Question {
    private String questionText;
    private List<String> options;
    private int correctOption; // index of correct answer
}